import cv2
import numpy as np

from models.color import ColorAnalysisResult, ColorComparisonResult, DominantColor

# Common shingle color reference palette for Delta E comparison
COLOR_REFERENCE: dict[str, str] = {
    "Moire Black":    "#2C2C2C",
    "Charcoal":       "#36454F",
    "Weathered Wood": "#6B5B45",
    "Slate Gray":     "#484C4F",
    "Driftwood":      "#8B7355",
    "Barkwood":       "#5C4A32",
    "Pewter Gray":    "#8E9190",
    "Antique Silver": "#9E9E9E",
    "Heather Blend":  "#7B6F72",
    "Colonial Slate": "#6B7280",
}

KMEANS_ATTEMPTS = 10
KMEANS_EPSILON = 1.0
KMEANS_MAX_ITER = 100
# Resize to thumbnail before K-means — full resolution adds no accuracy for color sampling
THUMBNAIL_SIZE = (150, 150)


def _hex_to_bgr(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return (b, g, r)


def _bgr_to_hex(bgr: np.ndarray) -> str:
    b, g, r = int(bgr[0]), int(bgr[1]), int(bgr[2])
    return f"#{r:02x}{g:02x}{b:02x}"


def _bgr_to_hsv(bgr: np.ndarray) -> tuple[int, int, int]:
    hsv = cv2.cvtColor(np.uint8([[bgr]]), cv2.COLOR_BGR2HSV)
    return int(hsv[0][0][0]), int(hsv[0][0][1]), int(hsv[0][0][2])


def _name_from_hsv(h: int, s: int, v: int) -> str:
    # OpenCV HSV: H=0-179, S=0-255, V=0-255
    if v < 45:
        return "Black"
    if v > 210 and s < 40:
        return "White"
    if s < 40:
        if v < 90:
            return "Dark Gray"
        elif v < 160:
            return "Gray"
        else:
            return "Light Gray"
    if s < 100 and v < 160:
        return "Dark Brown" if v < 80 else "Brown"
    if h <= 10 or h >= 170:
        return "Red"
    elif h <= 25:
        return "Brown" if v < 150 else "Orange"
    elif h <= 34:
        return "Yellow"
    elif h <= 85:
        return "Green"
    elif h <= 130:
        return "Blue"
    else:
        return "Purple"


def _bgr_to_lab(bgr: tuple[int, int, int]) -> tuple[float, float, float]:
    lab = cv2.cvtColor(np.uint8([[[bgr[0], bgr[1], bgr[2]]]]), cv2.COLOR_BGR2LAB)
    return float(lab[0][0][0]), float(lab[0][0][1]), float(lab[0][0][2])


def _delta_e(lab1: tuple[float, float, float], lab2: tuple[float, float, float]) -> float:
    # CIE76 Euclidean distance in LAB — perceptually uniform, no extra dependencies
    return float(np.sqrt(sum((a - b) ** 2 for a, b in zip(lab1, lab2))))


def _delta_e_to_score(delta_e: float) -> float:
    # Linear interpolation within bands: ΔE 0-5 → 95-100, 5-10 → 80-95, 10-20 → 50-80, 20+ → 0-50
    if delta_e <= 5:
        return 95.0 + (5.0 - delta_e) / 5.0 * 5.0
    elif delta_e <= 10:
        return 80.0 + (10.0 - delta_e) / 5.0 * 15.0
    elif delta_e <= 20:
        return 50.0 + (20.0 - delta_e) / 10.0 * 30.0
    else:
        return max(0.0, 50.0 - (delta_e - 20.0) * 2.0)


def _resolve_target_color(name: str) -> tuple[str, str] | None:
    lower = name.lower()
    # Exact match first, then fuzzy keyword match
    for ref_name, hex_val in COLOR_REFERENCE.items():
        if ref_name.lower() == lower:
            return (ref_name, hex_val)
    for ref_name, hex_val in COLOR_REFERENCE.items():
        if all(word in lower for word in ref_name.lower().split()):
            return (ref_name, hex_val)
    return None


def extract_dominant_colors(
    image_bytes: bytes,
    k: int = 3,
    mask: np.ndarray | None = None,
) -> list[DominantColor]:
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode image — unsupported format or corrupted file.")

    if mask is not None:
        image = cv2.bitwise_and(image, image, mask=mask)

    # INTER_AREA averages pixel blocks when shrinking — preserves color accuracy
    thumb = cv2.resize(image, THUMBNAIL_SIZE, interpolation=cv2.INTER_AREA)
    pixels = thumb.reshape(-1, 3).astype(np.float32)

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, KMEANS_MAX_ITER, KMEANS_EPSILON)
    # KMEANS_PP_CENTERS seeding gives better convergence than random init
    _, labels, centers = cv2.kmeans(pixels, k, None, criteria, KMEANS_ATTEMPTS, cv2.KMEANS_PP_CENTERS)

    counts = np.bincount(labels.flatten(), minlength=k)
    total = len(labels.flatten())

    return [
        DominantColor(
            hex=_bgr_to_hex(centers[i]),
            percentage=round(float(counts[i]) / total, 4),
            color_name=_name_from_hsv(*_bgr_to_hsv(centers[i])),
        )
        for i in np.argsort(counts)[::-1]
    ]


def compare_colors(extracted_hex: str, target_color_name: str) -> ColorComparisonResult:
    resolved = _resolve_target_color(target_color_name)
    if resolved is None:
        raise ValueError(
            f"Color '{target_color_name}' not found. "
            f"Known colors: {', '.join(COLOR_REFERENCE.keys())}"
        )
    canonical_name, target_hex = resolved

    de = round(_delta_e(_bgr_to_lab(_hex_to_bgr(extracted_hex)), _bgr_to_lab(_hex_to_bgr(target_hex))), 2)
    score = round(_delta_e_to_score(de), 1)

    if score >= 90:
        label = "Excellent"
    elif score >= 75:
        label = "Good"
    elif score >= 50:
        label = "Fair"
    else:
        label = "Poor"

    return ColorComparisonResult(
        extracted_hex=extracted_hex,
        target_hex=target_hex,
        target_color_name=canonical_name,
        delta_e=de,
        match_score=score,
        match_label=label,
    )


def analyze_image_color(
    image_bytes: bytes,
    target_color_name: str | None = None,
    k: int = 3,
) -> ColorAnalysisResult:
    dominant = extract_dominant_colors(image_bytes, k=k)
    comparison = compare_colors(dominant[0].hex, target_color_name) if target_color_name else None
    return ColorAnalysisResult(dominant_colors=dominant, comparison=comparison)
