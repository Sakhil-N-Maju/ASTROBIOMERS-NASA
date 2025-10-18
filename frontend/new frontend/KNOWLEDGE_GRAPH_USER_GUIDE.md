# Knowledge Graph - User Guide

## 🎯 What is the Knowledge Graph?

The Knowledge Graph is an interactive visualization tool that helps you explore the connections between biological entities (like proteins, genes, and processes) and research papers in space biology.

## 🚀 Getting Started

### Step 1: Start the Backend
Run one of these commands in PowerShell:

```powershell
# Option A: Use the startup script
.\start-backend.ps1

# Option B: Manual start
cd backend
pip install -r requirements.txt
python app.py
```

You should see:
```
🚀 Space Biology Knowledge Graph Backend
Backend is running on: http://localhost:5000
```

### Step 2: Navigate to Knowledge Graph
1. Open your browser and go to your app (e.g., `http://localhost:8080`)
2. Click **"Knowledge Graph"** in the navigation bar

### Step 3: Search for Entities
Try searching for:
- **stem cells** - View stem cell research in microgravity
- **microgravity** - See all papers about microgravity effects
- **bone loss** - Explore bone health in space
- **radiation** - Radiation effects on biology
- **p21** - Specific protein research
- **arabidopsis** - Plant biology in space

## 🎨 How to Use the Graph

### Understanding the Visualization

**Node Types:**
- 🔵 **Blue circles** (large) = Your search entity (root node)
- 🟢 **Green circles** (medium) = Research papers related to your search

**Lines/Edges:**
- Connect the entity to related papers
- Thicker lines = stronger relationship (more shared entities)

### Interactions

1. **Drag Nodes**
   - Click and drag any node to move it around
   - The physics simulation will adjust other nodes accordingly

2. **Zoom**
   - Use mouse wheel to zoom in/out
   - Pinch gesture on trackpad also works

3. **Click Papers**
   - Click on any green (paper) node
   - Details appear in the right panel
   - Shows: Title, Year, Related Entities, Link to full article

4. **Reset View**
   - Refresh the page
   - Or perform a new search

## 📊 Reading the Graph

### Example: Searching "stem cells"

When you search for "stem cells", you'll see:

```
         Paper 1
            |
            |
    [Stem Cells] ---- Paper 2
            |
            |
         Paper 3 ---- Paper 4
```

- The central blue node is "stem cells"
- Green nodes are papers mentioning stem cells
- Papers 3 and 4 are connected because they share other entities (like "microgravity")

### What the Connections Mean

Papers are connected to each other when they:
- Share multiple biological entities
- Study similar processes
- Investigate related proteins/genes

The more entities papers share, the closer they cluster together.

## 🔍 Search Tips

### Broad Searches
- **"microgravity"** - Returns many papers (10+)
- **"space"** - Very broad, returns most papers
- **"cell"** - Returns papers about cellular processes

### Specific Searches
- **"CDKN1a"** - Specific gene
- **"p70S6 kinase"** - Specific protein
- **"osteoclast"** - Specific cell type

### Process Searches
- **"bone loss"** - Physiological process
- **"oxidative stress"** - Cellular process
- **"cell cycle"** - Biological process

## 📝 Viewing Paper Details

When you click a paper node:

1. **Title** - Full paper title appears in right panel
2. **ID** - PMC identifier (e.g., PMC4136787)
3. **Year** - Publication year
4. **Related Entities** - Tags showing all biological terms in the paper
5. **"Open Full Article"** button - Opens the paper on NCBI website

## 🎓 Example Workflow

**Scenario: You want to research bone loss in space**

1. Search for **"bone loss"**
   - Graph shows 2-3 papers directly related

2. Click on a paper node
   - View details in right panel
   - See related entities like "osteoclast", "CDKN1a", "microgravity"

3. Note interesting entities
   - See "CDKN1a" is mentioned

4. Search for **"CDKN1a"**
   - New graph shows all papers mentioning this gene
   - Discover connections to cell cycle research

5. Click "Open Full Article"
   - Read the full paper on NCBI
   - Return to Knowledge Graph to explore more

## 🛠️ Troubleshooting

### Graph Not Loading

**Problem:** "Failed to fetch" error

**Solutions:**
- ✓ Check backend is running: Look for "Backend is running" message
- ✓ Check URL: Should be `http://localhost:5000`
- ✓ Restart backend: `python backend/app.py`

### No Results Found

**Problem:** "No entity found matching 'xxx'"

**Solutions:**
- ✓ Try a different search term
- ✓ Use simpler terms (e.g., "bone" instead of "bone density loss")
- ✓ Check spelling
- ✓ Try related terms (e.g., "stem cell" vs "stem cells")

### Graph Looks Messy

**Solutions:**
- ✓ Drag nodes to untangle connections
- ✓ Zoom out to see full structure
- ✓ Try a more specific search to reduce number of nodes

## 🎯 Best Practices

1. **Start Broad, Then Narrow**
   - First search: "microgravity"
   - See interesting protein: "p21"
   - Second search: "p21"

2. **Use Paper Details**
   - Click papers to see entities
   - Use those entities for new searches

3. **Explore Connections**
   - When papers are connected, they share topics
   - Follow the connections to discover related research

4. **Save Interesting Papers**
   - Open full articles in new tabs
   - Bookmark for later reading

## 📚 Available Research Papers

Current database includes 14 papers covering:

- **Microgravity Effects** (8 papers)
  - Bone loss mechanisms
  - Stem cell behavior
  - Muscle physiology
  - Cardiac changes

- **Radiation Studies** (2 papers)
  - Oxidative stress
  - Skeletal system effects

- **Plant Biology** (3 papers)
  - Arabidopsis research
  - Cellular trafficking
  - Stress responses

- **Methodology** (1 paper)
  - RNA isolation techniques
  - Gene expression analysis

## 🔄 When to Use Knowledge Graph vs Research Page

**Use Knowledge Graph when:**
- Exploring connections between concepts
- Discovering related research
- Understanding research landscape
- Finding papers through biological entities

**Use Research Page when:**
- Browsing by mission/planet
- Keyword search in titles/summaries
- Quick overview of available research

## 💡 Pro Tips

1. **Physics Simulation**
   - The graph uses force-directed layout
   - Let it settle for a few seconds after search
   - More connected nodes stay closer together

2. **Entity Tags**
   - Each paper has 5-7 entity tags
   - These are the "keywords" that connect papers
   - Use these tags for new searches

3. **Zoom Strategy**
   - Zoom out: See overall structure
   - Zoom in: Read node labels clearly

4. **Multiple Searches**
   - Don't be afraid to search multiple times
   - Each search creates a new graph
   - Compare different perspectives

## 🚀 Future Enhancements

When integrated with main backend, you'll get:
- Real-time updates from NASA GeneLab
- Full PubMed database access
- AI-powered entity extraction
- Topic modeling and clustering
- Advanced filtering options
- Save and share graph views

---

**Questions or Issues?**
Check the [KNOWLEDGE_GRAPH_SETUP.md](KNOWLEDGE_GRAPH_SETUP.md) for technical documentation.
