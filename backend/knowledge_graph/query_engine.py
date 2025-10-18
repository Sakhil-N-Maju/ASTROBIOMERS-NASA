"""
Query Engine for Neo4j Knowledge Graph
Provides a simple interface for executing Cypher queries
"""

from neo4j import GraphDatabase
from typing import List, Dict, Any, Optional
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env files
# Try multiple locations
env_paths = [
    Path(__file__).parent.parent.parent / ".env",  # Root level
    Path(__file__).parent.parent / ".env",          # Backend level
]
for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path)
        break

logger = logging.getLogger(__name__)


class QueryEngine:
    """Simple query engine for Neo4j"""
    
    def __init__(self):
        """Initialize connection to Neo4j"""
        self.uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.user = os.getenv("NEO4J_USER", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "spacebiology123")
        self.database = os.getenv("NEO4J_DATABASE", "astrobiomers")
        logger.info(
            "[QueryEngine] Initializing Neo4j driver uri=%s user=%s db=%s password_len=%s",
            self.uri, self.user, self.database, len(self.password) if self.password else 0
        )

        # Build candidate URIs to try (in order) if the primary fails.
        # This helps when routing (neo4j+s) is blocked or TLS variants differ.
        candidates = [self.uri]
        if self.uri.startswith("neo4j+s://"):
            host = self.uri.replace("neo4j+s://", "")
            # Avoid duplicates while preserving order.
            for variant in [
                f"bolt+s://{host}",   # direct, encrypted
                f"neo4j://{host}",    # routing (let driver decide encryption)
                f"bolt://{host}",     # direct, opportunistic encryption / local dev
                f"neo4j+ssc://{host}",# routing, self-signed cert relax
                f"bolt+ssc://{host}"  # direct, self-signed cert relax
            ]:
                if variant not in candidates:
                    candidates.append(variant)

        last_err: Optional[Exception] = None
        for attempt, uri in enumerate(candidates, start=1):
            logger.info("[QueryEngine] Attempt %d/%d connecting to %s", attempt, len(candidates), uri)
            try:
                drv = GraphDatabase.driver(uri, auth=(self.user, self.password))
                with drv.session(database=self.database) as session:
                    session.run("RETURN 1")
                # Success
                self.driver = drv
                self.uri = uri
                logger.info("✅ Connected to Neo4j at %s (db=%s) after %d attempt(s)", uri, self.database, attempt)
                break
            except Exception as e:  # capture and continue
                last_err = e
                logger.warning("[QueryEngine] Attempt %d failed for %s: %s", attempt, uri, type(e).__name__)
                logger.debug("[QueryEngine] Full error", exc_info=True)
        else:  # no break
            logger.error("❌ All connection attempts failed (%d variants tried)", len(candidates))
            if last_err:
                raise last_err
            raise RuntimeError("Neo4j connection attempts failed without exception captured")
    
    def execute_query(self, query: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Execute a Cypher query and return results
        
        Args:
            query: Cypher query string
            parameters: Optional query parameters
            
        Returns:
            List of result records as dictionaries
        """
        try:
            with self.driver.session(database=self.database) as session:
                result = session.run(query, parameters or {})
                return [dict(record) for record in result]
        except Exception as e:
            logger.error(f"Query error: {e}")
            logger.error(f"Query: {query}")
            logger.error(f"Parameters: {parameters}")
            raise
    
    def close(self):
        """Close the database connection"""
        if self.driver:
            self.driver.close()
            logger.info("Closed Neo4j connection")
    
    def __del__(self):
        """Cleanup on deletion"""
        self.close()
