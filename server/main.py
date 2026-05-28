import os
import re
import enum
import time
from typing import List, Union, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dataclasses import asdict, is_dataclass
import nest_asyncio

from minizinc import Instance, Model, Solver
from minizinc.error import MiniZincError

# Apply nest_asyncio to prevent conflicts with Uvicorn's event loop
nest_asyncio.apply()

app = FastAPI(
    title="MiniZinc Nurse Rostering API",
    description="FastAPI service for running nurse rostering constraints using MiniZinc Gecode solver",
    version="1.1.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input Pydantic Model
class SolveRequest(BaseModel):
    nurses: Union[int, List[str]] = Field(
        ...,
        description="Number of nurses (e.g., 7 to generate Nurse1..7) or a list of custom nurse names"
    )
    days: Union[int, List[str]] = Field(
        ...,
        description="Number of days (e.g., 10 to generate D1..10) or a list of custom day names"
    )
    req_day: int = Field(..., description="Number of nurses required for day shift per day")
    req_evening: Optional[int] = Field(
        None,
        description="Number of nurses required for evening shift (if using the day/evening/night/off variant model)"
    )
    req_night: int = Field(..., description="Number of nurses required for night shift per day")
    min_night: int = Field(..., description="Minimum number of night shifts required per nurse")
    intermediate_solutions: bool = Field(
        False, 
        description="If True, returns all intermediate solutions. If False, returns the final solution."
    )

def to_serializable(obj: Any) -> Any:
    """Recursively convert custom types, enums, sets, and ranges into JSON-serializable types."""
    if isinstance(obj, enum.Enum):
        return obj.name
    elif hasattr(obj, "name") and isinstance(obj.__class__, enum.EnumMeta):
        return obj.name
    elif isinstance(obj, (set, frozenset)):
        try:
            return [to_serializable(item) for item in sorted(list(obj))]
        except TypeError:
            return [to_serializable(item) for item in list(obj)]
    elif isinstance(obj, range):
        return list(obj)
    elif isinstance(obj, (list, tuple)):
        return [to_serializable(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: to_serializable(val) for key, val in obj.items()}
    return obj

def get_clean_mzn(filename: str) -> str:
    """Reads a model file and comments out the hardcoded parameter assignments at the bottom."""
    mzn_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)
    if not os.path.exists(mzn_path):
        raise HTTPException(
            status_code=500,
            detail=f"MiniZinc model file not found in the server folder (expected path: {mzn_path})"
        )
    
    with open(mzn_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Strip assignments for parameters we override from Python
    # This matches NURSE, DAY, req_day, req_evening, req_night, min_night
    pattern = r"^\s*(NURSE|DAY|req_day|req_evening|req_night|min_night)\s*=([^;]*);"
    cleaned_content = re.sub(pattern, r"% \1 = \2; // Overridden by API", content, flags=re.MULTILINE)
    
    return cleaned_content

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "MiniZinc FastAPI Server",
        "endpoints": {
            "/solve": "POST - solve nurse rostering problem"
        }
    }

@app.post("/solve")
def solve_nurse_roster(request: SolveRequest):
    # 1. Look up the solver (using gecode as default)
    try:
        gecode = Solver.lookup("gecode")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not locate Gecode solver. Ensure MiniZinc is installed and in the system PATH. Details: {str(e)}"
        )

    # 2. Determine which model file to use
    use_variant = request.req_evening is not None
    model_file = "Playground_variant.mzn" if use_variant else "Playground.mzn"

    try:
        clean_mzn = get_clean_mzn(model_file)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error reading and parsing {model_file}: {str(e)}"
        )

    # 3. Process inputs to generate the list of names if numbers were provided
    if isinstance(request.nurses, int):
        if request.nurses <= 0:
            raise HTTPException(status_code=400, detail="nurses count must be positive")
        nurses_list = [f"Nurse{i}" for i in range(1, request.nurses + 1)]
    else:
        nurses_list = request.nurses

    if isinstance(request.days, int):
        if request.days <= 0:
            raise HTTPException(status_code=400, detail="days count must be positive")
        days_list = [f"D{i}" for i in range(1, request.days + 1)]
    else:
        days_list = request.days

    # Create dynamic python enums that map to MiniZinc enum types
    try:
        NURSE_enum = enum.Enum("NURSE", {name: i for i, name in enumerate(nurses_list, start=1)})
        DAY_enum = enum.Enum("DAY", {name: i for i, name in enumerate(days_list, start=1)})
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to construct internal enums from input lists. Verify unique names. Error: {str(e)}"
        )

    # 4. Initialize MiniZinc model and instance
    model = Model()
    model.add_string(clean_mzn)
    
    instance = Instance(gecode, model)
    
    # Assign inputs to instance
    instance["NURSE"] = NURSE_enum
    instance["DAY"] = DAY_enum
    instance["req_day"] = request.req_day
    instance["req_night"] = request.req_night
    instance["min_night"] = request.min_night
    
    # If running the variant, assign evening requirement
    if use_variant:
        instance["req_evening"] = request.req_evening

    # 5. Run the solver
    start_time = time.time()
    try:
        result = instance.solve(intermediate_solutions=request.intermediate_solutions)
    except MiniZincError as mzn_err:
        raise HTTPException(
            status_code=400,
            detail=f"MiniZinc compilation/solver error: {str(mzn_err)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during solving: {str(e)}"
        )
    
    solve_duration = time.time() - start_time

    # 6. Parse and format results
    status_str = str(result.status)
    solutions = []

    if result.status.has_solution():
        if request.intermediate_solutions:
            # Result is iterable and contains multiple solutions
            for sol in result:
                if is_dataclass(sol):
                    solutions.append(to_serializable(asdict(sol)))
                else:
                    solutions.append(to_serializable(dict(sol)))
        else:
            # Single solution is at result.solution
            sol = result.solution
            if is_dataclass(sol):
                solutions.append(to_serializable(asdict(sol)))
            else:
                solutions.append(to_serializable(dict(sol)))

    # Return serializable structure
    return {
        "status": status_str,
        "model_used": model_file,
        "solve_duration_seconds": round(solve_duration, 4),
        "solutions_count": len(solutions),
        "solutions": solutions,
        "statistics": to_serializable(result.statistics)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
