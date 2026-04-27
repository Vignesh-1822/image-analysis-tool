# Product Image Validation Tool

An AI-powered tool that automatically validates product images against PIM specifications. Built for ABC Supply Co.

---

## What it does

Enter a SKU ID — the tool fetches the product from the database, downloads the image from the CDN, runs it through AI models, and returns a verdict:

- ✅ **Approved** — image meets all specification criteria
- ⚠️ **Catalog Only** — usable but has issues worth reviewing
- ❌ **Replace** — does not meet specification criteria

Each verdict comes with a composite score and a breakdown of exactly what passed and what failed — product type, color accuracy, and image quality.

---

## Models

| Model | Type | What it does |
|---|---|---|
| **CLIP** | Local, free | Product type detection via two-prompt comparison |
| **GPT-4o-mini** | OpenAI API | Full visual analysis with plain-English reasoning |
| **YOLO + SAM2** | Local | Segments product from background before analysis |

**CLIP composite weights:** Product type 40% · Color 35% · Quality 25%

**GPT-4o-mini composite weights:** AI assessment 50% · Color 25% · Quality 25%

---

## Automated Pipeline

When a new product is inserted into the database, validation triggers automatically — no manual action needed.

```
New product inserted via admin API
          ↓
  Webhook fires to n8n instantly
          ↓
  n8n calls /api/analyze/{item_number}
          ↓
  CLIP + GPT-4o-mini run in parallel
          ↓
    verdict != Approved ?
          ↓ yes
  Email alert sent via Outlook with:
    · Item number and product name
    · Composite score and verdict
    · What specifically failed
    · Link to full analysis in the web app
```

Built with n8n — the workflow is visual, auditable, and each execution is logged. Product data issues are caught at the point of entry, not after they go live in the catalog.

---

## Tech Stack

- **Frontend** — React + TypeScript + Vite + Tailwind + shadcn/ui
- **Backend** — FastAPI (Python)
- **Database** — PostgreSQL with JSONB
- **GraphQL** — Strawberry (Python) + Apollo Client
- **Color Science** — K-means + Delta E CIEDE2000 in LAB color space
- **Pipeline** — n8n

---

## Getting Started

See the individual READMEs for setup instructions:

- [`backend/README.md`](./backend/README.md) — Python setup, database, ETL, API docs
- [`frontend/README.md`](./frontend/README.md) — Node setup, environment, running the app

### Quick start

```bash
# Backend
cd backend && source venv/bin/activate
uvicorn main:app --reload --port 8000 --host 0.0.0.0

# Frontend
cd frontend && npm run dev

# Pipeline
npx n8n
```

---

## Repository Structure

```
image-analysis-tool/
├── frontend/          # React web application
├── backend/           # FastAPI backend + AI model services
│   ├── routers/       # API endpoints
│   ├── services/      # CLIP, AI model, color, quality logic
│   ├── graphql/       # Strawberry GraphQL schema
│   ├── models/        # Pydantic + ORM models
│   └── etl.py         # Bulk PIM data loader
└── README.md
```