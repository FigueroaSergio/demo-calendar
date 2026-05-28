# MiniZinc Nurse Rostering FastAPI Server

This directory contains a FastAPI application wrapping the MiniZinc constraint solver model for nurse scheduling (`Playground.mzn`). It exposes an API endpoint to solve scheduling problems dynamically.

## Getting Started

### Prerequisites
1. **Docker** (Recommended) OR **Python 3.10+** and **MiniZinc** installed locally.
2. The MiniZinc model file `Playground.mzn` must remain in this folder.

---

## Run with Docker (Recommended)

Using Docker is the easiest way to run the service as it bundles the MiniZinc compiler, the Gecode solver, and all Python dependencies in a single container.

### 1. Build the Docker Image
From the root of this project (or inside the `server/` directory), run:
```bash
docker build -t minizinc-fastapi ./server
```

### 2. Run the Container
Start the container and map port `8000`:
```bash
docker run -p 8000:8000 minizinc-fastapi
```
The server will now be accessible at `http://localhost:8000`.

---

## Run Locally (Without Docker)

To run the server on your local host, you must first have Python and the MiniZinc compiler installed and available on your system's PATH.

### 1. Setup a Python Virtual Environment
Navigate to the `server/` directory:
```bash
cd server
python -m venv venv
```

Activate the environment:
*   **Windows (PowerShell)**:
    ```powershell
    .\venv\Scripts\Activate.ps1
    ```
*   **macOS / Linux**:
    ```bash
    source venv/bin/activate
    ```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Server
Start the development server using Uvicorn:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The server will run on `http://localhost:8000` with hot-reloading enabled.

---

## API Documentation & Verification

Once the server is running, you can explore the interactive API docs at:
*   Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
*   ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Testing the `/solve` Endpoint
You can send a POST request to `http://localhost:8000/solve` with a custom configuration. The API dynamically selects which model to run based on the parameters you send:

*   **Original Model (Day, Night, Off)**: Triggered when `req_evening` is omitted.
*   **Variant Model (Day, Evening, Night, Off)**: Triggered when `req_evening` is provided.

#### Example 1: Original Model (Day, Night, Off)
**Payload (JSON):**
```json
{
  "nurses": 7,
  "days": 10,
  "req_day": 3,
  "req_night": 2,
  "min_night": 2,
  "intermediate_solutions": false
}
```

**cURL Command:**
```bash
curl -X POST "http://localhost:8000/solve" \
  -H "Content-Type: application/json" \
  -d '{"nurses": 7, "days": 10, "req_day": 3, "req_night": 2, "min_night": 2, "intermediate_solutions": false}'
```

#### Example 2: Variant Model (Day, Evening, Night, Off)
**Payload (JSON):**
```json
{
  "nurses": 7,
  "days": 10,
  "req_day": 2,
  "req_evening": 2,
  "req_night": 2,
  "min_night": 2,
  "intermediate_solutions": false
}
```

**cURL Command:**
```bash
curl -X POST "http://localhost:8000/solve" \
  -H "Content-Type: application/json" \
  -d '{"nurses": 7, "days": 10, "req_day": 2, "req_evening": 2, "req_night": 2, "min_night": 2, "intermediate_solutions": false}'
```

