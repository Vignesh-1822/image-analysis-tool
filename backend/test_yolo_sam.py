import os
import sys
import logging

logging.basicConfig(level=logging.INFO)

# ensure we can import from backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.yolo_sam import segment_image
import urllib.request

def test():
    # Download a sample shoe image
    url = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&w=800&q=80"
    print(f"Downloading test image from {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        image_bytes = response.read()

    print("Running segmentation...")
    clean_bytes = segment_image(image_bytes)
    
    if clean_bytes == image_bytes:
        print("Segmentation returned original image. Testing failed.")
        return False
        
    out_path = "test_output.jpg"
    with open(out_path, "wb") as f:
        f.write(clean_bytes)
    print(f"Saved segmented image to {out_path}")
    return True

if __name__ == "__main__":
    test()
