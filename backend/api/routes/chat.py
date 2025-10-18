"""
Chat API Endpoints for RAG-Powered Q&A

Provides conversational interface to the knowledge graph using RAG.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging

from backend.api.services.rag_service import KnowledgeGraphRAG

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["chat"])

# Initialize RAG service (singleton)
rag_service = None

def get_rag_service():
    """Lazy initialization of RAG service"""
    global rag_service
    if rag_service is None:
        rag_service = KnowledgeGraphRAG()
        logger.info("✅ RAG service initialized")
    return rag_service


# Request/Response Models
class QuestionRequest(BaseModel):
    """Request model for asking questions"""
    question: str = Field(..., min_length=5, max_length=500, description="User's question")
    max_papers: int = Field(default=10, ge=1, le=50, description="Maximum papers to retrieve")
    include_context: bool = Field(default=True, description="Include knowledge graph context")


class Source(BaseModel):
    """Citation source model"""
    type: str
    id: str
    title: str
    year: Optional[int] = None
    url: Optional[str] = None


class SubgraphNode(BaseModel):
    """Node in the knowledge graph"""
    id: str
    label: str
    type: str


class SubgraphEdge(BaseModel):
    """Edge in the knowledge graph"""
    source: str
    target: str
    type: str


class QuestionResponse(BaseModel):
    """Response model for answered questions"""
    question: str
    answer: str
    sources: List[Source]
    subgraph: Dict[str, Any]
    metadata: Dict[str, Any]


# API Endpoints
@router.post("/ask", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    """
    Ask a question and get an AI-powered answer grounded in the knowledge graph.
    
    Example questions:
    - "What are the effects of microgravity on bone density?"
    - "How does radiation affect astronauts?"
    - "What countermeasures exist for muscle atrophy?"
    
    The answer will be based on research papers and entities in the knowledge graph,
    with citations to source papers.
    """
    try:
        logger.info(f"📝 Received question: {request.question}")
        
        # Get RAG service
        rag = get_rag_service()
        
        # Generate answer
        response = rag.answer_question(
            user_question=request.question,
            max_papers=request.max_papers,
            include_snippets=request.include_context
        )
        
        logger.info(f"✅ Generated answer with {len(response['sources'])} sources")
        
        return response
    
    except Exception as e:
        logger.error(f"❌ Error answering question: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to answer question: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Check if RAG service is available"""
    try:
        rag = get_rag_service()
        
        return {
            "status": "ok",
            "service": "RAG Chat",
            "llm_provider": rag.llm_provider or "none (fallback mode)",
            "has_llm": rag.llm_client is not None
        }
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e)
        }


@router.get("/examples")
async def get_example_questions():
    """Get example questions to try"""
    return {
        "examples": [
            {
                "category": "Health Effects",
                "questions": [
                    "What are the effects of microgravity on bone density?",
                    "How does spaceflight affect the cardiovascular system?",
                    "What happens to the immune system in space?"
                ]
            },
            {
                "category": "Countermeasures",
                "questions": [
                    "What countermeasures exist for muscle atrophy?",
                    "How can we prevent bone loss in astronauts?",
                    "What exercises are effective in microgravity?"
                ]
            },
            {
                "category": "Radiation",
                "questions": [
                    "How does cosmic radiation affect human cells?",
                    "What are the long-term effects of space radiation?",
                    "How can we protect astronauts from radiation?"
                ]
            },
            {
                "category": "Research Insights",
                "questions": [
                    "What genes are affected by spaceflight?",
                    "What biological pathways change in microgravity?",
                    "What research has been done on the ISS?"
                ]
            }
        ]
    }


# Conversation history (for future multi-turn support)
conversations = {}

@router.post("/conversation/start")
async def start_conversation():
    """Start a new conversation session"""
    import uuid
    conversation_id = str(uuid.uuid4())
    conversations[conversation_id] = {
        "history": [],
        "created_at": None
    }
    return {"conversation_id": conversation_id}


@router.post("/conversation/{conversation_id}/ask")
async def ask_in_conversation(
    conversation_id: str,
    request: QuestionRequest
):
    """
    Ask a question within a conversation context (future feature).
    Currently works the same as /ask but maintains history.
    """
    # For now, just call the regular ask endpoint
    response = await ask_question(request)
    
    # Store in conversation history
    if conversation_id in conversations:
        conversations[conversation_id]["history"].append({
            "question": request.question,
            "answer": response["answer"],
            "timestamp": response["metadata"]["timestamp"]
        })
    
    return response
