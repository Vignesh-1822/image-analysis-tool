import cv2
import numpy as np

from models.quality import BlurResult, FramingResult, QualityResult, ResolutionResult

# Laplacian variance thresholds for sharpness classification
BLUR_SHARP_THRESHOLD = 100
BLUR_SLIGHT_THRESHOLD = 50

# Minimum dimension for CLIP/YOLO model input quality
RESOLUTION_MIN = 720
RESOLUTION_HIGH = 1920
RESOLUTION_4K = 3840

FRAMING_CENTERED_THRESHOLD = 0.15
FRAMING_SLIGHT_THRESHOLD = 0.30

# Composite score weights — blur penalised most as it degrades embeddings hardest
WEIGHT_BLUR = 0.40
WEIGHT_RESOLUTION = 0.35
WEIGHT_FRAMING = 0.25


def _analyze_blur(gray: np.ndarray) -> BlurResult:
    # CV_64F preserves negative Laplacian values; variance of result measures edge sharpness
    score = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    if score >= BLUR_SHARP_THRESHOLD:
        label = "Sharp"
    elif score >= BLUR_SLIGHT_THRESHOLD:
        label = "Slightly Blurry"
    else:
        label = "Blurry"

    return BlurResult(score=round(score, 2), is_blurry=score < BLUR_SHARP_THRESHOLD, label=label)


def _analyze_resolution(image: np.ndarray) -> ResolutionResult:
    height, width = image.shape[:2]

    if width >= RESOLUTION_4K or height >= RESOLUTION_4K:
        label = "4K Native"
    elif width >= RESOLUTION_HIGH or height >= RESOLUTION_HIGH:
        label = "High Res"
    elif width >= RESOLUTION_MIN and height >= RESOLUTION_MIN:
        label = "Sufficient"
    else:
        label = "Low Res"

    return ResolutionResult(
        width=width,
        height=height,
        is_sufficient=(width >= RESOLUTION_MIN and height >= RESOLUTION_MIN),
        label=label,
    )


def _analyze_framing(gray: np.ndarray) -> FramingResult:
    height, width = gray.shape[:2]

    # Otsu auto-threshold; THRESH_BINARY_INV makes foreground white for contour detection
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        # No product detected — fail open rather than blocking valid solid-background shots
        return FramingResult(centroid_offset=0.0, is_centered=True, label="Centered")

    moments = cv2.moments(max(contours, key=cv2.contourArea))

    if moments["m00"] == 0:
        return FramingResult(centroid_offset=0.0, is_centered=True, label="Centered")

    centroid_x = moments["m10"] / moments["m00"]
    centroid_y = moments["m01"] / moments["m00"]

    offset_x = abs(centroid_x - width / 2) / (width / 2)
    offset_y = abs(centroid_y - height / 2) / (height / 2)
    offset = float(max(offset_x, offset_y))

    if offset < FRAMING_CENTERED_THRESHOLD:
        label = "Centered"
    elif offset < FRAMING_SLIGHT_THRESHOLD:
        label = "Slightly Off"
    else:
        label = "Off-Center"

    return FramingResult(
        centroid_offset=round(offset, 4),
        is_centered=offset < FRAMING_SLIGHT_THRESHOLD,
        label=label,
    )


def _composite_score(blur: BlurResult, resolution: ResolutionResult, framing: FramingResult) -> tuple[float, str]:
    # Normalise each dimension to 0-100 before weighting
    blur_norm = min(blur.score, 200.0) / 200.0 * 100.0
    res_norm = min(min(resolution.width, resolution.height) / RESOLUTION_MIN * 100.0, 100.0)
    frame_norm = (1.0 - framing.centroid_offset) * 100.0

    overall = round(max(0.0, min(100.0, (
        blur_norm * WEIGHT_BLUR
        + res_norm * WEIGHT_RESOLUTION
        + frame_norm * WEIGHT_FRAMING
    ))), 1)

    if overall >= 85:
        label = "Excellent"
    elif overall >= 70:
        label = "Good"
    elif overall >= 50:
        label = "Fair"
    else:
        label = "Poor"

    return overall, label


def analyze_image_quality(image_bytes: bytes) -> QualityResult:
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Could not decode image — unsupported format or corrupted file.")

    # Convert once, reuse for both blur and framing
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    blur = _analyze_blur(gray)
    resolution = _analyze_resolution(image)
    framing = _analyze_framing(gray)
    overall_score, overall_label = _composite_score(blur, resolution, framing)

    return QualityResult(
        blur=blur,
        resolution=resolution,
        framing=framing,
        overall_score=overall_score,
        overall_label=overall_label,
    )
