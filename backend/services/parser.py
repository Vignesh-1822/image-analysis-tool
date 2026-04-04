import re
from typing import Optional

from models.product import ParsedDescription


BRANDS: list[str] = [
    "CertainTeed", "Owens Corning", "GAF", "Atlas", "Tamko", "IKO", "Malarkey",
]

# Ordered longest-first so multi-word product lines match before shorter substrings
PRODUCT_LINES: list[str] = [
    "Landmark Pro", "Landmark Premium", "Landmark TL",
    "Timberline HDZ RS", "Timberline HDZ", "Timberline CS", "Timberline AS", "Timberline",
    "Duration Storm", "Duration Premium", "Duration Flex",
    "Presidential Shake TL", "Presidential TL", "Presidential Shake", "Presidential",
    "StormMaster Shake", "StormMaster Slate", "StormMaster",
    "Grand Sequoia AR", "Grand Sequoia",
    "Grand Canyon",
    "Camelot II", "Camelot",
    "Cambridge AR", "Cambridge",
    "ArmorShield II",
    "Slateline", "Oakridge", "Duration", "Landmark",
    "Dynasty", "Nordic", "Patriot", "Legacy", "Pinnacle", "Woodmoor",
]

# Ordered longest-first to capture full multi-word color names
COLORS: list[str] = [
    "Weathered Wood", "Moire Black", "Slate Gray", "Colonial Slate",
    "Pewter Gray", "Oyster Gray", "Antique Slate", "Colonial Gray",
    "Estate Gray", "Desert TAN", "Rustic Black", "Rustic Slate",
    "Rustic Cedar", "Rustic Redwood", "Rustic Hickory", "Hunter Green",
    "Mission Brown", "Copper Sun", "Aged Copper", "Georgetown Gray",
    "Heather Blend", "Fox Hollow Gray", "Resawn Shake", "Silver Birch",
    "Burnt Sienna", "Autumn Brown", "Desert Tan",
    "Barkwood", "Driftwood", "Shakewood", "Birchwood", "Charcoal", "Shadow",
]

# Ordered longest-first
STYLES: list[str] = [
    "High Definition", "Diamond-Cut", "Max Def", "Dimensional",
    "StainGuard Plus", "ArmorShield II", "ArmorShield",
]

# Ordered longest-first to avoid partial matches
FEATURES: list[str] = [
    "Algae Resistant", "Impact Resistant", "Fire Resistant", "Wind Resistant",
    "Cool Roof", "StainGuard Plus", "StainGuard", "WeatherGuard",
    "SureStart", "SureNail", "Lifetime",
]

ARCHITECTURAL_LINES: set[str] = {
    "Landmark", "Landmark Pro", "Landmark Premium", "Landmark TL",
    "Timberline HDZ", "Timberline HDZ RS", "Timberline CS", "Timberline AS", "Timberline",
    "Duration", "Duration Storm", "Duration Premium", "Duration Flex",
    "Presidential", "Presidential Shake", "Presidential TL", "Presidential Shake TL",
    "Oakridge", "Dynasty", "Nordic", "Cambridge", "Cambridge AR",
    "Camelot", "Camelot II", "Grand Sequoia", "Grand Sequoia AR",
    "Grand Canyon", "Slateline", "StormMaster", "StormMaster Shake", "StormMaster Slate",
    "Pinnacle", "Woodmoor",
}

THREE_TAB_LINES: set[str] = {"Patriot", "Legacy"}

QUANTITY_PATTERNS: list[str] = [
    r"\d+\s+Bundles?\s+Per\s+Square",
    r"\d+\s+Squares?\s+Per\s+Bundle",
    r"\d+\s+Sq(?:uare)?s?\s+Per\s+Bundle",
    r"\d+\s+Bundles?\s+\/\s+Square",
]


def _find_first(text: str, candidates: list[str]) -> Optional[str]:
    """Return the first candidate found in text (case-insensitive), preserving candidate casing."""
    for candidate in candidates:
        if re.search(re.escape(candidate), text, re.IGNORECASE):
            return candidate
    return None


def _find_all(text: str, candidates: list[str]) -> list[str]:
    """Return all candidates found in text, preserving candidate casing."""
    found: list[str] = []
    consumed = ""
    for candidate in candidates:
        pattern = re.escape(candidate)
        if re.search(pattern, text, re.IGNORECASE) and candidate.lower() not in consumed:
            found.append(candidate)
            consumed += candidate.lower() + " "
    return found


def _classify_product_type(
    text: str,
    product_line: Optional[str],
) -> str:
    low = text.lower()
    if re.search(r"\bridg[e]?\s*cap\b", low):
        return "ridge_cap"
    if re.search(r"\bflashing\b", low):
        return "metal_flashing"
    if re.search(r"\bunderlayment\b|\bfelt\b|\bsynth\b", low):
        return "underlayment"
    if re.search(r"\b3[\s-]?tab\b", low):
        return "3tab_shingle"
    if product_line in THREE_TAB_LINES:
        return "3tab_shingle"
    if re.search(r"\barchitectural\b|\bdimensional\b", low):
        return "architectural_shingle"
    if product_line in ARCHITECTURAL_LINES:
        return "architectural_shingle"
    return "unknown"


def _extract_quantity(text: str) -> Optional[str]:
    for pattern in QUANTITY_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0)
    return None


def parse_product_description(description: str) -> ParsedDescription:
    brand = _find_first(description, BRANDS)
    product_line = _find_first(description, PRODUCT_LINES)
    color = _find_first(description, COLORS)
    style = _find_first(description, STYLES)
    features = _find_all(description, FEATURES)
    product_type = _classify_product_type(description, product_line)
    quantity_info = _extract_quantity(description)

    return ParsedDescription(
        brand=brand,
        product_line=product_line,
        color=color,
        style=style,
        features=features,
        product_type=product_type,
        quantity_info=quantity_info,
    )
