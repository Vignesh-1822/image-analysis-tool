# Image Analysis Tool — Backend

FastAPI backend that validates product images against PIM specifications using CLIP (zero-shot classification), GPT-4o-mini (visual reasoning), and algorithmic color matching.

## Requirements

- Python 3.10+
- PostgreSQL database
- OpenAI API key

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
OPENAI_API_KEY=sk-...
```

## Run

```bash
uvicorn main:app --reload
```

API runs at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

## Key Versions

| Package | Version |
|---------|---------|
| Python | 3.10 |
| FastAPI | 0.135 |
| Uvicorn | 0.43 |
| SQLAlchemy | 2.0 |
| Transformers | 5.5 |

## Folder Structure

```
backend/
├── main.py              # App entry point, router registration
├── database.py          # SQLAlchemy engine and session
├── etl.py               # Bulk PIM data loader
├── routers/
│   ├── analyze.py       # POST /api/analyze/{identifier} — main analysis endpoint
│   └── admin.py         # POST /api/admin/insert-sku, GET /api/admin/failed-validations
├── services/
│   ├── clip.py          # CLIP zero-shot product type classification
│   ├── ai_model.py      # GPT-4o-mini visual analysis
│   ├── color.py         # Dominant color extraction + LAB color matching
│   ├── quality.py       # Image quality analysis (sharpness, resolution, framing)
│   ├── parser.py        # Product description parser
│   └── image_downloader.py
├── models/
│   ├── database_models.py  # SQLAlchemy ORM — SKU, AnalysisResult
│   ├── combined.py         # CombinedAnalysisResult response model
│   ├── clip.py             # CLIP result Pydantic models
│   ├── ai_model.py         # AI result Pydantic models
│   ├── color.py            # Color analysis Pydantic models
│   ├── quality.py          # Quality result Pydantic models
│   └── admin.py            # Admin request/response models
└── gql/                 # Strawberry GraphQL schema and resolvers
```

## Main Endpoint

```
POST /api/analyze/{identifier}
```

Accepts an item number or SKU ID. Downloads the product image, runs CLIP + GPT-4o-mini analysis in sequence, returns a combined result with scores, verdicts, color match, and image quality metrics.
