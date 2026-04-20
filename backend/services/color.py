import math

import cv2
import numpy as np
from skimage.color import deltaE_ciede2000, lab2rgb, rgb2lab

from models.color import ColorAnalysisResult, ColorComparisonResult, DominantColor

KMEANS_ATTEMPTS = 10
KMEANS_EPSILON = 1.0
KMEANS_MAX_ITER = 100
THUMBNAIL_SIZE = (150, 150)

PIM_COLOR_LAB: dict[str, tuple[float, float, float]] = {
    "black":   (18,  0,   0),
    "gray":    (45, -1,  -2),
    "brown":   (38,  8,  14),
    "red":     (35,  28,  16),
    "green":   (40, -12,   8),
    "white":   (88,  0,   2),
    "blue":    (32,   2, -18),
    "yellow":  (85,  -8,  80),
    "tan":     (62,   6,  18),
    "purple":  (30,  20, -25),
    "orange":  (55,  30,  35),
    "pink":    (70,  25,   5),
}

SKIP_REASONS: dict[str, str] = {
    "":             "no_data",
    "null":         "no_data",
    "n/a":          "not_applicable",
    "multicolored": "multicolored",
    "clear":        "transparent",
}

# Softmax temperature — controls how sharply scores
# drop off for wrong colors. Lower = more discriminating.
SOFTMAX_TEMPERATURE = 8.0


def _hex_to_lab(hex_color: str) -> tuple[float, float, float]:
    h = hex_color.lstrip("#")
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    lab = rgb2lab(np.array([[[r, g, b]]]))
    return float(lab[0, 0, 0]), float(lab[0, 0, 1]), float(lab[0, 0, 2])


def _lab_to_hex(L: float, a: float, b: float) -> str:
    lab = np.array([[[L, a, b]]], dtype=np.float64)
    rgb = lab2rgb(lab)
    r, g, bv = (rgb[0, 0] * 255).clip(0, 255).astype(int)
    return f"#{r:02x}{g:02x}{bv:02x}"


def _bgr_to_hex(bgr: np.ndarray) -> str:
    b, g, r = int(bgr[0]), int(bgr[1]), int(bgr[2])
    return f"#{r:02x}{g:02x}{b:02x}"


def _bgr_to_hsv(bgr: np.ndarray) -> tuple[int, int, int]:
    hsv = cv2.cvtColor(np.uint8([[bgr]]), cv2.COLOR_BGR2HSV)
    return int(hsv[0][0][0]), int(hsv[0][0][1]), int(hsv[0][0][2])


def _name_from_hsv(h: int, s: int, v: int) -> str:
    if v < 45:
        return "Black"
    if v > 210 and s < 40:
        return "White"
    if s < 40:
        return "Dark Gray" if v < 90 else "Gray" if v < 160 else "Light Gray"
    if s < 100 and v < 160:
        return "Dark Brown" if v < 80 else "Brown"
    if h <= 10 or h >= 170:
        return "Red"
    if h <= 25:
        return "Brown" if v < 150 else "Orange"
    if h <= 34:
        return "Yellow"
    if h <= 85:
        return "Green"
    if h <= 130:
        return "Blue"
    return "Purple"


def _softmax_score(
    cluster_lab: tuple[float, float, float],
    expected_color_key: str,
    temperature: float = SOFTMAX_TEMPERATURE,
) -> float:
    """
    Compute a relative match score using softmax over all known PIM colors.

    Instead of asking "how close is this cluster to expected?" in absolute
    terms, we ask "how much better does expected match vs all other colors?"

    Score = softmax probability of the expected color × 100

    This is fully dynamic — no hardcoded tolerances per color.
    Works correctly for any color combination automatically.

    Temperature controls discrimination:
    - Lower temperature → sharper distinction between colors
    - Higher temperature → more lenient, colors blend together
    """
    cluster_np = np.array(cluster_lab, dtype=np.float64)

    # Compute Delta E from this cluster to every known PIM color
    delta_es: dict[str, float] = {}
    for color_key, lab_center in PIM_COLOR_LAB.items():
        center_np = np.array(lab_center, dtype=np.float64)
        delta_es[color_key] = float(deltaE_ciede2000(cluster_np, center_np))

    # If expected color is unknown use neutral midpoint
    if expected_color_key not in delta_es:
        return 25.0  # unknown color — low confidence

    # Softmax: convert delta_e to probability
    # Lower delta_e = higher probability
    # We negate delta_e so smaller distance = larger softmax input
    keys = list(delta_es.keys())
    neg_distances = np.array([-delta_es[k] / temperature for k in keys])

    # Numerically stable softmax
    neg_distances -= neg_distances.max()
    exp_values = np.exp(neg_distances)
    softmax_probs = exp_values / exp_values.sum()

    expected_idx = keys.index(expected_color_key)
    probability = float(softmax_probs[expected_idx])

    # Scale to 0-100
    # If only one color existed probability would be 1.0 = 100
    # With 12 colors random chance = 1/12 = 8.3%
    # We scale so that probability = 1/n_colors maps to ~0
    # and probability = 1.0 maps to 100
    n_colors = len(keys)
    chance_level = 1.0 / n_colors
    score = max(0.0, (probability - chance_level) / (1.0 - chance_level)) * 100.0

    return round(score, 1)


