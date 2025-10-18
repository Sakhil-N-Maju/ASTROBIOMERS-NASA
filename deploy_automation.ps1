# Deployment Automation Script
# Run this after you provide: GitHub username, Neo4j Aura URI, Neo4j Aura password

Write-Host "🚀 ASTROBIOMERS DEPLOYMENT AUTOMATION" -ForegroundColor Green
Write-Host "=" * 50

# YOU NEED TO FILL THESE:
$GITHUB_USERNAME = "NimaFathima"
$NEO4J_AURA_URI = "neo4j+s://d3ff59a7.databases.neo4j.io"
$NEO4J_AURA_PASSWORD = "<set-your-neo4j-password>"

Write-Host "`n📝 Configuration Check:" -ForegroundColor Cyan
Write-Host "  GitHub: $GITHUB_USERNAME"
Write-Host "  Neo4j URI: $NEO4J_AURA_URI"

if ($GITHUB_USERNAME -eq "YOUR_GITHUB_USERNAME_HERE") {
    Write-Host "`n❌ ERROR: You need to edit this script first!" -ForegroundColor Red
    Write-Host "Open deploy_automation.ps1 and set:" -ForegroundColor Yellow
    Write-Host "  - GITHUB_USERNAME"
    Write-Host "  - NEO4J_AURA_URI"  
    Write-Host "  - NEO4J_AURA_PASSWORD"
    exit 1
}

Write-Host "`n✅ Configuration looks good!" -ForegroundColor Green

# STEP 1: Update Backend Environment
Write-Host "`n📦 Step 1: Updating backend configuration..." -ForegroundColor Cyan

$envContent = @"
# Production Environment Configuration
NEO4J_URI=$NEO4J_AURA_URI
NEO4J_USER=neo4j
NEO4J_PASSWORD=$NEO4J_AURA_PASSWORD
NEO4J_DATABASE=neo4j

# API Keys (optional)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Server
PORT=8000
ENVIRONMENT=production
"@

$envContent | Out-File -FilePath "backend\.env" -Encoding utf8
Write-Host "  ✅ Created backend\.env" -ForegroundColor Green

# STEP 2: Initialize Git
Write-Host "`n📦 Step 2: Initializing Git repository..." -ForegroundColor Cyan

if (Test-Path ".git") {
    Write-Host "  ⚠️ Git already initialized" -ForegroundColor Yellow
} else {
    git init
    Write-Host "  ✅ Git initialized" -ForegroundColor Green
}

# Create .gitignore
$gitignoreContent = @"
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
.venv/
*.egg-info/
.pytest_cache/

# Node
node_modules/
dist/
.vite/
*.log

# Environment
.env
.env.local
*.env

# Neo4j
neo4j_export.cypher

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
"@

$gitignoreContent | Out-File -FilePath ".gitignore" -Encoding utf8
Write-Host "  ✅ Created .gitignore" -ForegroundColor Green

# STEP 3: Commit and Push
Write-Host "`n📦 Step 3: Pushing to GitHub..." -ForegroundColor Cyan

git add .
git commit -m "Deploy: NASA Space Apps 2024 submission"
git branch -M main
git remote add origin "https://github.com/$GITHUB_USERNAME/astrobiomers.git"

Write-Host "  🔄 Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Code pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Push failed. You may need to authenticate." -ForegroundColor Red
    Write-Host "  Run: git push -u origin main" -ForegroundColor Yellow
}

# STEP 4: Next Steps
Write-Host "`n🎉 AUTOMATION COMPLETE!" -ForegroundColor Green
Write-Host "=" * 50

Write-Host "`n📋 NEXT MANUAL STEPS:" -ForegroundColor Cyan

Write-Host "`n1️⃣ Deploy Backend to Render.com:"
Write-Host "  - Go to: https://render.com/dashboard"
Write-Host "  - Click: New + → Web Service"
Write-Host "  - Connect: astrobiomers repository"
Write-Host "  - Settings:"
Write-Host "    Name: astrobiomers-backend"
Write-Host "    Root Directory: backend"
Write-Host "    Build: pip install -r requirements.txt"
Write-Host "    Start: uvicorn main:app --host 0.0.0.0 --port `$PORT"
Write-Host "  - Environment Variables:"
Write-Host "    NEO4J_URI = $NEO4J_AURA_URI"
Write-Host "    NEO4J_USER = neo4j"
Write-Host "    NEO4J_PASSWORD = $NEO4J_AURA_PASSWORD"
Write-Host "    NEO4J_DATABASE = neo4j"

Write-Host "`n2️⃣ Deploy Frontend to Vercel:"
Write-Host "  - Go to: https://vercel.com/new"
Write-Host "  - Import: astrobiomers repository"
Write-Host "  - Settings:"
Write-Host "    Framework: Vite"
Write-Host "    Root Directory: frontend/new frontend"
Write-Host "    Build: npm run build"
Write-Host "    Output: dist"
Write-Host "  - Environment Variable:"
Write-Host "    VITE_API_URL = (your Render backend URL)"

Write-Host "`n3️⃣ Update Frontend API URL:"
Write-Host "  - After Render deploys, get your backend URL"
Write-Host "  - Add to Vercel environment: VITE_API_URL"
Write-Host "  - Redeploy frontend"

Write-Host "`n🔗 Your GitHub Repository:"
Write-Host "  https://github.com/$GITHUB_USERNAME/astrobiomers"

Write-Host "`n✨ You're almost there! Follow the manual steps above." -ForegroundColor Green
