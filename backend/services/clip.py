import io
import time

import torch
from PIL import Image
from transformers import CLIPModel, CLIPProcessor

from models.clip import CLIPAnalysisResult, ScoreBreakdown, ScoreComponent
from models.product import ParsedDescription
from services.color import analyze_image_color
from services.quality import analyze_image_quality

MODEL_NAME = "openai/clip-vit-base-patch32"

_model: CLIPModel | None = None
_processor: CLIPProcessor | None = None

CANDIDATE_LABELS = [
    "architectural shingle roof material",
    "3-tab shingle roof material",
    "ridge cap roofing",
    "metal roof flashing",
    "roof underlayment",
    "wood siding panel",
    "brick wall",
    "concrete surface",
]

LABEL_MAP: dict[str, str] = {
    "architectural shingle roof material": "architectural shingle",
    "3-tab shingle roof material":         "3-tab shingle",
    "ridge cap roofing":                   "ridge cap",
    "metal roof flashing":                 "metal flashing",
    "roof underlayment":                   "underlayment",
    "wood siding panel":                   "non-product",
    "brick wall":                          "non-product",
    "concrete surface":                    "non-product",
}

_SHINGLE_TYPES = {"architectural shingle", "3-tab shingle", "ridge cap"}
_PRODUCT_TYPE_GROUPS: dict[str, set[str]] = {
    "shingle":               _SHINGLE_TYPES,
    "architectural shingle": {"architectural shingle"},
    "3-tab shingle":         {"3-tab shingle"},
    "ridge cap":             {"ridge cap"},
    "flashing":              {"metal flashing"},
    "underlayment":          {"underlayment"},
}


def get_clip_model() -> tuple[CLIPModel, CLIPProcessor]:
    global _model, _processor
    if _model is None:
        _processor = CLIPProcessor.from_pretrained(MODEL_NAME)
        _model = CLIPModel.from_pretrained(MODEL_NAME)
        _model.eval()
    return _model, _processor


def classify_product_type(image_bytes: bytes) -> dict[str, str | float]:
    """Zero-shot CLIP classification against candidate roofing product labels."""
    model, processor = get_clip_model()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = processor(text=CANDIDATE_LABELS, images=image, return_tensors="pt", padding=True)

    with torch.no_grad():
        outputs = model(**inputs)

    probs = outputs.logits_per_image.softmax(dim=-1)[0]
    best_idx = int(probs.argmax().item())

    return {
        "label": LABEL_MAP[CANDIDATE_LABELS[best_idx]],
        "confidence": round(float(probs[best_idx]) * 100, 2),
    }


def _product_type_match(
    detected_label: str,
    detected_confidence: float,
    parsed: ParsedDescription,
) -> tuple[bool, float]:
    """
    Returns (is_match, product_type_score).
    Match → fixed score of 80.
    Mismatch → max(0, 100 - confidence) to penalise high-confidence wrong detections.
    """
    if parsed.product_type == "unknown":
        return True, 80.0

    pt = parsed.product_type.lower()
    detected = detected_label.lower()

    expected_group: set[str] | None = None
    for key, group in _PRODUCT_TYPE_GROUPS.items():
        if key in pt or pt in key:
            expected_group = group
            break

    if expected_group is None:
        return True, 80.0

    if detected in expected_group:
        return True, 80.0

    return False, round(max(0.0, 100.0 - detected_confidence), 2)


def _build_verdict_note(
    composite: float,
    component_scores: dict[str, float | None],
    color_name: str | None,
    extracted_hex: str | None,
) -> str:
    valid = {k: v for k, v in component_scores.items() if v is not None}
    if not valid:
        return "Analysis could not be completed."

    lowest = min(valid, key=lambda k: valid[k])

    if composite >= 90:
        return "Strong match — image meets all specification criteria."

    if composite >= 75:
        if lowest == "color_match":
            return (
                f"Good match — color variance detected. "
                f"Verify '{color_name}' against extracted {extracted_hex}."
            )
        if lowest == "image_quality":
            return (
                "Good match — image quality is limiting. "
                "Consider a higher resolution capture."
            )
        return (
            "Good match — product type confidence is moderate. "
            "Manual verification recommended."
        )

    if composite >= 50:
        if lowest == "product_type":
            return (
                "Partial match — detected product type does not align with specification. "
                "Manual review required."
            )
        if lowest == "color_match":
            return (
                "Partial match — significant color mismatch detected. "
                "Verify this is the correct color variant."
            )
        return (
            "Partial match — image quality is too low for reliable analysis. "
            "Replace with a higher quality image."
        )

    return (
        "Poor match — image does not meet specification criteria. "
        "Replace with a correct product image."
    )


def _component(score: float, weight: float) -> ScoreComponent:
    return ScoreComponent(score=score, weight=weight, contribution=round(score * weight, 2))


def analyze_with_clip(
    image_bytes: bytes,
    description: str,
    parsed_description: ParsedDescription,
) -> CLIPAnalysisResult:
    start = time.time()

    # ── Step 1: CLIP zero-shot product type classification ────────────────────
    pt_result = classify_product_type(image_bytes)
    product_type_detected = str(pt_result["label"])
    product_type_confidence = float(pt_result["confidence"])

    is_match, pt_score = _product_type_match(
        product_type_detected, product_type_confidence, parsed_description
    )

    # ── Step 2: Image quality ─────────────────────────────────────────────────
    quality = analyze_image_quality(image_bytes)
    quality_score = quality.overall_score

    # ── Step 3: Color extraction and matching ─────────────────────────────────
    color = analyze_image_color(image_bytes, target_color_name=parsed_description.color)

    color_score: float | None = None
    if color.comparison is not None and color.comparison.match_score is not None:
        color_score = color.comparison.match_score

    # ── Step 4: Composite score ───────────────────────────────────────────────
    if color_score is not None:
        composite = round(
            pt_score     * 0.40 +
            color_score  * 0.35 +
            quality_score * 0.25,
            1,
        )
        breakdown = ScoreBreakdown(
            product_type=_component(pt_score, 0.40),
            color_match=_component(color_score, 0.35),
            image_quality=_component(quality_score, 0.25),
        )
    else:
        composite = round(
            pt_score      * 0.55 +
            quality_score * 0.45,
            1,
        )
        breakdown = ScoreBreakdown(
            product_type=_component(pt_score, 0.55),
            color_match=None,
            image_quality=_component(quality_score, 0.45),
        )

    # ── Verdict ───────────────────────────────────────────────────────────────
    if composite >= 75:
        verdict = "Approved"
    elif composite >= 50:
        verdict = "Catalog Only"
    else:
        verdict = "Replace"

    # ── Verdict note ──────────────────────────────────────────────────────────
    component_scores: dict[str, float | None] = {
        "product_type": pt_score,
        "color_match":  color_score,
        "image_quality": quality_score,
    }
    extracted_hex = color.dominant_colors[0].hex if color.dominant_colors else None
    verdict_note = _build_verdict_note(
        composite, component_scores,
        color_name=parsed_description.color,
        extracted_hex=extracted_hex,
    )

    return CLIPAnalysisResult(
        composite_score=composite,
        score_breakdown=breakdown,
        product_type_detected=product_type_detected,
        product_type_confidence=product_type_confidence,
        product_type_match=is_match,
        quality=quality,
        color=color,
        verdict=verdict,
        verdict_note=verdict_note,
        model_used="CLIP ViT-B/32",
        processing_time_ms=round((time.time() - start) * 1000, 1),
    )
