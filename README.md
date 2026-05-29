# Book Appointment

Hospital staff scheduling application with a React frontend and a FastAPI backend that uses MiniZinc to solve nurse rostering constraint problems (day/evening/night shifts).

## Docker — Production mode

Builds the frontend with Nginx and runs the backend server.

```sh
docker compose up -d
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:8000

Rebuild after source changes:

```sh
docker compose up -d --build
```

## Docker — Development mode (hot reload)

Uses Vite dev server for the frontend (HMR) and Uvicorn with `--reload` for the backend. Source code is mounted as a volume so edits reflect instantly.

```sh
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## Run locally (without Docker)

### Frontend

```sh
npm install
npm run dev
```

### Backend

See [server/README.md](./server/README.md).

