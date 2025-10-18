"""
Knowledge Graph API Routes
Provides endpoints for querying the Neo4j knowledge graph
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from knowledge_graph.query_engine import QueryEngine
import logging, os

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["knowledge-graph"])

# Initialize query engine
query_engine = None


def get_query_engine():
    """Get or initialize query engine"""
    global query_engine
    if query_engine is None:
        query_engine = QueryEngine()
    return query_engine


# Pydantic models
class Node(BaseModel):
    id: str
    type: str
    properties: Dict[str, Any]


class Edge(BaseModel):
    source: str
    target: str
    type: str
    properties: Optional[Dict[str, Any]] = {}


class CytoscapeNode(BaseModel):
    data: Dict[str, Any]


class CytoscapeEdge(BaseModel):
    data: Dict[str, Any]


class GraphData(BaseModel):
    nodes: List[CytoscapeNode]
    edges: List[CytoscapeEdge]


class Statistics(BaseModel):
    total_papers: int
    total_relationships: int
    total_stressors: int
    total_phenotypes: int


class Entity(BaseModel):
    id: str
    name: str
    type: str
    description: Optional[str] = None
    paper_count: Optional[int] = 0


@router.get("/statistics", response_model=Statistics)
async def get_statistics():
    """Get overview statistics of the knowledge graph"""
    try:
        qe = get_query_engine()
        
        # Count nodes by type
        papers_query = "MATCH (n:Paper) RETURN count(n) as count"
        stressors_query = "MATCH (n:Stressor) RETURN count(n) as count"
        phenotypes_query = "MATCH (n:Phenotype) RETURN count(n) as count"
        relationships_query = "MATCH ()-[r]->() RETURN count(r) as count"
        
        papers = qe.execute_query(papers_query)[0]["count"] if qe.execute_query(papers_query) else 0
        stressors = qe.execute_query(stressors_query)[0]["count"] if qe.execute_query(stressors_query) else 0
        phenotypes = qe.execute_query(phenotypes_query)[0]["count"] if qe.execute_query(phenotypes_query) else 0
        relationships = qe.execute_query(relationships_query)[0]["count"] if qe.execute_query(relationships_query) else 0
        
        return Statistics(
            total_papers=papers,
            total_relationships=relationships,
            total_stressors=stressors,
            total_phenotypes=phenotypes
        )
    except Exception as e:
        logger.error(f"Error getting statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/graph/cytoscape", response_model=GraphData)
async def get_cytoscape_graph(limit: int = Query(100, ge=1, le=1000)):
    """Get graph data in Cytoscape.js format"""
    try:
        qe = get_query_engine()
        
        # Get nodes and relationships
        query = f"""
        MATCH (n)
        WITH n LIMIT {limit}
        OPTIONAL MATCH (n)-[r]->(m)
        RETURN n, r, m
        """
        
        results = qe.execute_query(query)
        
        nodes_dict = {}
        edges = []
        
        for record in results:
            # Process source node
            if record.get("n"):
                node = record["n"]
                node_id = str(node.element_id)
                if node_id not in nodes_dict:
                    labels = list(node.labels)
                    props = dict(node)
                    nodes_dict[node_id] = {
                        "data": {
                            "id": node_id,
                            "label": props.get("name", props.get("title", node_id[:8])),
                            "type": labels[0] if labels else "Unknown",
                            **props
                        }
                    }
            
            # Process target node
            if record.get("m"):
                node = record["m"]
                node_id = str(node.element_id)
                if node_id not in nodes_dict:
                    labels = list(node.labels)
                    props = dict(node)
                    nodes_dict[node_id] = {
                        "data": {
                            "id": node_id,
                            "label": props.get("name", props.get("title", node_id[:8])),
                            "type": labels[0] if labels else "Unknown",
                            **props
                        }
                    }
            
            # Process relationship
            if record.get("r"):
                rel = record["r"]
                edges.append({
                    "data": {
                        "id": str(rel.element_id),
                        "source": str(rel.start_node.element_id),
                        "target": str(rel.end_node.element_id),
                        "type": rel.type,
                        **dict(rel)
                    }
                })
        
        return GraphData(
            nodes=list(nodes_dict.values()),
            edges=edges
        )
        
    except Exception as e:
        logger.error(f"Error getting graph: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stressors", response_model=List[Entity])
async def get_stressors():
    """Get all stressors"""
    try:
        qe = get_query_engine()
        
        query = """
        MATCH (s:Stressor)
        OPTIONAL MATCH (s)<-[:HAS_STRESSOR]-(p:Paper)
        RETURN s, count(p) as paper_count
        ORDER BY paper_count DESC
        """
        
        results = qe.execute_query(query)
        
        stressors = []
        for record in results:
            node = record["s"]
            props = dict(node)
            stressors.append(Entity(
                id=str(node.element_id),
                name=props.get("name", "Unknown"),
                type="STRESSOR",
                description=props.get("description"),
                paper_count=record.get("paper_count", 0)
            ))
        
        return stressors
        
    except Exception as e:
        logger.error(f"Error getting stressors: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/phenotypes", response_model=List[Entity])
async def get_phenotypes():
    """Get all phenotypes"""
    try:
        qe = get_query_engine()
        
        query = """
        MATCH (p:Phenotype)
        OPTIONAL MATCH (p)<-[:HAS_PHENOTYPE]-(paper:Paper)
        RETURN p, count(paper) as paper_count
        ORDER BY paper_count DESC
        """
        
        results = qe.execute_query(query)
        
        phenotypes = []
        for record in results:
            node = record["p"]
            props = dict(node)
            phenotypes.append(Entity(
                id=str(node.element_id),
                name=props.get("name", "Unknown"),
                type="PHENOTYPE",
                description=props.get("description"),
                paper_count=record.get("paper_count", 0)
            ))
        
        return phenotypes
        
    except Exception as e:
        logger.error(f"Error getting phenotypes: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class SearchResult(BaseModel):
    id: str
    name: str
    type: str
    excerpt: Optional[str] = None
    relevance: float


def _sample_graph_data(query: str):
    """Return a small static graph for mock/offline mode."""
    root_id = f"entity:{query.lower()}"
    nodes = [
        {"id": root_id, "label": query.title(), "type": "entity", "group": 1},
        {"id": "paper:123456", "label": f"{query.title()} Effects in Microgravity", "type": "paper", "group": 2, "title": f"{query.title()} Effects in Microgravity", "paperId": "123456"},
        {"id": "entity:microgravity", "label": "Microgravity", "type": "entity", "group": 1},
        {"id": "entity:bone-loss", "label": "Bone Loss", "type": "entity", "group": 1},
    ]
    links = [
        {"source": root_id, "target": "paper:123456", "type": "MENTIONED_IN", "value": 1},
        {"source": "paper:123456", "target": "entity:microgravity", "type": "ASSOCIATED_WITH", "value": 1},
        {"source": "paper:123456", "target": "entity:bone-loss", "type": "ASSOCIATED_WITH", "value": 1},
    ]
    return {
        "nodes": nodes,
        "links": links
    }


@router.get("/neo4j-status")
async def neo4j_status():
    """Lightweight diagnostic endpoint to confirm Neo4j connectivity and basic stats.

    NOTE: Remove or protect this endpoint in production; it's purely for local debugging.
    """
    try:
        qe = get_query_engine()
        stats = {}
        def first_count(cq: str):
            try:
                r = qe.execute_query(cq)
                return r[0]['count'] if r else 0
            except Exception:
                return None
        stats['papers'] = first_count("MATCH (n:Paper) RETURN count(n) as count")
        stats['relationships'] = first_count("MATCH ()-[r]->() RETURN count(r) as count")
        stats['nodes_total'] = first_count("MATCH (n) RETURN count(n) as count")
        return {"status":"ok","neo4j_uri":get_query_engine().uri,"database":get_query_engine().database,"stats":stats}
    except Exception as e:
        logger.error(f"Neo4j status check failed: {e}")
        return {"status":"error","detail":str(e)}


@router.get("/graph-stats")
async def graph_stats():
    """Fast aggregate counts for UI dashboards."""
    try:
        qe = get_query_engine()
        cypher = """
        CALL { MATCH (p:Paper) RETURN count(p) AS papers }
        CALL { MATCH ()-[r]->() RETURN count(r) AS relationships }
        CALL { MATCH (n) RETURN count(n) AS nodes }
        RETURN papers, relationships, nodes
        """
        res = qe.execute_query(cypher)
        return res[0] if res else {"papers":0,"relationships":0,"nodes":0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/knowledge-graph")
async def get_knowledge_graph(
    q: str = Query(..., min_length=1),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    """
    Get knowledge graph for a search query
    Returns nodes and edges for visualization
    """
    try:
        kg_mock = os.getenv("KG_MOCK") == "1"
        logger.info(f"[KG] Incoming query='{q}' mock={kg_mock}")
        if kg_mock:
            logger.info("[KG] Returning mock graph (KG_MOCK=1)")
            return _sample_graph_data(q)

        qe = get_query_engine()
        
        # Search for entities and papers matching the query
        # Exclude demo papers (check for NULL first to avoid issues)
        search_query = """
        MATCH (n)
        WHERE (toLower(n.name) CONTAINS toLower($query) 
           OR toLower(n.title) CONTAINS toLower($query) 
           OR toLower(n.description) CONTAINS toLower($query))
        AND NOT (
            (n.id IS NOT NULL AND n.id STARTS WITH 'DEMO') OR 
            (n.pmid IS NOT NULL AND n.pmid STARTS WITH 'DEMO')
        )
        WITH DISTINCT 
            CASE 
                WHEN 'Paper' IN labels(n) THEN coalesce(n.id, n.pmid, toString(id(n)))
                ELSE toString(id(n))
            END as nodeKey,
            n
        ORDER BY nodeKey
        SKIP $offset
        LIMIT $limit
        WITH collect({node: n, key: nodeKey}) as nodes
        UNWIND nodes as nodeData
        WITH nodeData.node as n, nodeData.key as nKey
        OPTIONAL MATCH (n)-[r]-(m)
        WHERE NOT (
            (m.id IS NOT NULL AND m.id STARTS WITH 'DEMO') OR 
            (m.pmid IS NOT NULL AND m.pmid STARTS WITH 'DEMO')
        )
        RETURN DISTINCT n, r, m, nKey
        """
        results = qe.execute_query(search_query, {"query": q, "limit": limit, "offset": offset})
        
        # Build graph structure
        nodes_dict = {}
        edges = []
        
        for record in results:
            # Process main node
            if record.get("n"):
                node = record["n"]
                labels = list(node.labels)
                props = dict(node)
                node_type = labels[0] if labels else "Unknown"
                
                # Use paper ID for papers, element_id for others
                if node_type == "Paper":
                    node_id = props.get("id", props.get("pmid", str(node.element_id)))
                else:
                    node_id = str(node.element_id)
                
                if node_id not in nodes_dict:
                    node_data = {
                        "id": node_id,
                        "label": props.get("name", props.get("title", node_id[:8])),
                        "type": node_type.lower(),  # lowercase for frontend
                        "group": hash(node_type) % 10 if labels else 0,
                        **props
                    }
                    
                    # Add paperId for Paper nodes
                    if node_type == "Paper":
                        node_data["paperId"] = node_id
                    
                    nodes_dict[node_id] = node_data
            
            # Process connected node
            if record.get("m"):
                node = record["m"]
                labels = list(node.labels)
                props = dict(node)
                node_type = labels[0] if labels else "Unknown"
                
                # Use paper ID for papers, element_id for others
                if node_type == "Paper":
                    node_id = props.get("id", props.get("pmid", str(node.element_id)))
                else:
                    node_id = str(node.element_id)
                
                if node_id not in nodes_dict:
                    # Build node data - include only necessary properties
                    node_data = {
                        "id": node_id,
                        "label": props.get("name", props.get("title", node_id[:8])),
                        "type": node_type.lower(),
                        "group": hash(node_type) % 10 if labels else 0,
                    }
                    
                    # Add properties selectively
                    if "title" in props:
                        node_data["title"] = props["title"]
                    if "name" in props:
                        node_data["name"] = props["name"]
                    if "abstract" in props:
                        node_data["abstract"] = props["abstract"]
                    
                    # Add paperId for Paper nodes
                    if node_type == "Paper":
                        node_data["paperId"] = node_id
                    
                    nodes_dict[node_id] = node_data
            
            # Process relationship
            if record.get("r"):
                rel = record["r"]
                
                # Get source node ID
                source_node = rel.start_node
                source_labels = list(source_node.labels)
                source_type = source_labels[0] if source_labels else "Unknown"
                if source_type == "Paper":
                    source_props = dict(source_node)
                    source_id = source_props.get("id", source_props.get("pmid", str(source_node.element_id)))
                else:
                    source_id = str(source_node.element_id)
                
                # Get target node ID
                target_node = rel.end_node
                target_labels = list(target_node.labels)
                target_type = target_labels[0] if target_labels else "Unknown"
                if target_type == "Paper":
                    target_props = dict(target_node)
                    target_id = target_props.get("id", target_props.get("pmid", str(target_node.element_id)))
                else:
                    target_id = str(target_node.element_id)
                
                edges.append({
                    "source": source_id,
                    "target": target_id,
                    "type": rel.type,
                    "value": 1
                })
        
        return {
            "nodes": list(nodes_dict.values()),
            "links": edges
        }
        
    except Exception as e:
        logger.error(f"Error getting knowledge graph: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/kg-config")
async def kg_config():
    """Debug endpoint to inspect server-side KG configuration and (optionally) test Neo4j connectivity.
    This should be removed or protected before production.
    """
    cfg = {
        "KG_MOCK": os.getenv("KG_MOCK"),
        "NEO4J_URI": os.getenv("NEO4J_URI"),
        "NEO4J_USER": os.getenv("NEO4J_USER"),
        "NEO4J_DATABASE": os.getenv("NEO4J_DATABASE"),
    }
    if os.getenv("KG_MOCK") != "1":
        try:
            qe = get_query_engine()
            test = qe.execute_query("MATCH (n) RETURN count(n) as count LIMIT 1")
            cfg["neo4j_connection"] = "ok"
            cfg["node_count_sample"] = test[0]["count"] if test else 0
        except Exception as e:
            cfg["neo4j_connection"] = f"error: {e}" 
    else:
        cfg["neo4j_connection"] = "skipped (KG_MOCK=1)"
    return cfg

@router.get("/health-full")
async def health_full():
    """Deep health check: API + Neo4j counts. Not for production use without auth."""
    payload = {"api": "ok"}
    try:
        qe = get_query_engine()
        counts = {}
        metrics = {
            "papers": "MATCH (p:Paper) RETURN count(p) AS c",
            "nodes": "MATCH (n) RETURN count(n) AS c",
            "relationships": "MATCH ()-[r]->() RETURN count(r) AS c"
        }
        for label, cypher in metrics.items():
            try:
                r = qe.execute_query(cypher)
                counts[label] = r[0]["c"] if r else 0
            except Exception as inner:
                counts[label] = f"error:{inner}"  # continue
        payload["neo4j"] = "ok"
        payload["counts"] = counts
    except Exception as e:
        payload["neo4j"] = f"error:{e}"
    return payload


@router.post("/search", response_model=List[SearchResult])
async def search_entities(query: str = Query(..., min_length=1)):
    """Search for entities by name or description"""
    try:
        qe = get_query_engine()
        
        cypher_query = """
        MATCH (n)
        WHERE n.name CONTAINS $query OR n.title CONTAINS $query OR n.description CONTAINS $query
        RETURN n, labels(n) as types
        LIMIT 20
        """
        
        results = qe.execute_query(cypher_query, {"query": query})
        
        search_results = []
        for record in results:
            node = record["n"]
            props = dict(node)
            types = record["types"]
            
            name = props.get("name", props.get("title", "Unknown"))
            relevance = 1.0 if query.lower() in name.lower() else 0.5
            
            search_results.append(SearchResult(
                id=str(node.element_id),
                name=name,
                type=types[0] if types else "Unknown",
                excerpt=props.get("description", props.get("abstract", ""))[:200],
                relevance=relevance
            ))
        
        # Sort by relevance
        search_results.sort(key=lambda x: x.relevance, reverse=True)
        
        return search_results
        
    except Exception as e:
        logger.error(f"Error searching: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/paper/{paper_id}")
async def get_paper(paper_id: str):
    """Get paper details by ID"""
    try:
        qe = get_query_engine()
        
        # Query for paper by ID (could be PMID or internal ID)
        query = """
        MATCH (p:Paper)
        WHERE p.id = $paper_id OR p.pmid = $paper_id OR elementId(p) = $paper_id
        OPTIONAL MATCH (p)-[r:MENTIONS]->(e)
        RETURN p, collect({entity: e, relationship: r}) as entities
        """
        
        results = qe.execute_query(query, {"paper_id": paper_id})
        
        if not results:
            raise HTTPException(status_code=404, detail=f"Paper {paper_id} not found")
        
        record = results[0]
        paper = record["p"]
        props = dict(paper)
        
        # Get entities mentioned in the paper
        entities = []
        for item in record.get("entities", []):
            if item.get("entity"):
                entity = item["entity"]
                entity_props = dict(entity)
                entities.append({
                    "id": str(entity.element_id),
                    "name": entity_props.get("name", "Unknown"),
                    "type": list(entity.labels)[0] if entity.labels else "Unknown"
                })
        
        # Get paper ID - could be PMID or PMC ID
        paper_id_value = props.get("id", props.get("pmid", ""))
        pmid_value = props.get("pmid", "")
        
        # Construct URL - handle both PMID and PMC IDs, skip demo papers
        if paper_id_value and paper_id_value.startswith("DEMO"):
            # Demo paper - no URL
            paper_url = ""
        elif pmid_value and not pmid_value.startswith("DEMO"):
            paper_url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid_value}"
        elif paper_id_value and paper_id_value.startswith("PMC"):
            paper_url = f"https://www.ncbi.nlm.nih.gov/pmc/articles/{paper_id_value}/"
        else:
            paper_url = ""
        
        return {
            "id": paper_id_value or str(paper.element_id),
            "title": props.get("title", "Unknown Title"),
            "abstract": props.get("abstract", ""),
            "authors": props.get("authors", []),
            "journal": props.get("journal", ""),
            "year": props.get("year", ""),
            "pmid": pmid_value,
            "url": paper_url,
            "entities": entities
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting paper: {e}")
        raise HTTPException(status_code=500, detail=str(e))
