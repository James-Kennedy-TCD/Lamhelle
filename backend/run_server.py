"""Entry point: adds this directory to sys.path (so `import db`/`seed_data`
work regardless of the caller's cwd) and runs the API + static frontend."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8100, reload=False)