def extract_dominant_colors(
    image_bytes: bytes,
    k: int = 3,
    mask: np.ndarray | None = None,
) -> list[DominantColor]:
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode image.")

    if mask is not None:
        image = cv2.bitwise_and(image, image, mask=mask)

    thumb = cv2.resize(image, THUMBNAIL_SIZE, interpolation=cv2.INTER_AREA)
    pixels = thumb.reshape(-1, 3).astype(np.float32)

    criteria = (
        cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER,
        KMEANS_MAX_ITER,
        KMEANS_EPSILON,
    )
    _, labels, centers = cv2.kmeans(
        pixels, k, None, criteria, KMEANS_ATTEMPTS, cv2.KMEANS_PP_CENTERS
    )

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


def compare_colors(
    dominant_colors: list[dict],
    color_name: str,
) -> ColorComparisonResult:
    """
    Compare extracted image colors against PIM primary color.

    Uses softmax scoring — fully dynamic, no hardcoded tolerances.
    Score reflects how well the expected color wins against all
    other known PIM colors, not just an absolute distance.
    """
    color_key = color_name.lower().strip() if color_name else ""

    # Handle skip cases
    if color_key in SKIP_REASONS:
        return ColorComparisonResult(
            status=SKIP_REASONS[color_key],
            target_color_name=color_name or None,
            extracted_hex=dominant_colors[0]["hex"] if dominant_colors else None,
        )

    # Determine status
    if color_key in PIM_COLOR_LAB:
        expected_lab = PIM_COLOR_LAB[color_key]
        status = "matched"
    else:
        expected_lab = (50, 0, 0)
        status = "unknown_color"

    target_hex = _lab_to_hex(*expected_lab)

    # Filter extreme clusters
    clusters = []
    for c in dominant_colors:
        lab = _hex_to_lab(c["hex"])
        if lab[0] < 10 or lab[0] > 95:
            continue
        if c["percentage"] < 0.05:
            continue
        clusters.append({
            "hex": c["hex"],
            "lab": lab,
            "percentage": c["percentage"],
        })

    if not clusters:
        clusters = [
            {
                "hex": c["hex"],
                "lab": _hex_to_lab(c["hex"]),
                "percentage": c["percentage"],
            }
            for c in dominant_colors
        ]

    # Re-normalize
    total = sum(c["percentage"] for c in clusters)
    for c in clusters:
        c["percentage"] = c["percentage"] / total

    # Score each cluster using softmax
    cluster_results = []
    for cluster in clusters:
        score = _softmax_score(cluster["lab"], color_key)

        # Delta E to expected — for display only, not used for scoring
        cluster_np = np.array(cluster["lab"], dtype=np.float64)
        expected_np = np.array(expected_lab, dtype=np.float64)
        delta_e = float(deltaE_ciede2000(cluster_np, expected_np))

        cluster_results.append({
            "hex": cluster["hex"],
            "lab": [round(v, 1) for v in cluster["lab"]],
            "percentage": round(cluster["percentage"], 4),
            "delta_e": round(delta_e, 1),
            "score": score,
        })

    # Weighted final score
    final_score = round(
        sum(r["score"] * r["percentage"] for r in cluster_results), 1
    )

    # Unknown color penalty
    if status == "unknown_color":
        final_score = round(final_score * 0.75, 1)

    # Match label
    if final_score >= 75:
        label = "Excellent"
    elif final_score >= 60:
        label = "Good"
    elif final_score >= 40:
        label = "Fair"
    elif final_score >= 20:
        label = "Poor"
    else:
        label = "Very Poor"

    closest = min(cluster_results, key=lambda r: r["delta_e"])

    return ColorComparisonResult(
        status=status,
        extracted_hex=closest["hex"],
        target_hex=target_hex,
        target_color_name=color_name,
        delta_e=closest["delta_e"],
        match_score=final_score,
        match_label=label,
        resolution_method="pim_softmax",
        tolerance_used=SOFTMAX_TEMPERATURE,
        cluster_scores=cluster_results,
    )


def analyze_image_color(
    image_bytes: bytes,
    target_color_name: str | None = None,
    k: int = 3,
) -> ColorAnalysisResult:
    dominant = extract_dominant_colors(image_bytes, k=k)
    if target_color_name:
        dominant_dicts = [
            {"hex": c.hex, "percentage": c.percentage} for c in dominant
        ]
        comparison = compare_colors(dominant_dicts, target_color_name)
    else:
        comparison = None
    return ColorAnalysisResult(dominant_colors=dominant, comparison=comparison)