"""
Image quality analysis service.

Analyses three independent quality dimensions — blur, resolution, and framing —
then combines them into a single composite score. Each dimension is explained
in detail at the point where it is computed.
"""

import cv2
import numpy as np

from models.quality import BlurResult, FramingResult, QualityResult, ResolutionResult


# ---------------------------------------------------------------------------
# Blur thresholds
# ---------------------------------------------------------------------------
# WHY 100 as the sharp threshold?
#   Real-world testing on product photography shows that Laplacian variance
#   below ~50 is visibly soft to a human reviewer, 50-99 is borderline, and
#   100+ reliably corresponds to images where fine texture (shingle granules,
#   tile grout) is crisply resolved. The number is image-content-dependent
#   (a plain white wall will always score low regardless of focus), but for
#   textured building-product photography it is a stable cut-off.
BLUR_SHARP_THRESHOLD = 100
BLUR_SLIGHT_THRESHOLD = 50

# ---------------------------------------------------------------------------
# Resolution thresholds (pixels)
# ---------------------------------------------------------------------------
# 800px minimum: below this, fine product details (color blend, surface
# texture) are lost and AI feature-extraction models produce noisier
# embeddings. 800 is the smallest dimension used by most CLIP variants.
RESOLUTION_MIN = 800
RESOLUTION_HIGH = 1920   # 1080p long edge — typical professional product photo
RESOLUTION_4K = 3840     # 4K long edge

# ---------------------------------------------------------------------------
# Framing thresholds (normalised offset, 0.0 – 1.0)
# ---------------------------------------------------------------------------
FRAMING_CENTERED_THRESHOLD = 0.15
FRAMING_SLIGHT_THRESHOLD = 0.30

# ---------------------------------------------------------------------------
# Composite score weights (must sum to 1.0)
# ---------------------------------------------------------------------------
# Rationale:
#   Blur (0.40) — the single biggest enemy of AI feature extraction; a blurry
#     image degrades CLIP embeddings far more than being slightly off-centre.
#   Resolution (0.35) — low-res images lose texture information that
#     distinguishes similar products (e.g. Charcoal vs Pewter shingles).
#   Framing (0.25) — off-centre is less damaging than blur/low-res because
#     CLIP is somewhat translation-invariant, but badly cropped images can
#     truncate the product and confuse segmentation models.
WEIGHT_BLUR = 0.40
WEIGHT_RESOLUTION = 0.35
WEIGHT_FRAMING = 0.25


# ---------------------------------------------------------------------------
# Blur detection
# ---------------------------------------------------------------------------

def _analyze_blur(gray: np.ndarray) -> BlurResult:
    """
    Measure image sharpness using the variance of the Laplacian operator.

    WHY LAPLACIAN VARIANCE (not FFT, not Tenengrad, not BRISQUE)?
      The Laplacian is a second-order derivative operator that responds
      strongly to rapid intensity changes (edges, texture) and weakly to
      smooth regions. Blurry images have their high-frequency content
      attenuated — edges become gradual ramps rather than sharp transitions —
      so the Laplacian response is small everywhere.

      Taking the *variance* (not the mean) captures how spread-out the
      edge responses are across the image. A sharp image has many strong
      responses mixed with near-zero flat regions → high variance. A blurry
      image has uniformly small responses everywhere → low variance.

      FFT-based methods are equally accurate but ~3-5× slower for large
      images. Tenengrad (Sobel-based) is comparable but slightly less
      sensitive to out-of-focus blur specifically. BRISQUE requires a
      trained model. Laplacian variance hits the sweet spot of accuracy,
      speed, and zero external dependencies.

    WHAT DOES THE NUMBER PHYSICALLY MEAN?
      It is the statistical variance of the pixel-wise second derivatives.
      For an 8-bit image (0-255) the Laplacian values range roughly from
      -1020 to +1020. A variance of 100 means the standard deviation of
      those derivatives is 10 intensity units — enough to reliably detect
      an edge. A variance of 5 means the whole image is nearly flat in
      gradient space, i.e. blurry.

    Args:
        gray: Single-channel (grayscale) uint8 numpy array.

    Returns:
        BlurResult with raw score, boolean flag, and human-readable label.
    """
    # cv2.Laplacian returns a float64 array of second derivatives.
    # ddepth=cv2.CV_64F ensures we don't clip negative values to zero,
    # which would hide half the edge information.
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)

    # variance() on the full array is equivalent to mean(x²) - mean(x)²
    score = float(laplacian.var())

    if score >= BLUR_SHARP_THRESHOLD:
        label = "Sharp"
    elif score >= BLUR_SLIGHT_THRESHOLD:
        label = "Slightly Blurry"
    else:
        label = "Blurry"

    return BlurResult(
        score=round(score, 2),
        is_blurry=score < BLUR_SHARP_THRESHOLD,
        label=label,
    )


