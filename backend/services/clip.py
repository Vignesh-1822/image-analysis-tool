import io
import time

import torch
from PIL import Image
from transformers import CLIPModel, CLIPProcessor

from models.clip import CLIPAnalysisResult, ScoreBreakdown, ScoreComponent
from models.product import ParsedDescription
from services.color import analyze_image_color
from services.image_downloader import download_image
from services.quality import analyze_image_quality

MODEL_NAME = "openai/clip-vit-base-patch32"

_model: CLIPModel | None = None
_processor: CLIPProcessor | None = None


def get_clip_model() -> tuple[CLIPModel, CLIPProcessor]:
    global _model, _processor
    if _model is None:
        _processor = CLIPProcessor.from_pretrained(MODEL_NAME)
        _model = CLIPModel.from_pretrained(MODEL_NAME)
        _model.eval()
    return _model, _processor


def classify_product_type(image_bytes: bytes, hierarchy: str) -> dict[str, object]:
    model, processor = get_clip_model()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = processor(text=[hierarchy], images=image, return_tensors="pt", padding=True)

    with torch.no_grad():
        outputs = model(**inputs)

    confidence = round(float(outputs.logits_per_image.softmax(dim=-1)[0][0]) * 100, 2)
    is_match = confidence >= 50
    score = 80.0 if is_match else 20.0

    return {
        "detected_type": hierarchy,
        "confidence": confidence,
        "product_type_match": is_match,
        "product_type_score": score,
    }


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
        if valid[lowest] >= 60:
            return "Good match — all criteria met satisfactorily."
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
    image_bytes: bytes | None,
    hierarchy: str,
    image_url: str | None = None,
    primary_color: str | None = None,
    target_color: str | None = None,
) -> CLIPAnalysisResult:
    if image_bytes is None and image_url:
        image_bytes = download_image(image_url)
    if image_bytes is None:
        return CLIPAnalysisResult(
            composite_score=0.0,
            score_breakdown=ScoreBreakdown(product_type=None, color_match=None, image_quality=None),
            product_type_detected="Unknown",
            product_type_match=False,
            quality=None,
            color=None,
            verdict="Replace",
            verdict_note="Image could not be downloaded from CDN URL",
            model_used="CLIP ViT-B/32",
            processing_time_ms=0.0,
        )

    start = time.time()

    # ── Step 1: CLIP zero-shot product type classification ────────────────────
    pt_result = classify_product_type(image_bytes, hierarchy)
    product_type_detected = str(pt_result["detected_type"])
    is_match = bool(pt_result["product_type_match"])
    pt_score = float(pt_result["product_type_score"])

    # ── Step 2: Image quality ─────────────────────────────────────────────────
    quality = analyze_image_quality(image_bytes)
    quality_score = quality.overall_score

    # ── Step 3: Color extraction and matching ─────────────────────────────────
    color_name = primary_color or target_color
    color_source = "pim" if primary_color else "description"
    color = analyze_image_color(image_bytes, target_color_name=color_name, source=color_source)

    color_score: float | None = None
    if color.comparison is not None and color.comparison.match_score is not None:
        color_score = color.comparison.match_score

    # ── Step 4: Composite score ───────────────────────────────────────────────
    if color_score is not None:
        composite = round(
            pt_score      * 0.40 +
            color_score   * 0.35 +
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
        color_name=color_name,
        extracted_hex=extracted_hex,
    )

    return CLIPAnalysisResult(
        composite_score=composite,
        score_breakdown=breakdown,
        product_type_detected=product_type_detected,
        product_type_match=is_match,
        quality=quality,
        color=color,
        verdict=verdict,
        verdict_note=verdict_note,
        model_used="CLIP ViT-B/32",
        processing_time_ms=round((time.time() - start) * 1000, 1),
    )
