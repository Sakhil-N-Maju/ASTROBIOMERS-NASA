# Bio-Star-Insight - Space Biology Research Engine

**Your intelligent gateway to space biology experiments, research papers, and groundbreaking discoveries.**

## 🚀 Features

- **Interactive Hero Section** with video background
- **Research Library** with searchable database
- **Knowledge Graph Visualization** - Explore interconnected research papers and biological entities
- **Responsive Design** with dark theme
- **Modern UI** with shadcn/ui components

## 🧬 Knowledge Graph Feature

The Knowledge Graph feature allows you to visualize the relationships between biological entities (proteins, genes, processes) and research papers. It uses:

- **Interactive D3.js visualization** with force-directed graph layout
- **Real-time search** for biological entities
- **14 curated research papers** from NCBI PubMed Central
- **Python Flask backend** (temporary, easily removable)

**See [KNOWLEDGE_GRAPH_SETUP.md](KNOWLEDGE_GRAPH_SETUP.md) for detailed setup instructions.**

## Project info

**URL**: https://lovable.dev/projects/5d9e9164-511a-4562-9b84-b18ebeadf04d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5d9e9164-511a-4562-9b84-b18ebeadf04d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### 🧪 Running with Knowledge Graph

To use the Knowledge Graph feature, you need to run both the frontend and backend:

**Option 1: Use the startup scripts (Recommended)**

```powershell
# Start both frontend and backend automatically
.\start-app.ps1
```

**Option 2: Manual startup**

Terminal 1 (Backend):
```powershell
cd backend
pip install -r requirements.txt
python app.py
```

Terminal 2 (Frontend):
```powershell
npm run dev
```

Then navigate to the Knowledge Graph section in your app and search for entities like "stem cells", "microgravity", or "bone loss".

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

**Frontend:**
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- D3.js (for Knowledge Graph visualization)
- React Router

**Backend (Temporary):**
- Python 3.x
- Flask
- Flask-CORS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5d9e9164-511a-4562-9b84-b18ebeadf04d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
