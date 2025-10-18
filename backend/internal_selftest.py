"""Internal self-test for backend without running uvicorn persistently.
Usage:
  python internal_selftest.py

It imports the FastAPI `app` from `main.py` and exercises key endpoints directly
via TestClient, printing concise JSON so we can confirm Neo4j + routes work
even in environments where a long-lived uvicorn process is auto-terminated.
"""
from fastapi.testclient import TestClient
from main import app
import json

client = TestClient(app)

def show(title: str, resp):
    print(f"\n=== {title} ({resp.status_code}) ===")
    try:
        print(json.dumps(resp.json(), indent=2)[:1200])
    except Exception as e:
        print(f"<non-json body> {e}")

def main():
    show("/health", client.get("/health"))
    show("/api/health-full", client.get("/api/health-full"))
    # Sample knowledge graph query
    show("/api/knowledge-graph?q=cell", client.get("/api/knowledge-graph", params={"q":"cell"}))
    show("/api/kg-config", client.get("/api/kg-config"))

if __name__ == "__main__":
    main()
