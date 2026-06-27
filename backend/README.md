# ContractLens — Backend API

FastAPI backend for ContractLens. Handles document ingestion, AI-powered clause analysis, risk assessment, multilingual Q&A, and chat session management — all built on Google Cloud Platform.

## Quick Start

### Prerequisites

- Python 3.12+
- [Poetry](https://python-poetry.org/) 1.7+
- A GCP project with a service account that has the roles listed below

### Setup

```bash
# Install dependencies
poetry install

# Copy and fill in environment variables
cp .env.example .env

# Activate the virtual environment
poetry shell

# Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)  
Health check: [http://localhost:8000/health](http://localhost:8000/health)

## Architecture

### Core Services

| Service | Responsibility |
|---------|---------------|
| `DocumentOrchestrator` | Orchestrates the full processing pipeline |
| `document_processor_grpc/http` | Google Document AI OCR integration |
| `clause_segmenter` | Extracts and categorizes legal clauses |
| `risk_analyzer` | Keyword + Gemini hybrid risk assessment |
| `readability_service` | Flesch-Kincaid, Gunning Fog, SMOG metrics |
| `gemini_client` | Vertex AI Gemini wrapper (summaries, Q&A) |
| `embeddings_service` | Semantic embeddings for clause retrieval |
| `chat_session_service` | Conversation memory and context management |
| `language_detection_service` | Per-request language detection |
| `privacy_service` | PII detection and masking via DLP API |
| `firestore_client` | Persistent storage layer |
| `cache_service` | In-memory caching |
| `document_queue_manager` | Batch processing queue |

### GCP Services Used

- **Document AI** — PDF/DOCX text extraction and layout analysis
- **Vertex AI / Gemini 2.5 Flash** — Summarization, Q&A, clause rewriting
- **Firestore** — Document metadata, clause data, chat sessions
- **Cloud Storage** — Raw file storage
- **DLP API** — PII detection and masking
- **Pub/Sub → BigQuery** — Event streaming for analytics

## API Endpoints

### Documents

```
POST   /api/v1/documents/ingest                        Upload and begin processing
GET    /api/v1/documents/status/{doc_id}               Real-time processing progress
GET    /api/v1/documents/clauses?doc_id={id}           Get clause summaries
GET    /api/v1/documents/clause/{clause_id}?doc_id={id} Detailed clause analysis
```

### Q&A

```
POST   /api/v1/qa/ask                                  Ask a question about a document
GET    /api/v1/qa/history/{doc_id}                     Retrieve Q&A history
```

### Chat

```
POST   /api/v1/chat/sessions                           Create a chat session
GET    /api/v1/chat/sessions                           List sessions
PUT    /api/v1/chat/sessions/{id}/documents            Update document context
POST   /api/v1/chat/sessions/{id}/messages             Add a message
```

### Metrics

```
GET    /api/v1/metrics/summary                         Aggregated metrics
GET    /api/v1/metrics/processing-stats                Processing performance stats
GET    /api/v1/metrics/risk-patterns                   Risk pattern analysis
```

## Configuration

Key environment variables (see `.env.example` for the full list):

```bash
# GCP
PROJECT_ID=your-gcp-project-id
DOC_AI_PROCESSOR_ID=your-processor-id
SECRET_KEY=your-secret-key

# AI model (default shown)
GEMINI_MODEL_NAME=gemini-2.5-flash

# Limits (defaults shown)
MAX_FILE_SIZE_MB=10
MAX_PAGES=10
RATE_LIMIT_PER_MINUTE=60
```

### Required GCP IAM Roles

- Document AI User
- Vertex AI User
- Firestore User
- Cloud Storage Object Viewer
- DLP User
- Pub/Sub Publisher
- BigQuery Data Editor

## Project Structure

```
backend/
├── app/
│   ├── api/v1/endpoints/   # Route handlers (documents, chat, qa, metrics, health)
│   ├── core/               # Config and logging
│   ├── dependencies/       # Service dependency injection
│   ├── models/             # Pydantic request/response models
│   ├── services/           # All business logic
│   └── main.py             # FastAPI app entry point
├── Dockerfile
└── pyproject.toml
```

## Docker

```bash
# Build
docker build -t contractlens-api .

# Run
docker run -p 8000:8000 --env-file .env contractlens-api
```

### Cloud Run deployment

```bash
gcloud builds submit --tag gcr.io/$PROJECT_ID/contractlens-api

gcloud run deploy contractlens-api \
  --image gcr.io/$PROJECT_ID/contractlens-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars PROJECT_ID=$PROJECT_ID,DOC_AI_PROCESSOR_ID=$DOC_AI_PROCESSOR_ID
```

## Development

```bash
# Format
poetry run black app/
poetry run isort app/

# Type check
poetry run mypy app/

# Tests
poetry run pytest
```

## Security

- PII masked by Google DLP before any AI processing
- Rate limiting per session
- Pydantic-validated inputs on all endpoints
- CORS restricted to configured origins; `TrustedHost` middleware in production
- **Secure Headers**: Production security middleware

## 📊 Monitoring & Logging

- **Structured Logging**: JSON-formatted logs for GCP Cloud Logging
- **Health Checks**: Kubernetes/Cloud Run compatible health endpoints
- **Metrics**: Built-in processing and performance metrics
- **Error Tracking**: Comprehensive error handling and logging

## 🚧 Implementation Status

### ✅ Completed (Phase 1)

- [x] FastAPI application structure with Uvicorn
- [x] Poetry dependency management
- [x] Docker multi-stage build
- [x] Environment configuration with Pydantic Settings
- [x] API endpoint structure and models
- [x] Health check endpoints
- [x] Structured logging setup

### 🔄 In Progress (Phase 2-8)

- [ ] Document processing pipeline (Document AI + OCR fallback)
- [ ] Gemini integration for summarization
- [ ] Clause segmentation logic
- [ ] Risk analysis and classification
- [ ] Firestore integration
- [ ] Embeddings and Q&A system
- [ ] Analytics and monitoring
- [ ] Production deployment configuration

## 📝 License

This project is part of the ClauseCompass hackathon submission.