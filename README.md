# StreamSprout

**StreamSprout** is a VALORANT esports command desk that combines roster management, scouting analytics, and an LLM-powered assistant in one Node.js + Express experience. The static frontend (HTML/CSS/JS) lives in `public/`, while the Express API in `server/` powers `/players`, `/search-players`, `/build-team`, and `/ask`.

> **Note:** The Java/Spring artifacts (`POM.xml`, `TensorFlowLlmApplication.java`) are experimental and **not wired into the Node build**. The primary stack is Node.js + Express + static HTML/CSS/JS.

## What StreamSprout Delivers

- **Roster management:** create and search VALORANT player profiles.
- **Analytics snapshot:** quick visibility into role and agent coverage.
- **LLM assistant:** ask scouting or strategy questions via `/ask`.
- **Single-stack setup:** Express serves the static UI and APIs from one Node process.

## Project Layout

- `server/` → Node.js + Express API (`/players`, `/search-players`, `/build-team`, `/ask`).
- `public/` → static HTML/CSS/JavaScript frontend.
- `valor_db` → PostgreSQL schema for the `players` table.
- `src/`, `POM.xml`, `TensorFlowLlmApplication.java` → experimental Java/Spring artifacts (not part of the Node build).

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file in the repo root.

```bash
# Server
PORT=5000
LOG_LEVEL=info

# PostgreSQL (either provide DATABASE_URL or the DB_* fields below)
DATABASE_URL=postgres://user:password@localhost:5432/valor_db
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=valor_db
DB_PORT=5432

# LLM (Amazon Bedrock proxy or compatible endpoint)
BEDROCK_API_KEY=your_bedrock_api_key
BEDROCK_API_ENDPOINT=https://your-bedrock-endpoint

# Optional: return a deterministic response without calling the LLM
LLM_MOCK_RESPONSE="Sample scouting insight"
```

### 3) Set up the database

```bash
createdb valor_db
psql -d valor_db -f valor_db
```

### 4) Run the app

```bash
npm start
```

Then open `http://localhost:5000` to load the UI served from `public/`.

## API Routes

- `GET /health` → health check.
- `GET /players` → list all players.
- `GET /players/:id` → get a player by id.
- `POST /players` → create a player.
- `GET /search-players?name=` → search by name.
- `POST /build-team` → filter by role + agent.
- `POST /ask` → ask the LLM assistant.

## Testing

```bash
npm test
```

Integration tests use an in-memory repository and exercise the Express API routes directly.

## Contributing

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Push the branch and open a PR

## License

MIT. See [`LICENSE`](LICENSE).
