# Mobile Piano Practice Coach

This repository now contains a staged rebuild of the original static prototype into a mobile-first architecture:

- `frontend/`: Next.js + TypeScript UI for dashboard, piece detail, practice capture, and analysis review
- `backend/`: FastAPI API for pieces, score ingestion, practice sessions, and post-take analysis
- `samples/`: bundled sample score data used by the parser and seed fixtures
- root `index.html`, `app.js`, `styles.css`: legacy prototype kept as reference

## What is implemented

### Frontend

- Mobile-first dashboard with per-piece color-coded weekly time bars
- Piece detail screen with ingestion status and score review state
- Practice screen with session timer, microphone recording, and audio upload UI
- Analysis result screen with measure-level and note-level findings
- Mock API fallback so the UI can render before the backend is connected

### Backend

- `MusicXML` parsing into a canonical score model with tempo map, measures, notes, and default solfege labels
- Score upload API for `MusicXML`, `PDF`, and image files
- Mock OMR path for `PDF` and images that marks low-confidence measures and blocks strict analysis
- Practice session start/stop APIs
- Analysis job API with a deterministic mock analysis engine
- Score correction API that unblocks strict analysis once low-confidence measures are confirmed

## Current development mode

This workspace does not currently expose `node`, `npm`, or `python` on the shell path, so the code was implemented but not executed here.

The backend is intentionally wired in a development-friendly way:

- uploads are stored in `backend/local_storage/`
- OMR uses a mock extractor seeded from `samples/twinkle.musicxml`
- audio analysis uses a deterministic mock engine
- analysis jobs execute inline instead of a real worker queue

That keeps the API and UI shape ready for later replacement with:

- Postgres-backed repositories
- object storage
- real OMR
- real polyphonic piano transcription
- async worker processing

## Frontend setup

```powershell
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local` if the backend runs separately.

## Backend setup

```powershell
cd backend
copy .env.example .env
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API routes are served under `/api`.

## API surface

- `GET /api/dashboard`
- `POST /api/pieces`
- `GET /api/pieces/{piece_id}`
- `POST /api/pieces/{piece_id}/score`
- `PATCH /api/scores/{score_id}/corrections`
- `GET /api/practice-sessions/{session_id}`
- `POST /api/practice-sessions/start`
- `POST /api/practice-sessions/{session_id}/stop`
- `POST /api/analysis-jobs`
- `GET /api/analysis-jobs/{job_id}`
- `GET /api/analysis-results/{result_id}`

## Tests

Backend unit tests were added for:

- `MusicXML` parsing
- score ingestion review gating
- strict analysis blocking and success paths

Run them with:

```powershell
cd backend
pytest
```

## Next upgrades

- Replace the mock OMR extractor with a real score-recognition pipeline
- Replace the mock analysis service with polyphonic piano transcription + alignment
- Swap the in-memory repository for Postgres
- Move inline analysis execution to a queue worker
