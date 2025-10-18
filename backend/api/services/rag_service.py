"""
RAG (Retrieval-Augmented Generation) Service for Knowledge Graph Queries

This service implements a novel KG-RAG architecture that combines:
1. Neo4j Knowledge Graph for structured facts
2. LLM (OpenAI/Gemini) for natural language generation
3. Citation-backed answers with verifiable sources

Architecture:
User Question → Entity Extraction → Neo4j Subgraph Retrieval → 
LLM Prompt Construction → Answer Generation → Cited Response
"""

import os
import re
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# LLM Integration
try:
    import openai
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

try:
    import anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False

# Local imports
import sys
from pathlib import Path

# Add backend to path if needed
backend_path = Path(__file__).resolve().parents[2]
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from knowledge_graph.query_engine import QueryEngine

logger = logging.getLogger(__name__)


class KnowledgeGraphRAG:
    """
    RAG system that grounds LLM responses in Neo4j knowledge graph data.
    """
    
    def __init__(self):
        """Initialize RAG service with QueryEngine and LLM client"""
        self.query_engine = QueryEngine()
        
        # Initialize LLM client
        self.llm_provider = None
        self.llm_client = None
        
        # Try OpenAI first
        if HAS_OPENAI and os.getenv("OPENAI_API_KEY"):
            self.llm_provider = "openai"
            self.llm_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            logger.info("✅ Using OpenAI for RAG")
        
        # Fallback to Anthropic
        elif HAS_ANTHROPIC and os.getenv("ANTHROPIC_API_KEY"):
            self.llm_provider = "anthropic"
            self.llm_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
            logger.info("✅ Using Anthropic Claude for RAG")
        
        else:
            logger.warning("⚠️ No LLM API key found. RAG will return knowledge graph data only.")
            logger.warning("   Set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable.")
    
    def answer_question(
        self, 
        user_question: str,
        max_papers: int = 10,
        include_snippets: bool = True
    ) -> Dict[str, Any]:
        """
        Answer a user's question using Knowledge Graph RAG.
        
        Args:
            user_question: Natural language question
            max_papers: Maximum number of papers to retrieve
            include_snippets: Whether to include text snippets as context
            
        Returns:
            Dict with answer, sources, subgraph data, and metadata
        """
        logger.info(f"📝 Processing question: {user_question}")
        
        # Step 1: Extract entities from question
        entities = self._extract_entities_from_question(user_question)
        logger.info(f"🔍 Extracted entities: {entities}")
        
        # Step 2: Query Neo4j for relevant subgraph
        subgraph_data = self._retrieve_relevant_subgraph(entities, max_papers)
        logger.info(f"📊 Retrieved subgraph: {subgraph_data['node_count']} nodes, {subgraph_data['edge_count']} edges")
        
        # Step 3: Get supporting text snippets (if available)
        evidence_snippets = []
        if include_snippets:
            evidence_snippets = self._get_evidence_snippets(subgraph_data, user_question)
        
        # Step 4: Generate answer with LLM (or fallback)
        if self.llm_client:
            answer = self._generate_llm_answer(user_question, subgraph_data, evidence_snippets)
        else:
            answer = self._generate_fallback_answer(user_question, subgraph_data)
        
        # Step 5: Package response
        response = {
            "question": user_question,
            "answer": answer,
            "sources": self._format_sources(subgraph_data),
            "subgraph": {
                "nodes": subgraph_data["nodes"],
                "edges": subgraph_data["edges"]
            },
            "metadata": {
                "entity_count": len(entities),
                "paper_count": subgraph_data["paper_count"],
                "llm_provider": self.llm_provider or "none",
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        return response
    
    def _extract_entities_from_question(self, question: str) -> List[str]:
        """
        Extract potential entity names from user question.
        Uses simple pattern matching + common space biology terms.
        """
        # Common space biology entities
        space_bio_terms = {
            'microgravity', 'spaceflight', 'radiation', 'cosmic radiation',
            'bone loss', 'bone density', 'muscle atrophy', 'osteoporosis',
            'cardiovascular', 'immune system', 'metabolism', 'gene expression',
            'protein', 'genes', 'cell', 'tissue', 'organ',
            'astronaut', 'iss', 'space station', 'mission'
        }
        
        question_lower = question.lower()
        entities = []
        
        # Find matching terms
        for term in space_bio_terms:
            if term in question_lower:
                entities.append(term.title())
        
        # Extract capitalized words (potential entities)
        capitalized_words = re.findall(r'\b[A-Z][a-z]+\b', question)
        entities.extend(capitalized_words)
        
        # Remove duplicates, keep order
        seen = set()
        unique_entities = []
        for entity in entities:
            if entity.lower() not in seen:
                seen.add(entity.lower())
                unique_entities.append(entity)
        
        return unique_entities[:5]  # Limit to top 5
    
    def _retrieve_relevant_subgraph(
        self, 
        entities: List[str], 
        max_papers: int
    ) -> Dict[str, Any]:
        """
        Query Neo4j to retrieve relevant subgraph around entities.
        """
        if not entities:
            # Fallback: get random sample of papers
            query = """
            MATCH (p:Paper)
            RETURN p.pmid as id, p.title as title, p.publication_year as year
            ORDER BY rand()
            LIMIT $max_papers
            """
            results = self.query_engine.execute_query(query, {'max_papers': max_papers})
            return {
                "nodes": [],
                "edges": [],
                "papers": results,
                "node_count": 0,
                "edge_count": 0,
                "paper_count": len(results)
            }
        
        # Build dynamic query for entities
        entity_conditions = " OR ".join([f"toLower(e.name) CONTAINS toLower('{entity}')" for entity in entities])
        
        query = f"""
        // Find entities matching search terms
        MATCH (e)
        WHERE {entity_conditions}
        
        // Get papers mentioning these entities
        OPTIONAL MATCH (e)<-[:MENTIONS]-(p:Paper)
        
        // Get related entities
        OPTIONAL MATCH (e)-[r]-(related)
        WHERE related:Stressor OR related:Phenotype OR related:Gene
        
        // Return structured data
        WITH e, collect(DISTINCT p) as papers, collect(DISTINCT {{rel: r, node: related}}) as rels
        
        RETURN 
            e.name as entity_name,
            labels(e)[0] as entity_type,
            papers[0..{max_papers}] as papers,
            rels[0..20] as relationships
        LIMIT 10
        """
        
        try:
            results = self.query_engine.execute_query(query)
            
            # Process results into nodes and edges
            nodes = []
            edges = []
            all_papers = []
            
            for row in results:
                # Add entity node
                if row.get('entity_name'):
                    nodes.append({
                        "id": row['entity_name'],
                        "label": row['entity_name'],
                        "type": row.get('entity_type', 'Entity')
                    })
                
                # Add paper nodes
                for paper in row.get('papers', []):
                    if paper:
                        paper_id = paper.get('pmid') or str(id(paper))
                        nodes.append({
                            "id": paper_id,
                            "label": paper.get('title', 'Unknown')[:50],
                            "type": "Paper"
                        })
                        edges.append({
                            "source": paper_id,
                            "target": row['entity_name'],
                            "type": "MENTIONS"
                        })
                        all_papers.append(paper)
                
                # Add relationship edges
                for rel_data in row.get('relationships', []):
                    if rel_data and rel_data.get('node'):
                        related_node = rel_data['node']
                        if hasattr(related_node, 'get'):
                            related_name = related_node.get('name', str(id(related_node)))
                            nodes.append({
                                "id": related_name,
                                "label": related_name,
                                "type": "Related"
                            })
                            edges.append({
                                "source": row['entity_name'],
                                "target": related_name,
                                "type": "ASSOCIATED_WITH"
                            })
            
            return {
                "nodes": nodes,
                "edges": edges,
                "papers": all_papers[:max_papers],
                "node_count": len(nodes),
                "edge_count": len(edges),
                "paper_count": len(all_papers)
            }
        
        except Exception as e:
            logger.error(f"❌ Subgraph retrieval error: {e}")
            return {
                "nodes": [],
                "edges": [],
                "papers": [],
                "node_count": 0,
                "edge_count": 0,
                "paper_count": 0
            }
    
    def _get_evidence_snippets(
        self, 
        subgraph_data: Dict, 
        question: str
    ) -> List[Dict[str, str]]:
        """Extract relevant text snippets from papers"""
        snippets = []
        
        for paper in subgraph_data.get('papers', [])[:5]:  # Top 5 papers
            if paper and isinstance(paper, dict):
                snippet = {
                    "paper_id": paper.get('pmid', 'unknown'),
                    "title": paper.get('title', 'No title'),
                    "year": paper.get('publication_year', 'Unknown'),
                    "text": paper.get('abstract', '')[:500]  # First 500 chars
                }
                snippets.append(snippet)
        
        return snippets
    
    def _generate_llm_answer(
        self, 
        question: str, 
        subgraph_data: Dict, 
        snippets: List[Dict]
    ) -> str:
        """Generate answer using LLM with KG context"""
        
        # Build context from knowledge graph
        context_parts = []
        
        # Add entity information
        if subgraph_data['nodes']:
            entity_names = [n['label'] for n in subgraph_data['nodes'] if n['type'] != 'Paper']
            context_parts.append(f"Relevant entities: {', '.join(entity_names[:10])}")
        
        # Add paper information
        if subgraph_data['papers']:
            papers_info = []
            for paper in subgraph_data['papers'][:5]:
                if isinstance(paper, dict):
                    title = paper.get('title', 'Unknown')
                    year = paper.get('publication_year', 'Unknown')
                    papers_info.append(f"- {title} ({year})")
            context_parts.append("Research papers:\n" + "\n".join(papers_info))
        
        # Add text snippets
        if snippets:
            snippet_texts = []
            for snippet in snippets[:3]:
                snippet_texts.append(f"[{snippet['title']}]: {snippet['text']}")
            context_parts.append("Evidence:\n" + "\n\n".join(snippet_texts))
        
        context = "\n\n".join(context_parts)
        
        # Build prompt
        system_prompt = """You are an expert space biology research assistant. 
Your role is to answer questions based ONLY on the provided knowledge graph data and research papers.
Always cite your sources by mentioning the paper titles or years.
If the provided context doesn't contain enough information, say so clearly.
Be concise but informative."""
        
        user_prompt = f"""Context from knowledge graph and research papers:

{context}

Question: {question}

Please provide a clear, cited answer based on the above context."""
        
        try:
            if self.llm_provider == "openai":
                response = self.llm_client.chat.completions.create(
                    model="gpt-3.5-turbo",  # Use gpt-4 if available
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.3,
                    max_tokens=500
                )
                return response.choices[0].message.content
            
            elif self.llm_provider == "anthropic":
                response = self.llm_client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=500,
                    messages=[
                        {"role": "user", "content": f"{system_prompt}\n\n{user_prompt}"}
                    ]
                )
                return response.content[0].text
            
        except Exception as e:
            logger.error(f"❌ LLM generation error: {e}")
            return self._generate_fallback_answer(question, subgraph_data)
        
        return self._generate_fallback_answer(question, subgraph_data)
    
    def _generate_fallback_answer(
        self, 
        question: str, 
        subgraph_data: Dict
    ) -> str:
        """Generate answer without LLM using structured data"""
        
        paper_count = subgraph_data['paper_count']
        entity_count = subgraph_data['node_count']
        
        if paper_count == 0:
            return f"I couldn't find relevant research papers in the knowledge graph for your question: '{question}'. Try rephrasing or using different keywords like 'microgravity', 'bone loss', or 'radiation'."
        
        papers = subgraph_data.get('papers', [])
        
        answer_parts = [
            f"Based on {paper_count} research paper(s) in our knowledge graph:",
            ""
        ]
        
        # List papers
        for i, paper in enumerate(papers[:5], 1):
            if isinstance(paper, dict):
                title = paper.get('title', 'Unknown')
                year = paper.get('publication_year', 'Unknown')
                answer_parts.append(f"{i}. {title} ({year})")
        
        answer_parts.append("")
        answer_parts.append(f"The knowledge graph shows {entity_count} related entities. ")
        answer_parts.append("For detailed synthesis, please set up an LLM API key (OpenAI or Anthropic).")
        
        return "\n".join(answer_parts)
    
    def _format_sources(self, subgraph_data: Dict) -> List[Dict[str, Any]]:
        """Format papers as citation sources"""
        sources = []
        
        for paper in subgraph_data.get('papers', []):
            if isinstance(paper, dict):
                source = {
                    "type": "research_paper",
                    "id": paper.get('pmid', 'unknown'),
                    "title": paper.get('title', 'Unknown'),
                    "year": paper.get('publication_year'),
                    "url": f"https://pubmed.ncbi.nlm.nih.gov/{paper.get('pmid', '')}" if paper.get('pmid') else None
                }
                sources.append(source)
        
        return sources


# Convenience function for testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    rag = KnowledgeGraphRAG()
    
    # Test questions
    questions = [
        "What are the effects of microgravity on bone density?",
        "How does spaceflight affect the immune system?",
        "What countermeasures exist for muscle atrophy in space?"
    ]
    
    for question in questions:
        print(f"\n{'='*60}")
        print(f"Q: {question}")
        print('='*60)
        
        response = rag.answer_question(question)
        
        print(f"\nAnswer:\n{response['answer']}")
        print(f"\nSources: {len(response['sources'])} papers")
        print(f"Subgraph: {response['metadata']['entity_count']} entities, {response['metadata']['paper_count']} papers")
