import base64
import json
import os
import re
import time

import openai

from models.ai_model import AIModelAnalysisResult, AIScoreBreakdown
from models.clip import ScoreComponent
from models.color import ColorAnalysisResult
from services.image_downloader import download_image
from services.quality import analyze_image_quality

_client: openai.OpenAI | None = None


def _get_client() -> openai.OpenAI:
    global _client
    if _client is None:
        _client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _client


_SYSTEM_PROMPT = (
    "You are a product image analyst for a building materials company. "
    "You validate product images against their specifications. "
    "Respond only with valid JSON — no text outside the JSON."
)


def _detect_media_type(image_bytes: bytes) -> str:
    if image_bytes[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if image_bytes[:4] == b"\x89PNG":
        return "image/png"
    return "image/jpeg"


def _build_user_prompt(parsed: dict, hierarchy: str | None = None) -> str:
    brand = parsed.get("brand") or "Not specified"
    product_line = parsed.get("product_line") or "Not specified"
    color = parsed.get("color") or "Not specified"
    features = parsed.get("features") or []
    product_category = hierarchy or parsed.get("product_type") or "unknown"
    features_str = ", ".join(features) if features else "None"

    return f"""Analyze this product image against the specification below.

PRODUCT SPECIFICATION:
Brand: {brand}
Product Line: {product_line}
Color: {color}
Features: {features_str}
Product Category: {product_category}

Respond with exactly this JSON structure:
{{
  "product_type_match": true or false,
  "product_type_detected": "what product type you see",
  "color_match": true or false,
  "color_detected": "color you observe in the image",
  "is_correct_product": true or false,
  "overall_match_score": 0-100,
  "reasoning": "two to three sentences explaining your analysis",
  "issues": ["list specific issues, empty array if none"],
  "verdict_reason": "one sentence"
}}"""


def _parse_gpt_response(raw: str) -> dict:
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Could not parse GPT response as JSON: {raw!r}") from exc


def _build_verdict_note(
    composite: float,
    issues: list[str],
    product_type_match: bool,
    color_match: bool,
) -> str:
    if composite >= 90:
        return "Strong match — image meets all specification criteria."

    if composite >= 75:
        if issues:
            return f"Good match — {issues[0]}"
        return "Good match — all criteria met satisfactorily."

    if composite >= 50:
        if not product_type_match:
            return (
                "Partial match — product type does not align with specification. "
                "Manual review required."
            )
        if not color_match:
            return (
                "Partial match — color mismatch detected. "
                "Verify this is the correct color variant."
            )
        return (
            "Partial match — review flagged issues before approving for master data."
        )

    return (
        "Poor match — image does not meet specification criteria. "
        "Replace with a correct product image."
    )


def _component(score: float, weight: float) -> ScoreComponent:
    return ScoreComponent(
        score=score,
        weight=weight,
        contribution=round(score * weight, 2),
    )


def analyze_with_ai(
    image_bytes: bytes | None,
    parsed_description: dict,
    image_url: str | None = None,
    primary_color: str | None = None,
    hierarchy: str | None = None,
    color_result: ColorAnalysisResult | None = None,
) -> AIModelAnalysisResult:
    if image_bytes is None and image_url:
        image_bytes = download_image(image_url)
    if image_bytes is None:
        raise ValueError("Image could not be downloaded from CDN URL")

    start = time.time()

    # Step 1 — Image quality; reuse color result from CLIP if provided
    quality = analyze_image_quality(image_bytes)
    if color_result is None:
        from services.color import compare_colors, extract_dominant_colors
        dominant_colors = extract_dominant_colors(image_bytes)
        color_name: str | None = primary_color or parsed_description.get("color")
        color_comparison = compare_colors(
            [{"hex": c.hex, "percentage": c.percentage} for c in dominant_colors],
            color_name,
        ) if color_name else None
        color_result = ColorAnalysisResult(
            dominant_colors=dominant_colors,
            comparison=color_comparison,
        )

    # Step 2 — Build OpenAI request
    media_type = _detect_media_type(image_bytes)
    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    response = _get_client().chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=1000,
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{media_type};base64,{base64_image}",
                            "detail": "low",
                        },
                    },
                    {
                        "type": "text",
                        "text": _build_user_prompt(parsed_description, hierarchy),
                    },
                ],
            },
        ],
    )

    # Step 3 — Parse response
    raw = response.choices[0].message.content or ""
    gpt = _parse_gpt_response(raw)

    ai_overall = float(gpt.get("overall_match_score", 50))
    quality_score = quality.overall_score

    # Step 4 — Composite score
    color_comparison = color_result.comparison
    color_available = (
        color_comparison is not None
        and color_comparison.status == "matched"
        and color_comparison.match_score is not None
    )

    if color_available:
        color_score = color_comparison.match_score
        composite = round(
            ai_overall    * 0.50 +
            color_score   * 0.25 +
            quality_score * 0.25,
            1,
        )
        breakdown = AIScoreBreakdown(
            ai_analysis=_component(ai_overall, 0.50),
            color_match=_component(color_score, 0.25),
            image_quality=_component(quality_score, 0.25),
        )
    else:
        color_score = None
        composite = round(
            ai_overall    * 0.65 +
            quality_score * 0.35,
            1,
        )
        breakdown = AIScoreBreakdown(
            ai_analysis=_component(ai_overall, 0.65),
            color_match=None,
            image_quality=_component(quality_score, 0.35),
        )

    product_type_match = bool(gpt.get("product_type_match", False))
    color_match_flag = bool(gpt.get("color_match", False))
    issues: list[str] = gpt.get("issues") or []

    # Step 5 — Verdict always from our composite score
    # GPT's verdict_reason is kept as context but we decide the verdict
    if composite >= 75:
        verdict = "Approved"
    elif composite >= 50:
        verdict = "Catalog Only"
    else:
        verdict = "Replace"

    verdict_note = _build_verdict_note(
        composite, issues, product_type_match, color_match_flag
    )

    return AIModelAnalysisResult(
        composite_score=composite,
        score_breakdown=breakdown,
        product_type_match=product_type_match,
        product_type_detected=str(gpt.get("product_type_detected", "")),
        color_match=color_match_flag,
        color_detected=str(gpt.get("color_detected", "")),
        is_correct_product=bool(gpt.get("is_correct_product", False)),
        overall_match_score=ai_overall,
        reasoning=str(gpt.get("reasoning", "")),
        issues=issues,
        quality=quality,
        color=color_result,
        verdict=verdict,
        verdict_reason=str(gpt.get("verdict_reason", "")),
        verdict_note=verdict_note,
        model_used="gpt-4o-mini",
        processing_time_ms=round((time.time() - start) * 1000, 1),
    )