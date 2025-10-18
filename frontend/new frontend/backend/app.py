"""
Temporary Local Backend for Knowledge Graph
This is a simple Flask backend that can be easily removed when transitioning to the main backend.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Research papers database
RESEARCH_PAPERS = [
    {
        "id": "PMC4136787",
        "title": "Mice in Bion-M 1 space mission: training and selection",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4136787/",
        "entities": ["mice", "microgravity", "space mission", "animal selection", "training protocols"],
        "year": 2014
    },
    {
        "id": "PMC3630201",
        "title": "Microgravity induces pelvic bone loss through osteoclastic activity, osteocytic osteolysis, and osteoblastic cell cycle inhibition by CDKN1a/p21",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3630201/",
        "entities": ["bone loss", "microgravity", "osteoclast", "CDKN1a", "p21", "osteolysis", "cell cycle"],
        "year": 2013
    },
    {
        "id": "PMC11988870",
        "title": "Stem Cell Health and Tissue Regeneration in Microgravity",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11988870/",
        "entities": ["stem cells", "microgravity", "tissue regeneration", "cell differentiation"],
        "year": 2024
    },
    {
        "id": "PMC7998608",
        "title": "Microgravity Reduces the Differentiation and Regenerative Potential of Embryonic Stem Cells",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7998608/",
        "entities": ["embryonic stem cells", "microgravity", "differentiation", "regenerative potential"],
        "year": 2021
    },
    {
        "id": "PMC5587110",
        "title": "Microgravity validation of a novel system for RNA isolation and multiplex quantitative real time PCR analysis of gene expression on the International Space Station",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5587110/",
        "entities": ["RNA isolation", "gene expression", "PCR", "ISS", "microgravity", "molecular biology"],
        "year": 2017
    },
    {
        "id": "PMC8396460",
        "title": "Spaceflight Modulates the Expression of Key Oxidative Stress and Cell Cycle Related Genes in Heart",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8396460/",
        "entities": ["spaceflight", "oxidative stress", "cell cycle", "heart", "gene expression", "cardiac tissue"],
        "year": 2021
    },
    {
        "id": "PMC5666799",
        "title": "Dose- and Ion-Dependent Effects in the Oxidative Stress Response to Space-Like Radiation Exposure in the Skeletal System",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5666799/",
        "entities": ["radiation", "oxidative stress", "skeletal system", "space radiation", "ion exposure"],
        "year": 2017
    },
    {
        "id": "PMC5460236",
        "title": "From the bench to exploration medicine: NASA life sciences translational research for human exploration and habitation missions",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5460236/",
        "entities": ["NASA", "translational research", "space exploration", "life sciences", "human missions"],
        "year": 2017
    },
    {
        "id": "PMC6222041",
        "title": "High-precision method for cyclic loading of small-animal vertebrae to assess bone quality",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6222041/",
        "entities": ["bone quality", "vertebrae", "cyclic loading", "biomechanics", "animal models"],
        "year": 2018
    },
    {
        "id": "PMC6813909",
        "title": "Effects of ex vivo ionizing radiation on collagen structure and whole-bone mechanical properties of mouse vertebrae",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6813909/",
        "entities": ["ionizing radiation", "collagen", "bone mechanics", "vertebrae", "radiation effects"],
        "year": 2019
    },
    {
        "id": "PMC4095884",
        "title": "Absence of gamma-sarcoglycan alters the response of p70S6 kinase to mechanical perturbation in murine skeletal muscle",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4095884/",
        "entities": ["gamma-sarcoglycan", "p70S6 kinase", "skeletal muscle", "mechanical stress", "protein signaling"],
        "year": 2014
    },
    {
        "id": "PMC3040128",
        "title": "AtRabD2b and AtRabD2c have overlapping functions in pollen development and pollen tube growth",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3040128/",
        "entities": ["AtRabD2b", "AtRabD2c", "pollen development", "arabidopsis", "plant biology"],
        "year": 2011
    },
    {
        "id": "PMC3177255",
        "title": "TNO1 is involved in salt tolerance and vacuolar trafficking in Arabidopsis",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3177255/",
        "entities": ["TNO1", "salt tolerance", "vacuolar trafficking", "arabidopsis", "plant stress"],
        "year": 2011
    },
    {
        "id": "PMC11500582",
        "title": "Functional redundancy between trans-Golgi network SNARE family members in Arabidopsis thaliana",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11500582/",
        "entities": ["SNARE proteins", "trans-Golgi network", "arabidopsis thaliana", "protein trafficking", "cellular biology"],
        "year": 2024
    }
]

# Build entity to papers mapping
def build_entity_index():
    """Build an index mapping entities to papers"""
    entity_index = {}
    for paper in RESEARCH_PAPERS:
        for entity in paper['entities']:
            entity_lower = entity.lower()
            if entity_lower not in entity_index:
                entity_index[entity_lower] = []
            entity_index[entity_lower].append(paper)
    return entity_index

ENTITY_INDEX = build_entity_index()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "Backend is running"})

@app.route('/api/search', methods=['GET'])
def search():
    """Search for entities and return related papers"""
    query = request.args.get('q', '').lower().strip()
    
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400
    
    # Find matching entities
    matching_papers = set()
    matching_entities = []
    
    for entity, papers in ENTITY_INDEX.items():
        if query in entity:
            matching_entities.append(entity)
            for paper in papers:
                matching_papers.add(paper['id'])
    
    # Convert to list and get full paper objects
    result_papers = [p for p in RESEARCH_PAPERS if p['id'] in matching_papers]
    
    return jsonify({
        "query": query,
        "matching_entities": matching_entities,
        "papers": result_papers,
        "count": len(result_papers)
    })

@app.route('/api/knowledge-graph', methods=['GET'])
def knowledge_graph():
    """Generate knowledge graph data for a given entity"""
    query = request.args.get('q', '').lower().strip()
    
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400
    
    # Find papers related to the query
    related_papers = []
    root_entity = None
    
    for entity, papers in ENTITY_INDEX.items():
        if query in entity:
            if not root_entity:
                root_entity = entity
            related_papers.extend(papers)
    
    if not root_entity:
        return jsonify({"error": f"No entity found matching '{query}'"}), 404
    
    # Remove duplicates
    unique_papers = {p['id']: p for p in related_papers}.values()
    
    # Build graph structure
    nodes = [
        {
            "id": f"entity_{root_entity}",
            "label": root_entity.title(),
            "type": "entity",
            "group": 1
        }
    ]
    
    links = []
    
    for paper in unique_papers:
        node_id = f"paper_{paper['id']}"
        nodes.append({
            "id": node_id,
            "label": paper['title'][:60] + "..." if len(paper['title']) > 60 else paper['title'],
            "type": "paper",
            "group": 2,
            "paperId": paper['id'],
            "url": paper['url'],
            "fullTitle": paper['title']
        })
        
        links.append({
            "source": f"entity_{root_entity}",
            "target": node_id,
            "value": 1
        })
    
    # Add connections between papers that share entities
    paper_list = list(unique_papers)
    for i, paper1 in enumerate(paper_list):
        for paper2 in paper_list[i+1:]:
            shared_entities = set(paper1['entities']) & set(paper2['entities'])
            if len(shared_entities) > 2:  # Only connect if they share multiple entities
                links.append({
                    "source": f"paper_{paper1['id']}",
                    "target": f"paper_{paper2['id']}",
                    "value": len(shared_entities) * 0.5
                })
    
    return jsonify({
        "query": query,
        "rootEntity": root_entity,
        "nodes": nodes,
        "links": links,
        "paperCount": len(list(unique_papers))
    })

@app.route('/api/paper/<paper_id>', methods=['GET'])
def get_paper(paper_id):
    """Get details of a specific paper"""
    paper = next((p for p in RESEARCH_PAPERS if p['id'] == paper_id), None)
    
    if not paper:
        return jsonify({"error": "Paper not found"}), 404
    
    return jsonify(paper)

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Space Biology Knowledge Graph Backend")
    print("=" * 60)
    print("Backend is running on: http://localhost:5000")
    print("API Endpoints:")
    print("  - GET /api/health - Health check")
    print("  - GET /api/search?q=<query> - Search entities")
    print("  - GET /api/knowledge-graph?q=<query> - Get knowledge graph")
    print("  - GET /api/paper/<id> - Get paper details")
    print("=" * 60)
    print("\n⚠️  This is a temporary backend for development.")
    print("    Remove this folder when integrating with main backend.\n")
    app.run(debug=True, port=5000)
