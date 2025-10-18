# Temporary Local Backend

⚠️ **This is a temporary backend for development only.**

## Purpose
This Flask backend provides knowledge graph API endpoints while you're working on this laptop. It can be easily deleted when you move the frontend to your other laptop with the main backend.

## Installation

```bash
# Install Python dependencies
pip install -r requirements.txt
```

## Running the Backend

```bash
python app.py
```

The backend will start on `http://localhost:5000`

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/search?q=<query>` - Search for entities and get related papers
- `GET /api/knowledge-graph?q=<query>` - Get knowledge graph data for visualization
- `GET /api/paper/<id>` - Get details of a specific paper

## Example Usage

```bash
# Search for microgravity-related research
curl "http://localhost:5000/api/search?q=microgravity"

# Get knowledge graph for stem cells
curl "http://localhost:5000/api/knowledge-graph?q=stem cells"

# Get specific paper
curl "http://localhost:5000/api/paper/PMC4136787"
```

## Removal

When transitioning to the main backend:
1. Stop the Flask server
2. Delete the entire `backend` folder
3. Update the API base URL in the frontend to point to your main backend
