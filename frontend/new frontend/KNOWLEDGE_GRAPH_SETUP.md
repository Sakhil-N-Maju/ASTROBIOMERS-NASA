# Knowledge Graph Feature - Setup Guide

## 🚀 Quick Start

The Knowledge Graph feature has been successfully added to your Bio-Star-Insight application! Here's how to get started:

### 1. Start the Python Backend

First, install Python dependencies and start the temporary backend:

```powershell
# Navigate to the backend folder
cd backend

# Install Python dependencies (Flask and Flask-CORS)
pip install -r requirements.txt

# Start the backend server
python app.py
```

The backend will start on `http://localhost:5000`

### 2. Start the Frontend (if not already running)

In a new terminal:

```powershell
npm run dev
```

### 3. Access the Knowledge Graph

- Navigate to your application (usually `http://localhost:8080` or similar)
- Click on "Knowledge Graph" in the navigation bar
- Try searching for:
  - `stem cells`
  - `microgravity`
  - `bone loss`
  - `radiation`
  - `arabidopsis`

## 📊 How It Works

### Backend (Python Flask)
Located in `/backend/`:
- **app.py** - Main Flask application with API endpoints
- **requirements.txt** - Python dependencies
- **README.md** - Backend documentation

#### API Endpoints:
- `GET /api/health` - Health check
- `GET /api/search?q=<query>` - Search for entities
- `GET /api/knowledge-graph?q=<query>` - Generate graph data
- `GET /api/paper/<id>` - Get paper details

### Frontend (React + TypeScript + D3.js)
- **KnowledgeGraph.tsx** - Main page component with interactive visualization
- Uses D3.js force-directed graph layout
- Interactive nodes with drag, zoom, and click functionality

### Data Structure

The backend contains 14 research papers with:
- Title
- PMC ID
- URL to full article
- Related entities (genes, proteins, biological processes)
- Publication year

## 🎨 Features

1. **Interactive Search**
   - Search for any biological entity (protein, gene, process, etc.)
   - Real-time graph generation

2. **Force-Directed Graph**
   - Blue nodes = Entity/Concept (root of search)
   - Green nodes = Research Papers
   - Drag nodes to rearrange
   - Scroll to zoom in/out
   - Click papers to view details

3. **Paper Details Panel**
   - View full paper information
   - See related entities
   - Open full article in new tab

4. **Smart Connections**
   - Papers are connected if they share multiple entities
   - Connection strength shown by line thickness

## 🔄 When Moving to Main Backend

When you're ready to integrate with your main backend on the other laptop:

1. **Stop the Flask server** (Ctrl+C)

2. **Delete the backend folder**:
   ```powershell
   Remove-Item -Recurse -Force backend
   ```

3. **Update API URL** in `src/pages/KnowledgeGraph.tsx`:
   ```typescript
   // Change this line:
   const API_BASE_URL = 'http://localhost:5000/api';
   
   // To your main backend URL:
   const API_BASE_URL = 'https://your-main-backend.com/api';
   ```

4. **Ensure your main backend implements these endpoints**:
   - `/api/knowledge-graph?q=<query>` - Returns graph data
   - `/api/paper/<id>` - Returns paper details

## 📝 Example Searches

Try these searches to see the knowledge graph in action:

- **Stem Cells**: Shows research on stem cell behavior in microgravity
- **Microgravity**: Displays all papers related to microgravity effects
- **Bone Loss**: Visualizes bone health research in space
- **Radiation**: Shows radiation effects on biological systems
- **Arabidopsis**: Plant biology in space research

## 🎯 Technical Details

### Graph Algorithm
- Uses D3.js force simulation
- Force-directed layout automatically positions nodes
- Physics-based simulation for natural clustering

### Node Types
1. **Entity Nodes** (Blue, Large)
   - Root concept from search
   - 30px radius
   - Bold label

2. **Paper Nodes** (Green, Medium)  
   - Research papers
   - 20px radius
   - Truncated title

### Interactions
- **Drag**: Move nodes around
- **Zoom**: Mouse wheel or pinch
- **Click**: View paper details
- **Hover**: Highlight and enlarge node

## 🛠️ Troubleshooting

### Backend Issues

**Error: "Failed to fetch"**
- Make sure Python backend is running: `python backend/app.py`
- Check that port 5000 is not blocked

**Error: "No module named flask"**
- Install dependencies: `pip install -r backend/requirements.txt`

### Frontend Issues

**Graph not showing**
- Check browser console for errors
- Ensure D3.js is installed: `npm install d3 @types/d3`

**Vite build errors**
- Clear node_modules and reinstall: `npm install`

## 📚 Data Source

The backend currently contains 14 research papers from NCBI PubMed Central covering:
- Space biology experiments
- Microgravity effects on cells and tissues
- Radiation exposure studies
- Plant biology in space
- Bone and muscle health
- Molecular biology techniques

All papers include direct links to the full articles on NCBI.

## 🎓 Based on BioKG Principles

This implementation follows the Biomedical Knowledge Graph (BKG) approach as described in your reference documentation:

- **Entities**: Biological terms, proteins, genes, processes
- **Relations**: Connections between entities and papers
- **Graph Model**: G = (E, R, T) where E=entities, R=relations, T=triples
- **Semantic Search**: Find papers by biological concepts
- **Interactive Visualization**: Explore relationships visually

---

**Note**: This is a simplified implementation for development. Your main backend can expand this with:
- Full NLP-based entity extraction
- Topic modeling with BERTopic
- Integration with NASA GeneLab
- Real-time updates from PubMed
- Advanced relationship inference
