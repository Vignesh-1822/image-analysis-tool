import io
import time
import cv2
import numpy as np
from PIL import Image
from ultralytics import YOLO, SAM
import logging

from models.clip import ScoreComponent
from models.combined import YoloSamAnalysisResult, YoloScoreBreakdown
from services.color import analyze_image_color
from services.quality import analyze_image_quality

logger = logging.getLogger(__name__)

# Initialize models globally so they're kept in memory
try:
    yolo_model = YOLO("yolov8n.pt")
    # UltraLytics supports SAM2 directly. Models: sam2_t.pt, sam2_s.pt, sam2_b.pt, sam2_l.pt
    sam_model = SAM("sam2_b.pt") 
except Exception as e:
    logger.error(f"Failed to load YOLO or SAM models: {e}")
    yolo_model = None
    sam_model = None


def _component(score: float, weight: float) -> ScoreComponent:
    return ScoreComponent(
        score=score,
        weight=weight,
        contribution=round(score * weight, 2),
    )


def _build_verdict_note(
    composite: float,
    object_detected: bool,
    product_type_match: bool,
    color_name: str | None,
    extracted_hex: str | None,
    status: str,
) -> str:
    if status in ("error", "skipped", "sam_failed", "sam_empty"):
        return f"Pipeline could not complete segmentation (status: {status.replace('_', ' ')})."

    if status == "skipped_no_object":
        if composite >= 75:
            return "Full-frame texture detected — image quality and color meet criteria."
        return "Full-frame texture detected — review color and quality metrics."

    if not object_detected:
        return "No product object detected in the image. Manual review required."

    if composite >= 90:
        return "Strong match — detection, color, and quality all meet criteria."

    if composite >= 75:
        return "Good match — product detected with satisfactory color and quality."

    if composite >= 50:
        if not product_type_match:
            return "Partial match — detected object may not match expected product category."
        return (
            f"Partial match — review color alignment. "
            f"Verify '{color_name}' against extracted {extracted_hex}."
            if color_name and extracted_hex
            else "Partial match — review flagged metrics before approving."
        )

    return "Poor match — detection confidence or image metrics are too low. Replace image."


def segment_image(image_bytes: bytes) -> tuple[bytes, dict]:
    """
    Takes original image bytes, detects the primary object using YOLO, 
    segments it from the background using SAM2, and returns the cropped, 
    transparent background image bytes and a report dictionary.
    """
    default_report = {"status": "skipped", "reason": "models_missing"}
    if yolo_model is None or sam_model is None:
        logger.warning("Models not loaded properly, skipping segmentation.")
        return image_bytes, default_report

    try:
        # 1. Convert bytes to cv2 image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            logger.error("Failed to decode image.")
            return image_bytes, {"status": "error", "reason": "decode_failed"}

        # 2. Get bounding boxes from YOLO
        results = yolo_model(img, verbose=False)
        boxes = results[0].boxes
        
        report = {"status": "success", "object_detected": False, "class_name": "none", "confidence": 0.0, "mask_area_percent": 0.0}

        if len(boxes) == 0:
            logger.info("YOLO found no objects. Assuming full-frame texture.")
            report["status"] = "skipped_no_object"
            report["class_name"] = "none"
            report["confidence"] = 0.0
            report["mask_area_percent"] = 100.0
            return image_bytes, report
        else:
            # Find the bounding box with the highest confidence
            best_box = max(boxes, key=lambda b: b.conf[0].item())
            bbox_xyxy = best_box.xyxy[0].tolist()
            report["object_detected"] = True
            report["confidence"] = round(float(best_box.conf[0].cpu().numpy()) * 100, 2)
            cls_id = int(best_box.cls[0].cpu().numpy())
            report["class_name"] = yolo_model.names.get(cls_id, str(cls_id))

        # 3. Use SAM2 with the bounding box to get a precise mask
        sam_results = sam_model(img, bboxes=bbox_xyxy, verbose=False)

        
        if not sam_results or not hasattr(sam_results[0], 'masks') or sam_results[0].masks is None:
            logger.info("SAM found no mask, returning original image.")
            report["status"] = "sam_failed"
            return image_bytes, report

        masks = sam_results[0].masks.data.cpu().numpy()
        if len(masks) == 0:
            report["status"] = "sam_empty"
            return image_bytes, report
            
        # The mask is boolean or 0/1 array. We take the first mask corresponding to our bbox
        mask = masks[0]
        report["mask_area_percent"] = round(float(mask.sum() / (mask.shape[0] * mask.shape[1])) * 100, 2)
        
        # Resize mask to original image shape if necessary
        if mask.shape != img.shape[:2]:
            mask = cv2.resize(mask, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_NEAREST)

        # 4. Apply mask to create a transparent background image
        # Create an RGBA image
        b, g, r = cv2.split(img)
        rgba = [r, g, b, (mask * 255).astype(np.uint8)]
        img_rgba = cv2.merge(rgba)

        # 5. Crop the image to the bounding box to remove excess transparency
        x1, y1, x2, y2 = map(int, bbox_xyxy)
        
        # Add a small margin
        margin = 20
        h, w = img_rgba.shape[:2]
        x1 = max(0, x1 - margin)
        y1 = max(0, y1 - margin)
        x2 = min(w, x2 + margin)
        y2 = min(h, y2 + margin)
        
        cropped_rgba = img_rgba[y1:y2, x1:x2]

        # Convert back to PIL and then to bytes
        pil_img = Image.fromarray(cropped_rgba, "RGBA")
        
        # Create a white background version if the downstream model doesn't support alpha channel well (like some CLIP tools)
        # We will create a white background here, because JPEGs are common for CLIP
        white_bg = Image.new("RGB", pil_img.size, (255, 255, 255))
        white_bg.paste(pil_img, mask=pil_img.split()[3]) # use alpha channel as mask

        output_io = io.BytesIO()
        # Save as JPEG which is widely supported and smaller
        white_bg.save(output_io, format="JPEG", quality=95)
        
        return output_io.getvalue(), report

    except Exception as e:
        logger.error(f"Error during segmentation: {e}", exc_info=True)
        return image_bytes, {"status": "error", "reason": str(e)}


