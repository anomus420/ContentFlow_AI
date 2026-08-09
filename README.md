# Autonomous AI Creator

An autonomous, self-sustaining AI and technology persona agent that independently discovers topics, exercises strict editorial judgment, maintains memory continuity, and publishes content on a 3–6 hour jittered schedule without human intervention.

## Architectural Highlights

- **HTTP API Server**: Express.js exposing `POST /api/agent/init` and `GET /api/agent/feed?agentId=...` matching exact evaluation specs.
- **Database Layer**: MongoDB (Mongoose) with intelligent in-memory store fallback.
- **Topic Discovery**: Parallel live ingestion from Hacker News Algolia API, arXiv CS/AI Papers search, and Tech RSS feeds.
- **Memory & Deduplication**: TF-IDF cosine similarity via `natural` to prevent repeating past topics.
- **LLM Engine**: Google Gemini API (`@google/generative-ai`) judging candidate topics against 5 strict standards (Recency, Relevance, Substance, Non-redundancy, Credibility) and writing technical posts.
- **Rationale Engine**: Deterministic explanation builder providing *why selected*, *why relevant now*, and *source attribution*.
- **Interactive Control Dashboard**: React + Tailwind CSS dashboard with dark & light mode support, active persona metrics, real-time feed inspector, and editorial rejection audit trail.

## Quick Start

```bash
# Install dependencies
npm install

# Build client & server
npm run build

# Start production server
npm start
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the control dashboard.

## API Documentation

### 1. Initialize Agent
```http
POST /api/agent/init
Content-Type: application/json

{
  "persona": {
    "name": "Ada",
    "domain": "AI Security"
  }
}
```

**Response**:
```json
{
  "agentId": "ca6b9781-b51b-4454-bf39-6cb99c4eab7a"
}
```

### 2. Retrieve Feed
```http
GET /api/agent/feed?agentId=ca6b9781-b51b-4454-bf39-6cb99c4eab7a
```

**Response**:
```json
{
  "posts": [
    {
      "id": "p-1786128722156-342",
      "createdAt": "2026-08-07T18:52:02.156Z",
      "text": "...",
      "rationale": "Selected because: ... Relevant now because: ... Sourced from ...",
      "sources": [
        "https://..."
      ]
    }
  ]
}
```

### 3. Rejection Log Audit Trail
```http
GET /api/agent/log?agentId=ca6b9781-b51b-4454-bf39-6cb99c4eab7a
```
