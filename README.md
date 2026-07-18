# piano-practice-app

This repository contains a mobile-oriented piano practice application that tracks daily practice time, compares performances against score data, and is evolving toward social sharing and feedback features.

## Current structure

- `frontend/`: Next.js + TypeScript UI
- `backend/`: FastAPI API
- `samples/`: bundled sample score data
- root `index.html`, `app.js`, `styles.css`: earlier prototype kept for reference

## What is implemented

### Frontend

- Mobile-first dashboard with piece summaries and practice views
- Piece detail and new piece creation screens
- Practice screen with timer and recording-oriented workflow
- Analysis result screens and summary components
- Mock API fallback for local UI development

### Backend

- `MusicXML` parsing into a score model
- Piece and score ingestion APIs
- Practice session APIs
- Analysis job APIs with deterministic mock analysis behavior
- Score correction flow for low-confidence score data

## Development notes

The current codebase is structured so the UI and API can later be extended into a full mobile app with:

- user profiles
- follow / follower relationships
- shared practice history
- messaging
- recording sharing and feedback

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

Backend unit tests cover:

- `MusicXML` parsing
- score ingestion review gating
- strict analysis blocking and success paths

Run them with:

```powershell
cd backend
pytest
```

## Next upgrades

- Replace mock score recognition and analysis with production implementations
- Add authentication and user profiles
- Add follow / follower graphs
- Add direct messaging
- Add recording sharing and structured feedback
- Move persistence to a real database