# ---------------------------------------------------------------------------
# Resolution check
# ---------------------------------------------------------------------------

def _analyze_resolution(image: np.ndarray) -> ResolutionResult:
    """
    Classify image resolution from its pixel dimensions.

    We use the *original* loaded image (not the grayscale copy) so that
    shape always reflects the true sensor resolution, not a conversion
    artefact. For a colour image shape is (H, W, C), for grayscale (H, W).

    WHY 800px MINIMUM?
      Most CLIP ViT variants (ViT-B/32, ViT-L/14) resize their input to
      224px or 336px, but the resize quality depends heavily on the source
      resolution. Downscaling from 800px to 224px preserves structural
      detail; downscaling from 300px introduces heavy aliasing. Additionally,
      YOLO models used for product segmentation perform poorly below ~640px.

    Args:
        image: The original decoded numpy array (BGR or grayscale).

    Returns:
        ResolutionResult with dimensions, sufficiency flag, and label.
    """
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


# ---------------------------------------------------------------------------
# Framing / composition check
# ---------------------------------------------------------------------------

def _analyze_framing(gray: np.ndarray) -> FramingResult:
    """
    Estimate how well the product is centred in the frame.

    ALGORITHM — WHY OTSU + CONTOURS?
      We need to locate the product blob without knowing anything about its
      colour or shape. Otsu's method automatically finds the optimal binary
      threshold by maximising inter-class variance between the two pixel
      populations (product vs background). This is more robust than a fixed
      threshold across different lighting conditions and product colours.

      After binarisation we find contours and pick the largest one — this
      corresponds to the main product body (small blobs from noise or
      background texture are discarded). The centroid is computed from the
      raw image moments M, which are simply weighted sums of pixel
      coordinates:
          centroid_x = M["m10"] / M["m00"]   (sum of x * intensity / area)
          centroid_y = M["m01"] / M["m00"]   (sum of y * intensity / area)

    HOW THE OFFSET IS NORMALISED:
      We subtract the frame centre (width/2, height/2) from the centroid,
      take the absolute value, and divide by the half-dimension. This maps
      the result to [0.0, 1.0] where:
        0.0 = centroid is exactly at the frame centre
        1.0 = centroid is at the left/right or top/bottom edge
      We take the maximum of the x and y offsets so that a product pushed
      far to one side in either axis is penalised equally.

    WHY NOT USE SALIENCY OR FACE DETECTION?
      Saliency models add latency and a dependency on a pre-trained network.
      Face detection is irrelevant for product photography. The contour
      centroid approach is instantaneous and sufficient for our use case:
      detecting obviously off-centre product shots before they enter the
      more expensive CLIP / SAM2 pipeline.

    Fallback:
      If no contours are found (e.g. a solid-colour image) we return a
      centroid_offset of 0.0 and treat the image as centred — failing open
      is safer than blocking valid solid-background product shots.

    Args:
        gray: Single-channel (grayscale) uint8 numpy array.

    Returns:
        FramingResult with normalised offset, boolean flag, and label.
    """
    height, width = gray.shape[:2]

    # Otsu thresholding: automatically computes the optimal threshold.
    # THRESH_BINARY_INV inverts so the product foreground becomes white
    # (value 255), which is the convention contour-finding expects.
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # RETR_EXTERNAL retrieves only the outermost contours — we don't need
    # holes or inner contours of the product.
    # CHAIN_APPROX_SIMPLE compresses horizontal/vertical/diagonal segments
    # down to their endpoints, saving memory without losing shape info.
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        # No contours detected — treat as perfectly centred (fail open).
        return FramingResult(centroid_offset=0.0, is_centered=True, label="Centered")

    # Largest contour by area = the main product body.
    largest = max(contours, key=cv2.contourArea)

    # Image moments: M["m00"] is the zeroth moment (total area/mass),
    # M["m10"] and M["m01"] are the first moments used to find the centroid.
    moments = cv2.moments(largest)

    if moments["m00"] == 0:
        # Degenerate contour (zero area) — fail open.
        return FramingResult(centroid_offset=0.0, is_centered=True, label="Centered")

    centroid_x = moments["m10"] / moments["m00"]
    centroid_y = moments["m01"] / moments["m00"]

    # Normalise offset to [0.0, 1.0] independently for each axis.
    offset_x = abs(centroid_x - width / 2) / (width / 2)
    offset_y = abs(centroid_y - height / 2) / (height / 2)

    # Worst-axis offset determines the final label.
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


