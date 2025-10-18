from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging, signal
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables FIRST before any other imports
load_dotenv()

# Add backend directory to Python path
backend_dir = Path(__file__).parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Import API routes
from api.routes import knowledge_graph
from api.routes import trends
from api.routes import chat

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def _install_signal_handlers():
    def _h(sig, frame):
        logger.warning(f"Received signal {sig}; waiting for graceful shutdown.")
    for s in (getattr(signal, 'SIGINT', None), getattr(signal, 'SIGTERM', None)):
        if s:
            try:
                signal.signal(s, _h)
            except Exception:
                pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting Space Biology Knowledge Engine API...")
    logger.info("Connecting to databases...")
    _install_signal_handlers()
    yield
    logger.info("Shutting down API...")

app = FastAPI(
    title="Space Biology Knowledge Engine API",
    description="API for querying and reasoning over space biology research",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware - allow production and development origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:8082",
        "http://localhost:8083",
        "https://astrobiomers.onrender.com",  # Production frontend
        "https://astrobiomers-frontend.onrender.com",  # Alternative frontend URL
        "*",  # Allow all for initial testing (remove after deployment works)
    ],  # Frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to the Space Biology Knowledge Engine API",
        "version": "0.1.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "api": "operational",
            # TODO: Add database health checks
            # "neo4j": "operational",
            # "postgres": "operational",
            # "redis": "operational",
        }
    }

# Include routers
app.include_router(knowledge_graph.router)
app.include_router(trends.router)
app.include_router(chat.router)

# TODO: Import and include additional routers
# from api import auth, search, graph, ai, user
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
# app.include_router(search.router, prefix="/api/v1/search", tags=["search"])
# app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI assistant"])
# app.include_router(user.router, prefix="/api/v1/user", tags=["user"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