def analyze_with_yolo_sam(
    image_bytes: bytes,
    hierarchy: str | None = None,
    primary_color: str | None = None,
) -> tuple[bytes, YoloSamAnalysisResult]:
    """
    Full YOLO+SAM2 analysis pipeline.
    
    1. Segment image using YOLO + SAM2
    2. Run image quality analysis
    3. Run color extraction & matching
    4. Compute composite score with weighted breakdown
    5. Generate verdict

    Returns (segmented_image_bytes, full_result).
    """
    start = time.time()

    # Step 1 — Segment
    segmented_bytes, report = segment_image(image_bytes)

    status = report.get("status", "error")
    object_detected = bool(report.get("object_detected", False))
    class_name = report.get("class_name")
    confidence = float(report.get("confidence", 0.0))
    mask_area_percent = float(report.get("mask_area_percent", 0.0))

    # Step 2 — Image quality (on the ORIGINAL image, not segmented)
    try:
        quality = analyze_image_quality(image_bytes)
        quality_score = quality.overall_score
    except Exception as e:
        logger.error(f"Quality analysis failed: {e}")
        quality = None
        quality_score = 50.0  # neutral fallback

    # Step 3 — Color analysis (on the original image)
    color_name = primary_color
    try:
        color = analyze_image_color(image_bytes, target_color_name=color_name)
    except Exception as e:
        logger.error(f"Color analysis failed: {e}")
        color = None

    color_comparison = color.comparison if color else None
    color_available = (
        color_comparison is not None
        and color_comparison.status == "matched"
        and color_comparison.match_score is not None
    )

    # Step 4 — Detection score
    # For "skipped_no_object" (full-frame textures), detection is still valid
    if status == "skipped_no_object":
        detection_score = 80.0  # full-frame textures are valid products
    elif object_detected:
        detection_score = min(confidence, 100.0)
    else:
        detection_score = 0.0

    # Product type match heuristic:
    # - If hierarchy is provided and YOLO class overlaps with known product categories, match
    # - For roofing, most YOLO classes won't match, but full-frame textures are always valid
    product_type_match = False
    product_type_detected = hierarchy or "Unknown"

    if status == "skipped_no_object":
        product_type_match = True  # full-frame texture = valid roofing product pattern
    elif object_detected and hierarchy:
        # YOLO generic classes won't match roofing terms, but detection proves
        # there IS a product in the image. The hierarchy from the database
        # tells us what it should be.
        product_type_match = True
        product_type_detected = hierarchy

    # Step 5 — Composite score
    if color_available:
        color_score = color_comparison.match_score
        composite = round(
            detection_score * 0.40
            + color_score * 0.35
            + quality_score * 0.25,
            1,
        )
        breakdown = YoloScoreBreakdown(
            detection=_component(detection_score, 0.40),
            color_match=_component(color_score, 0.35),
            image_quality=_component(quality_score, 0.25),
        )
    else:
        composite = round(
            detection_score * 0.55
            + quality_score * 0.45,
            1,
        )
        breakdown = YoloScoreBreakdown(
            detection=_component(detection_score, 0.55),
            color_match=None,
            image_quality=_component(quality_score, 0.45),
        )

    # Step 6 — Verdict
    if composite >= 75:
        verdict = "Approved"
    elif composite >= 50:
        verdict = "Catalog Only"
    else:
        verdict = "Replace"

    extracted_hex = (
        color.dominant_colors[0].hex if color and color.dominant_colors else None
    )
    verdict_note = _build_verdict_note(
        composite, object_detected, product_type_match,
        color_name, extracted_hex, status,
    )

    elapsed = round((time.time() - start) * 1000, 1)

    result = YoloSamAnalysisResult(
        status=status,
        object_detected=object_detected,
        class_name=class_name,
        confidence=confidence,
        mask_area_percent=mask_area_percent,
        composite_score=composite,
        score_breakdown=breakdown,
        product_type_detected=product_type_detected,
        product_type_match=product_type_match,
        quality=quality,
        color=color,
        verdict=verdict,
        verdict_note=verdict_note,
        model_used="YOLOv8n + SAM2-B",
        processing_time_ms=elapsed,
    )

    return segmented_bytes, result
