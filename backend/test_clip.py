import requests

IMAGE_PATH = "/Users/vigneshr/Downloads/ImageReview/02ctlamdmb-product.jpg"
DESCRIPTION = "CertainTeed Landmark Algae Resistant Max Def Moire Black 3 Bundle Per Square"

with open(IMAGE_PATH, "rb") as f:
    image_bytes = f.read()

response = requests.post(
    "http://localhost:8000/api/analyze/clip",
    files={"file": ("02ctlamdmb-product.jpg", image_bytes, "image/jpeg")},
    data={"description": DESCRIPTION},
)

print(f"Status: {response.status_code}")
if response.status_code != 200:
    print("Error:", response.text)
    raise SystemExit(1)

r = response.json()

print(f"\ncomposite_score:              {r['composite_score']}")
print(f"verdict:                      {r['verdict']}")
print(f"verdict_note:                 {r['verdict_note']}")
print(f"\ndescription_similarity_score: {r['description_similarity_score']}")
print(f"product_type_detected:        {r['product_type_detected']}")
print(f"product_type_confidence:      {r['product_type_confidence']}")
print(f"product_type_match:           {r['product_type_match']}")

print("\nscore_breakdown:")
for key, comp in r["score_breakdown"].items():
    if comp is None:
        print(f"  {key:28s}: skipped")
    else:
        print(
            f"  {key:28s}: score={comp['score']:5.1f}  "
            f"weight={comp['weight']}  contribution={comp['contribution']:.2f}"
        )

cmp = r["color"]["comparison"]
print(f"\ncolor.comparison.resolution_method: {cmp['resolution_method']}")
print(f"color.comparison.match_score:       {cmp['match_score']}")
print(f"color.comparison.match_label:       {cmp['match_label']}")
print(f"color.comparison.extracted_hex:     {cmp['extracted_hex']}")
print(f"color.comparison.target_hex:        {cmp['target_hex']}")
print(f"color.comparison.tolerance_used:    {cmp['tolerance_used']}")
print(f"color.comparison.expected_category: {cmp['expected_category']}")
print(f"color.comparison.num_variations:    {cmp['num_variations']}")
print(f"color.comparison.clusters_filtered: {cmp['clusters_filtered']}")

print(f"\nparsed_color: {cmp['parsed_color']}")
print("\ncluster_scores:")
for cs in cmp["cluster_scores"]:
    cm = cs["category_match"]
    print(
        f"  {cs['hex']}  L={cs['lab'][0]:5.1f}  "
        f"delta_e={cs['delta_e']:5.1f}  score={cs['score']:5.1f}  "
        f"pct={cs['percentage']:.2%}  cat={cs['category']:8s}  match={cm}"
    )

print(f"\nprocessing_time_ms: {r['processing_time_ms']}")
