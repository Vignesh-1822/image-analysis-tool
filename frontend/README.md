# Image Analysis Tool — Frontend

React frontend for validating product images against PIM specifications using CLIP and GPT-4o-mini analysis.

## Requirements

- Node.js 18+
- Backend API running on `http://localhost:8000`

## Setup & Run

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Build

```bash
npm run build
```

## Key Versions

| Package | Version |
|---------|---------|
| React | 19 |
| TypeScript | 5.9 |
| Vite | 8 |
| Tailwind CSS | 4 |

## Folder Structure

```
src/
├── components/
│   ├── atoms/        # Smallest units — badges, metric cards, editable JSON nodes
│   ├── molecules/    # Composed UI — filter bars, image quality row, JSON editor panel
│   └── organisms/   # Full sections — navbar, results panel, CLIP/AI tabs, queue table
├── pages/
│   ├── SKUSearch.tsx            # Home search page
│   ├── SKUResults.tsx           # Validation report (/results/:identifier)
│   ├── AdminProductIntake.tsx   # Insert product JSON (/admin/product-intake)
│   └── AdminValidationQueue.tsx # Failed validations (/admin/validation-queue)
├── services/
│   └── analysis.ts   # All API calls
├── types/
│   └── analysis.ts   # TypeScript interfaces for all API responses
└── hooks/            # Custom React hooks
```

## Routes

| Path | Description |
|------|-------------|
| `/` | SKU / item number search |
| `/results/:identifier` | Validation report — accepts item number or SKU ID |
| `/admin/product-intake` | Insert a product via Light + Full JSON |
| `/admin/validation-queue` | View failed validations |
