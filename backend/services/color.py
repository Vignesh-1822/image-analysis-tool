import math
import re

import cv2
import numpy as np
from skimage.color import deltaE_ciede2000, lab2rgb, rgb2lab

from models.color import ColorAnalysisResult, ColorComparisonResult, DominantColor

# ── Constants ─────────────────────────────────────────────────────────────────

KMEANS_ATTEMPTS = 10
KMEANS_EPSILON = 1.0
KMEANS_MAX_ITER = 100
THUMBNAIL_SIZE = (150, 150)

_STRIP_WORDS = {
    "certainteed", "gaf", "owens", "corning", "tamko", "iko", "atlas",
    "landmark", "timberline", "duration", "oakridge", "dynasty", "presidential",
    "algae", "resistant", "bundle", "per", "square", "shingle", "shingles",
    "roofing", "siding", "architectural", "dimensional", "premium", "limited",
    "lifetime", "warranty", "class", "impact", "hip", "ridge", "cap", "starter",
    "strip", "vinyl", "asphalt", "hdz", "hd", "def", "max",
}

_BASE_COLORS: dict[str, set[str]] = {
    "black": {"black", "noir", "onyx", "ebony", "jet"},
    "gray":  {"gray", "grey", "silver", "pewter", "ash", "smoke", "slate",
              "steel", "graphite", "charcoal"},
    "brown": {"brown", "sienna", "wood", "bark", "walnut", "cedar", "hickory",
              "chestnut", "teak", "oak", "timber", "mahogany", "barkwood"},
    "tan":   {"tan", "sand", "beige", "wheat", "buff", "driftwood", "straw", "adobe"},
    "red":   {"red", "rust", "crimson", "garnet", "burgundy", "copper", "rustic", "terracotta"},
    "green": {"green", "moss", "forest", "sage", "hunter", "olive", "fern"},
    "blue":  {"blue", "navy", "denim", "cobalt", "ocean", "pacific", "harbor", "biscayne"},
    "white": {"white", "cream", "ivory", "birch", "snow", "frost", "pearl", "platinum"},
}

_MODIFIER_COLORS: dict[str, set[str]] = {
    "dark":      {"dark", "deep", "shadow", "night", "midnight"},
    "light":     {"light", "pale", "soft", "bright", "pastel"},
    "warm":      {"warm", "sunset", "autumn", "harvest", "golden"},
    "cool":      {"cool", "arctic", "winter", "colonial"},
    "weathered": {"weathered", "aged", "vintage", "antique", "heritage"},
    "blend":     {"blend", "mix", "moire", "heather", "variegated", "multi", "dimensional"},
}

_KEYWORD_LAB_OVERRIDES: dict[str, tuple[float, float, float]] = {
    "charcoal":  (28,  0,  -1),
    "graphite":  (35,  0,   0),
    "slate":     (42, -1,  -4),
    "pewter":    (60, -1,  -1),
    "silver":    (72,  0,  -1),
    "ash":       (65,  0,   0),
    "navy":      (18,  5, -25),
    "cream":     (88,  1,  10),
    "ivory":     (90,  0,   8),
    "cedar":     (38, 14,  22),
    "walnut":    (30, 10,  16),
    "mahogany":  (28, 18,  14),
    "rust":      (35, 30,  25),
    "burgundy":  (22, 28,   8),
    "sage":      (55, -10, 10),
    "olive":     (45, -8,  18),
    "driftwood": (55,  6,  14),
    "sand":      (72,  5,  20),
}

_FAMILY_LAB_CENTERS: dict[str, tuple[float, float, float]] = {
    "black":   (20,  0,   0),
    "gray":    (55,  0,   0),
    "brown":   (40, 12,  18),
    "tan":     (65,  8,  22),
    "red":     (38, 35,  18),
    "green":   (42, -18, 12),
    "blue":    (35,  2, -22),
    "white":   (92,  0,   2),
    "unknown": (50,  0,   0),
}

_MODIFIER_SHIFTS: dict[str, dict[str, float]] = {
    "dark":      {"L": -15},
    "light":     {"L": +15},
    "warm":      {"b": +8,  "a": +4},
    "cool":      {"b": -8,  "a": -2},
    "weathered": {"L": +8,  "a": -2, "b": -2},
    # "blend" intentionally omitted — handled via tolerance + variation range only
}

_COMPATIBLE_CATEGORIES: dict[str, list[str]] = {
    "black":   ["gray", "brown"],
    "gray":    ["black", "white", "blue"],
    "white":   ["gray"],
    "brown":   ["tan", "red", "black"],
    "tan":     ["brown", "gray"],
    "red":     ["brown"],
    "green":   ["blue"],
    "blue":    ["green", "gray"],
}


# ── Low-level helpers ─────────────────────────────────────────────────────────

def _clamp(val: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, val))


def _hex_to_lab(hex_color: str) -> tuple[float, float, float]:
    """Convert hex color to standard CIE LAB (L: 0-100, a/b: ~-128..127) via skimage."""
    h = hex_color.lstrip("#")
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    lab = rgb2lab(np.array([[[r, g, b]]]))
    return float(lab[0, 0, 0]), float(lab[0, 0, 1]), float(lab[0, 0, 2])


