# Full Stack Launcher for Astrobiomers
# Starts backend (FastAPI) and frontend (Vite) in separate windows
# Then provides browser URL for testing

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

Write-Host "`n=== Astrobiomers Full Stack Launcher ===" -ForegroundColor Cyan
Write-Host "Starting backend and frontend servers...`n" -ForegroundColor Cyan

# 1. Start Backend (FastAPI + Neo4j)
Write-Host "[1/2] Launching backend API server..." -ForegroundColor Yellow
$backendCmd = "cd '$root'; .\.venv\Scripts\Activate.ps1; python -c `"import uvicorn,sys; sys.path.append('backend'); import main; uvicorn.run(main.app, host='0.0.0.0', port=8000)`""
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Write-Host "    Backend starting at http://localhost:8000" -ForegroundColor Green
Start-Sleep -Seconds 3

# 2. Start Frontend (Vite dev server)
Write-Host "[2/2] Launching frontend dev server..." -ForegroundColor Yellow
$frontendPath = Join-Path $root "frontend\new frontend"
if (Test-Path $frontendPath) {
    $frontendCmd = "cd '$frontendPath'; npm run dev"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd
    Write-Host "    Frontend starting (typically http://localhost:5173)" -ForegroundColor Green
} else {
    Write-Host "    WARNING: Frontend path not found at $frontendPath" -ForegroundColor Red
}

Start-Sleep -Seconds 4

# 3. Test backend health
Write-Host "`nVerifying backend health..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 5
    Write-Host "✓ Backend API is running" -ForegroundColor Green
    $health | ConvertTo-Json -Depth 2
} catch {
    Write-Host "✗ Backend not responding yet (may still be starting)" -ForegroundColor Yellow
    Write-Host "  Error: $_" -ForegroundColor DarkGray
}

# 4. Check Neo4j connection
Write-Host "`nChecking Neo4j connection..." -ForegroundColor Cyan
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:8000/api/graph-stats" -TimeoutSec 5
    Write-Host "✓ Neo4j connected - $($stats.papers) papers, $($stats.nodes) nodes, $($stats.relationships) relationships" -ForegroundColor Green
} catch {
    Write-Host "✗ Neo4j stats unavailable (backend may still be initializing)" -ForegroundColor Yellow
}

# 5. Instructions
Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Wait 5-10 seconds for both servers to fully start" -ForegroundColor White
Write-Host "2. Open your browser to: http://localhost:5173" -ForegroundColor Green
Write-Host "3. Navigate to the Knowledge Graph page to see live data" -ForegroundColor White
Write-Host "4. Backend API docs available at: http://localhost:8000/docs" -ForegroundColor White
Write-Host "`nTo stop servers: Close the PowerShell windows or press Ctrl+C in each`n" -ForegroundColor DarkGray
