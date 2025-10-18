"""Standalone Neo4j connectivity diagnostic.
Run with the backend virtualenv activated:
  python debug_neo4j.py
Prints connection parameters (excluding password) and basic counts or full traceback.
"""
from neo4j import GraphDatabase
import os, traceback, sys
from pathlib import Path
from dotenv import load_dotenv

# Load .env similar to query_engine logic
for p in [
    Path(__file__).parent.parent / '.env',         # repo root
    Path(__file__).parent / '.env'                 # backend local
]:
    if p.exists():
        load_dotenv(p)
        break

def mask(pw: str):
    if not pw:
        return "<empty>"
    if len(pw) <= 6:
        return "***"
    return pw[:3] + "***" + pw[-2:]

def main():
    base_uri = os.getenv("NEO4J_URI")
    user = os.getenv("NEO4J_USER") or os.getenv("NEO4J_USERNAME")
    pwd  = os.getenv("NEO4J_PASSWORD")
    db   = os.getenv("NEO4J_DATABASE","neo4j")
    print(f"[debug_neo4j] base_uri={base_uri}\n  user={user}\n  db={db}\n  password(masked)={mask(pwd)}")

    # Derive candidate URIs similar to QueryEngine for deeper diagnostics
    candidates = [base_uri] if base_uri else []
    if base_uri and base_uri.startswith("neo4j+s://"):
        host = base_uri.replace("neo4j+s://", "")
        for variant in [
            f"bolt+s://{host}",
            f"neo4j://{host}",
            f"bolt://{host}",
            f"neo4j+ssc://{host}",
            f"bolt+ssc://{host}"
        ]:
            if variant not in candidates:
                candidates.append(variant)

    any_success = False
    for idx, uri in enumerate(candidates, start=1):
        print(f"[debug_neo4j] Attempt {idx}/{len(candidates)} uri={uri}")
        try:
            driver = GraphDatabase.driver(uri, auth=(user, pwd))
            with driver.session(database=db) as s:
                node_ct = s.run("MATCH (n) RETURN count(n) AS c").single()["c"]
                rel_ct = s.run("MATCH ()-[r]->() RETURN count(r) AS c").single()["c"]
                print(f"[debug_neo4j] SUCCESS uri={uri} nodes={node_ct} relationships={rel_ct}")
            driver.close()
            any_success = True
            break
        except Exception as e:
            print(f"[debug_neo4j] FAIL uri={uri}: {type(e).__name__}: {e}")
            # Show concise traceback line for first frame only for noise control
            tb = traceback.format_exc().splitlines()
            if tb:
                print("  ->", tb[-1])
    if not any_success:
        print("[debug_neo4j] All attempts failed. See above for last errors.")
        sys.exit(1)

if __name__ == "__main__":
    main()
