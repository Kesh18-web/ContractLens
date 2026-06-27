# ContractLens

> Understand every contract you sign. ContractLens turns dense legal documents into plain-language summaries, flags risky clauses, and answers your questions — in English, Hindi, or Bengali.

Legal documents are written for lawyers, not for the people who actually sign them. Indemnity traps, auto-renewal hooks, and unlimited liability clauses hide in plain sight behind walls of jargon. ContractLens gives individuals the same clarity that expensive legal counsel provides.

## Features

### Document Processing
- **Smart OCR** — Google Document AI with PyPDF2 fallback for reliable text extraction
- **Clause Segmentation** — Automatic detection and categorization of individual clauses
- **Batch Uploads** — Process up to 10 documents simultaneously, 10 pages each
- **PII Protection** — Personal information detected and masked before any AI processing

### AI Analysis
- **Plain-Language Summaries** — Every clause rewritten at a reading level anyone can understand
- **Hybrid Risk Assessment** — Keyword heuristics combined with Gemini LLM analysis; three tiers: low / moderate / attention
- **Readability Metrics** — Flesch-Kincaid, Gunning Fog, and SMOG scores with before/after comparisons
- **Confidence Scoring** — Transparent confidence levels on all AI-generated output

### Chat & Q&A
- **Multi-Document Chat** — Ask questions across one or multiple documents in a single session
- **Source Citations** — Every answer links back to the specific clause it came from
- **Language-Aware** — Automatically detects whether you're writing in English or Hindi and responds accordingly
- **Negotiation Assistant** — Generates alternative clause phrasings you can take back to the other party

### Internationalization
- Full UI in **English**, **Hindi**, and **Bengali**
- Auto language detection with manual override
- Regional font support (Noto Sans) for Indian scripts

### Analytics
- **Risk Heatmap** — Visual overview of clause risk distribution across a document
- **Readability Dashboard** — Quantified improvement metrics per clause
- **Processing Stats** — Queue status, timing, and throughput analytics

## Architecture

```
Next.js 15 (App Router)
  └── TanStack React Query  ──HTTP──►  FastAPI (Python 3.12)
       Tailwind CSS + Radix UI                └── DocumentOrchestrator
       next-intl (i18n)                            ├── Google Document AI (OCR)
                                                   ├── Vertex AI / Gemini 2.5 Flash
                                                   ├── Embeddings Service (semantic search)
                                                   ├── Risk Analyzer
                                                   ├── Readability Service
                                                   ├── Chat Session Service
                                                   ├── Privacy Service (DLP)
                                                   └── Firestore + Cloud Storage
```

**API surface:**

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/documents/ingest` | Upload & begin background processing |
| `GET` | `/api/v1/documents/status/{id}` | Poll real-time processing progress |
| `GET` | `/api/v1/documents/clauses` | Fetch segmented clause analysis |
| `POST` | `/api/v1/chat/ask` | Retrieval-grounded Q&A |
| `GET` | `/api/v1/metrics/summary` | Aggregated analytics |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS v4, Radix UI |
| Server state | TanStack React Query v5 |
| Internationalization | next-intl |
| Backend framework | FastAPI, Uvicorn, Python 3.12 |
| Dependency management | Poetry |
| AI models | Gemini 2.5 Flash (Vertex AI) |
| OCR | Google Document AI |
| Database | Google Firestore |
| File storage | Google Cloud Storage |
| Privacy | Google DLP API |
| Analytics | Pub/Sub → BigQuery |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.12+
- [Poetry](https://python-poetry.org/) for Python dependency management
- A Google Cloud project with the following APIs enabled:
  - Document AI
  - Vertex AI (Gemini)
  - Firestore
  - Cloud Storage
  - DLP API *(optional — for PII masking)*

### 1. Clone the repo

```bash
git clone https://github.com/your-username/contractlens.git
cd contractlens
```

### 2. Frontend setup

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Backend setup

```bash
cd backend

# Install dependencies
poetry install

# Configure environment
cp .env.example .env
# Fill in PROJECT_ID, DOC_AI_PROCESSOR_ID, SECRET_KEY, etc.

# Authenticate with Google Cloud
gcloud auth application-default login
# or copy a service account key:
# cp /path/to/credentials.json ./credentials.json

# Start the API server
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs).

## Project Structure

```
contractlens/
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── app/               # App Router pages & global styles
│   │   ├── components/        # UI components (Chat, RiskHeatmap, AnalysisPanel, …)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # API client, utilities, validation
│   │   ├── providers/         # React Query & locale providers
│   │   └── sections/          # Page-level layout sections
│   ├── messages/              # i18n strings (en, hi, bn)
│   ├── public/                # Static assets
│   └── package.json
├── backend/                   # FastAPI application
│   └── app/
│       ├── api/               # Route handlers
│       ├── core/              # Config, logging
│       ├── models/            # Pydantic models
│       ├── services/          # All business logic (OCR, AI, risk, chat, …)
│       └── dependencies/      # Dependency injection
└── README.md
```

## Security & Privacy

- PII is detected and masked by Google DLP **before** it reaches any AI model
- CORS is environment-gated; `TrustedHost` middleware is enabled in production
- All AI responses include source citations to limit hallucination risk
- Anonymous analytics only — no personally identifiable data is stored in BigQuery

## License

MIT
