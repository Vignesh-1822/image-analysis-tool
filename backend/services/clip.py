import io
import time

import torch
from PIL import Image
from transformers import CLIPModel, CLIPProcessor

from models.clip import CLIPAnalysisResult
from models.product import ParsedDescription
from services.color import analyze_image_color
from services.quality import analyze_image_quality

MODEL_NAME = "openai/clip-vit-base-patch32"

# Module-level cache — model loads once per process
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


def get_clip_model() -> tuple[CLIPModel, CLIPProcessor]:
    global _model, _processor
    if _model is None:
        _processor = CLIPProcessor.from_pretrained(MODEL_NAME)
        _model = CLIPModel.from_pretrained(MODEL_NAME)
        _model.eval()
    return _model, _processor


def compute_similarity(image_bytes: bytes, description: str) -> float:
    model, processor = get_clip_model()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    inputs = processor(text=[description], images=image, return_tensors="pt", padding=True)

    with torch.no_grad():
        outputs = model(**inputs)

    # Normalise embeddings before computing cosine similarity
    img_emb = outputs.image_embeds / outputs.image_embeds.norm(dim=-1, keepdim=True)
    txt_emb = outputs.text_embeds / outputs.text_embeds.norm(dim=-1, keepdim=True)

    # Cosine similarity is in [-1, 1]; clamp negatives to 0 then scale to 0-100
    similarity = (img_emb @ txt_emb.T).item()
    return round(max(0.0, similarity) * 100, 2)


def classify_product_type(image_bytes: bytes) -> dict[str, str | float]:
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


def _determine_verdict(similarity: float, quality_score: float) -> tuple[str, str]:
    if similarity >= 75 and quality_score >= 70:
        return (
            "Approved",
            f"Image closely matches description ({similarity:.0f}% similarity) with sufficient quality ({quality_score:.0f}/100).",
        )
    if similarity >= 50 or quality_score >= 50:
        if similarity < 75 and quality_score >= 70:
            reason = f"Quality is acceptable ({quality_score:.0f}/100) but description match is weak ({similarity:.0f}% similarity)."
        elif similarity >= 75 and quality_score < 70:
            reason = f"Image matches description ({similarity:.0f}% similarity) but quality is below threshold ({quality_score:.0f}/100)."
        else:
            reason = f"Image partially matches description ({similarity:.0f}% similarity, quality {quality_score:.0f}/100) — suitable for catalog use only."
        return ("Catalog Only", reason)
    return (
        "Replace",
        f"Image does not match description ({similarity:.0f}% similarity) and quality is insufficient ({quality_score:.0f}/100).",
    )


def analyze_with_clip(
    image_bytes: bytes,
    description: str,
    parsed_description: ParsedDescription,
) -> CLIPAnalysisResult:
    start = time.time()

    similarity = compute_similarity(image_bytes, description)
    product_type_result = classify_product_type(image_bytes)
    quality = analyze_image_quality(image_bytes)
    color = analyze_image_color(image_bytes, target_color_name=parsed_description.color)

    verdict, verdict_reason = _determine_verdict(similarity, quality.overall_score)

    return CLIPAnalysisResult(
        similarity_score=similarity,
        product_type_detected=str(product_type_result["label"]),
        product_type_confidence=float(product_type_result["confidence"]),
        quality=quality,
        color=color,
        verdict=verdict,
        verdict_reason=verdict_reason,
        model_used="CLIP ViT-B/32",
        processing_time_ms=round((time.time() - start) * 1000, 1),
    )
