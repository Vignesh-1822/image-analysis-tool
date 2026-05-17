FROM python:3.10-slim

WORKDIR /app

# System libraries required by OpenCV and PyTorch
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps before copying code (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Pre-download CLIP from HuggingFace (baked into image → fast startup)
RUN python -c "\
from transformers import CLIPModel, CLIPProcessor; \
CLIPModel.from_pretrained('openai/clip-vit-base-patch32'); \
CLIPProcessor.from_pretrained('openai/clip-vit-base-patch32')"

# Pre-download YOLO + SAM2 weights to WORKDIR (/app) so relative paths resolve at runtime
RUN python -c "from ultralytics import YOLO, SAM; YOLO('yolov8n.pt'); SAM('sam2_b.pt')"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