# ---------------------------------------------------------------------------
# Composite score
# ---------------------------------------------------------------------------

def _composite_score(blur: BlurResult, resolution: ResolutionResult, framing: FramingResult) -> tuple[float, str]:
    """
    Combine the three sub-scores into a single 0-100 quality score.

    NORMALISATION STRATEGY:
      Each dimension produces a different native range, so we map each to
      [0, 100] before applying weights:

      Blur score:
        We cap the raw Laplacian variance at 200 (anything above that is
        comfortably sharp) and scale linearly. This avoids a single
        extremely sharp image inflating the score unrealistically.
            blur_norm = min(raw_score, 200) / 200 * 100

      Resolution score:
        We use the smaller of width/height (the bottleneck dimension) and
        cap at 4K (3840px). This rewards higher resolution proportionally
        but doesn't over-reward unnecessarily large images.
            res_norm = min(min_dim, 3840) / 3840 * 100

      Framing score:
        Offset is already in [0.0, 1.0] where 0 is best. We invert it so
        that 0.0 offset → 100 points and 1.0 offset → 0 points.
            frame_norm = (1.0 - offset) * 100

    WEIGHT RATIONALE — see module-level constants for the full explanation.

    Args:
        blur: BlurResult from _analyze_blur.
        resolution: ResolutionResult from _analyze_resolution.
        framing: FramingResult from _analyze_framing.

    Returns:
        Tuple of (score: float, label: str).
    """
    blur_norm = min(blur.score, 200.0) / 200.0 * 100.0
    res_norm = min(min(resolution.width, resolution.height), 3840) / 3840.0 * 100.0
    frame_norm = (1.0 - framing.centroid_offset) * 100.0

    overall = (
        blur_norm * WEIGHT_BLUR
        + res_norm * WEIGHT_RESOLUTION
        + frame_norm * WEIGHT_FRAMING
    )
    overall = round(max(0.0, min(100.0, overall)), 1)

    if overall >= 85:
        label = "Excellent"
    elif overall >= 70:
        label = "Good"
    elif overall >= 50:
        label = "Fair"
    else:
        label = "Poor"

    return overall, label


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def analyze_image_quality(image_bytes: bytes) -> QualityResult:
    """
    Run all quality checks on a raw image and return a structured result.

    Decodes the bytes with OpenCV (supports JPEG, PNG, WebP, TIFF, BMP),
    then runs blur, resolution, and framing checks in sequence. Each check
    receives only what it needs: resolution uses the full colour image to
    preserve the original shape; blur and framing both operate on a single
    shared grayscale conversion so we only pay that cost once.

    Args:
        image_bytes: Raw bytes of the uploaded image file.

    Returns:
        QualityResult containing all sub-results and the composite score.

    Raises:
        ValueError: If the bytes cannot be decoded as a valid image.
    """
    # np.frombuffer creates a 1-D array view of the bytes without copying.
    # cv2.imdecode interprets that buffer as an encoded image file.
    # IMREAD_COLOR forces a 3-channel BGR output regardless of source format.
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Could not decode image — unsupported format or corrupted file.")

    # Convert to grayscale once and reuse across blur and framing checks.
    # COLOR_BGR2GRAY uses the standard luminosity weights
    # (Y = 0.114B + 0.587G + 0.299R) which align with human perception.
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
