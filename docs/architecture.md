# Architecture & Design (Architect Agent)

## 1. System Overview
Next.js 16 (Canary) application hosted on Vercel. 
- **Frontend:** React Server Components + Client-side Bento Grid UI.
- **Backend:** Vercel Serverless Functions + Cron jobs for data ingestion.
- **Data Layer:** Upstash Redis for ephemeral feed storage, Supabase (pgvector) for long-term RAG search.
- **Voice Agent:** ElevenLabs WebSocket integration.

## 2. API Contract (Internal)
- `GET /api/pulse`: Returns `pulse_data.json` containing top 5 scored items.
- `POST /api/voice`: Initiates ElevenLabs WebSocket connection for the Pulse Agent.

## 3. Database Model & Storage
- **Upstash Redis:** 
  - `pulse:current_feed` (JSON blob of scored items)
  - `pulse:thread_memory:<session_id>` (Last 10 conversation turns)
- **Supabase (pgvector):**
  - Table `archived_news` (id, text, embedding, created_at, source, score)

## 4. Failure Modes & Retries
- **Scraper Rate Limits:** Implement exponential backoff for X and GitHub API calls.
- **LLM Filter Timeout:** Fallback to a faster model if primary LLM fails.
- **Voice WebSocket Drop:** Graceful degradation to standard text-to-speech Web API.
- **Idempotency:** Scraper cron jobs must use UPSERT logic based on origin URL/Tweet ID to avoid duplicate entries.

## 5. Observability & Security
- **Logs:** Vercel Analytics and Log Drains.
- **Security:** Vercel Environment Variables for API keys. Rate limiting on `/api/voice` via Vercel Edge Middleware.