def _lab_to_hex(L: float, a: float, b: float) -> str:
    """Convert standard LAB to hex color via skimage."""
    lab = np.array([[[L, a, b]]], dtype=np.float64)
    rgb = lab2rgb(lab)
    r, g, bv = (rgb[0, 0] * 255).clip(0, 255).astype(int)
    return f"#{r:02x}{g:02x}{bv:02x}"


# Kept for extract_dominant_colors (OpenCV K-means pipeline)
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


# ── Pipeline: Step 1 ─────────────────────────────────────────────────────────

def parse_color_text(color_name: str) -> dict:
    """
    Extract base color and modifiers from a product color name string.
    Strips brand/product words, then matches base color first, modifiers second.
    """
    text = re.sub(r"\d+", "", color_name.lower())
    words = [w for w in text.split() if w and w not in _STRIP_WORDS]

    base = "unknown"
    matched_keyword: str | None = None
    remaining_words = list(words)

    for base_name, keywords in _BASE_COLORS.items():
        for word in words:
            if word in keywords:
                base = base_name
                matched_keyword = word
                remaining_words = [w for w in words if w != word]
                break
        if base != "unknown":
            break

    modifiers: list[str] = []
    modifier_words: list[str] = []
    for mod_name, mod_keywords in _MODIFIER_COLORS.items():
        for word in remaining_words:
            if word in mod_keywords and mod_name not in modifiers:
                modifiers.append(mod_name)
                modifier_words.append(word)

    return {
        "base": base,
        "matched_keyword": matched_keyword,
        "modifiers": modifiers,
        "modifier_words": modifier_words,
        "raw": color_name,
    }


# ── Pipeline: Step 2 ─────────────────────────────────────────────────────────

def generate_lab_center(parsed: dict) -> tuple[float, float, float]:
    """Compute the expected LAB center for a parsed color description."""
    keyword = parsed.get("matched_keyword")
    if keyword and keyword in _KEYWORD_LAB_OVERRIDES:
        L, a, b = _KEYWORD_LAB_OVERRIDES[keyword]
    else:
        L, a, b = _FAMILY_LAB_CENTERS[parsed["base"]]

    L, a, b = float(L), float(a), float(b)

    for mod in parsed["modifiers"]:
        shifts = _MODIFIER_SHIFTS.get(mod, {})
        L += shifts.get("L", 0.0)
        a += shifts.get("a", 0.0)
        b += shifts.get("b", 0.0)

    return (
        _clamp(L, 0.0, 100.0),
        _clamp(a, -128.0, 127.0),
        _clamp(b, -128.0, 127.0),
    )


# ── Pipeline: Step 3 ─────────────────────────────────────────────────────────

def generate_lab_variations(
    center: tuple[float, float, float],
    parsed: dict,
) -> list[tuple[float, float, float]]:
    """Generate a cloud of LAB target points around the center."""
    is_blend = "blend" in parsed.get("modifiers", [])

    if is_blend:
        L_offsets = [-10, -5, 0, 5, 10]
        a_offsets = [-4, 0, 4]
        b_offsets = [-4, 0, 4]
    else:
        L_offsets = [-6, 0, 6]
        a_offsets = [-3, 0, 3]
        b_offsets = [-3, 0, 3]

    cL, ca, cb = center
    seen: set[tuple[float, float, float]] = set()
    variations: list[tuple[float, float, float]] = []

    for dL in L_offsets:
        for da in a_offsets:
            for db in b_offsets:
                v = (
                    _clamp(cL + dL, 0.0, 100.0),
                    _clamp(ca + da, -128.0, 127.0),
                    _clamp(cb + db, -128.0, 127.0),
                )
                if v not in seen:
                    seen.add(v)
                    variations.append(v)

    return variations


# ── Pipeline: Step 4 ─────────────────────────────────────────────────────────

def get_tolerance(parsed: dict, center_L: float) -> float:
    """Compute Delta E tolerance based on color modifiers and base family."""
    tol = 18.0

    if "blend" in parsed.get("modifiers", []):
        tol += 5.0
    if "moire" in parsed.get("modifier_words", []):
        tol += 3.0
    if "heather" in parsed.get("modifier_words", []):
        tol += 5.0
    if "weathered" in parsed.get("modifiers", []):
        tol += 3.0

    if parsed["base"] == "unknown":
        tol += 10.0
    elif parsed["base"] in ("black", "white"):
        tol -= 3.0

    if center_L < 30:
        tol += 5.0  # dark products photograph lighter under studio lighting

    return _clamp(tol, 10.0, 40.0)


# ── Pipeline: Step 5 ─────────────────────────────────────────────────────────

def classify_lab_category(lab: tuple[float, float, float]) -> str:
    """Classify a standard LAB point into a named color category."""
    L, a, b = lab
    saturation = math.sqrt(a ** 2 + b ** 2)

    if saturation < 10:
        if L < 25:
            return "black"
        if L > 80:
            return "white"
        return "gray"

    if L < 25 and saturation < 15:
        return "black"

    hue = math.degrees(math.atan2(b, a))
    if hue < 0:
        hue += 360

    if 0 <= hue < 50:
        return "tan" if L > 55 else "brown"
    if 50 <= hue < 80:
        return "tan"
    if 80 <= hue < 165:
        return "green"
    if 165 <= hue < 265:
        return "blue"
    if 265 <= hue < 345:
        return "red" if a > 15 else "brown"
    return "red"


# ── Pipeline: Step 6 ─────────────────────────────────────────────────────────

def filter_and_normalize_clusters(
    dominant_colors: list[dict],
) -> list[dict]:
    """
    Remove specular/shadow extremes and tiny noise clusters, re-normalize,
    and annotate each cluster with LAB and category.
    """
    result = []
    for c in dominant_colors:
        lab = _hex_to_lab(c["hex"])
        L = lab[0]
        if L < 10 or L > 95:
            continue
        if c["percentage"] < 0.05:
            continue
        result.append({"hex": c["hex"], "lab": lab, "percentage": c["percentage"]})

    if not result:  # safety: never return empty
        result = [
            {"hex": c["hex"], "lab": _hex_to_lab(c["hex"]), "percentage": c["percentage"]}
            for c in dominant_colors
        ]

    total = sum(r["percentage"] for r in result)
    for r in result:
        r["percentage"] = r["percentage"] / total
        r["category"] = classify_lab_category(r["lab"])

    return result


# ── Pipeline: Step 7 ─────────────────────────────────────────────────────────

def gaussian_score(delta_e: float, tolerance: float) -> float:
    score = 100.0 * math.exp(-(delta_e ** 2) / (2.0 * tolerance ** 2))
    return round(score, 1)


# ── Pipeline: Step 8 — main entry point ──────────────────────────────────────

def compare_colors(dominant_colors: list[dict], color_name: str) -> ColorComparisonResult:
    """
    Full semantic LAB pipeline.
    dominant_colors: list of {"hex": str, "percentage": float}
    """
    parsed = parse_color_text(color_name)
    expected_lab = generate_lab_center(parsed)
    variations = generate_lab_variations(expected_lab, parsed)
    tolerance = get_tolerance(parsed, expected_lab[0])

    clusters = filter_and_normalize_clusters(dominant_colors)
    clusters_filtered = len(dominant_colors) - len(clusters)

    expected_category = parsed["base"]
    variations_np = [np.array(v, dtype=np.float64) for v in variations]

    cluster_results: list[dict] = []
    for cluster in clusters:
        cluster_lab_np = np.array(cluster["lab"], dtype=np.float64)

        best_de = float("inf")
        for v_np in variations_np:
            de = float(deltaE_ciede2000(cluster_lab_np, v_np))
            if de < best_de:
                best_de = de

        score = gaussian_score(best_de, tolerance)

        # Category penalty
        category_match: bool | None = None
        if expected_category != "unknown":
            compatible = _COMPATIBLE_CATEGORIES.get(expected_category, [])
            if cluster["category"] == expected_category:
                category_match = True
            elif cluster["category"] in compatible:
                score = round(score * 0.7, 1)
                category_match = True
            else:
                score = round(score * 0.2, 1)
                category_match = False

        cluster_results.append({
            "hex": cluster["hex"],
            "lab": [round(v, 1) for v in cluster["lab"]],
            "percentage": round(cluster["percentage"], 4),
            "delta_e": round(best_de, 1),
            "score": score,
            "category": cluster["category"],
            "category_match": category_match,
        })

    final_score = sum(r["score"] * r["percentage"] for r in cluster_results)

    if parsed["base"] == "unknown":
        final_score *= 0.75

    final_score = round(final_score, 1)

    closest = min(cluster_results, key=lambda r: r["delta_e"])

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

    target_hex = _lab_to_hex(*expected_lab)

    return ColorComparisonResult(
        extracted_hex=closest["hex"],
        target_hex=target_hex,
        target_color_name=color_name,
        delta_e=closest["delta_e"],
        match_score=final_score,
        match_label=label,
        resolution_method="semantic_lab",
        parsed_color=parsed,
        tolerance_used=tolerance,
        cluster_scores=cluster_results,
        expected_category=expected_category,
        num_variations=len(variations),
        clusters_filtered=clusters_filtered,
    )


# ── Public API ────────────────────────────────────────────────────────────────

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


def analyze_image_color(
    image_bytes: bytes,
    target_color_name: str | None = None,
    k: int = 3,
) -> ColorAnalysisResult:
    dominant = extract_dominant_colors(image_bytes, k=k)
    if target_color_name:
        dominant_dicts = [{"hex": c.hex, "percentage": c.percentage} for c in dominant]
        comparison = compare_colors(dominant_dicts, target_color_name)
    else:
        comparison = None
    return ColorAnalysisResult(dominant_colors=dominant, comparison=comparison)
