<#!
.SYNOPSIS
  Launches Neo4j (Docker), Backend (FastAPI), Adapter (FastAPI), and Frontend (Vite) for local dev.
  Creates Python venv & installs simplified deps if missing.
!>
param(
  [switch]$FullDeps
)

Write-Host "`n🌌 ASTROBIOMERS FULL STACK LAUNCHER" -ForegroundColor Cyan
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RepoRoot

# 1. Python environment
if (-not (Test-Path ".venv")) {
  Write-Host "📦 Creating virtual environment" -ForegroundColor Yellow
  python -m venv .venv
}
Write-Host "🔁 Activating venv" -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

# 2. Install dependencies
$reqFile = if ($FullDeps) { 'backend\requirements.txt' } else { 'backend\requirements_simplified.txt' }
Write-Host "📥 Installing Python deps from $reqFile" -ForegroundColor Yellow
pip install --disable-pip-version-check -q -r $reqFile

# 3. Ensure .env present
if (-not (Test-Path '.env')) { Copy-Item .env.example .env }
if (-not (Test-Path 'backend\.env')) { Copy-Item backend\.env.example backend\.env }

# 4. Start Neo4j via docker compose (only that service)
Write-Host "🛰️  Starting Neo4j container" -ForegroundColor Yellow
docker compose up -d neo4j | Out-Null

function Wait-Port($Port, $TimeoutSec=60) {
  $sw = [Diagnostics.Stopwatch]::StartNew()
  while ($sw.Elapsed.TotalSeconds -lt $TimeoutSec) {
    try {
      $client = New-Object System.Net.Sockets.TcpClient('localhost', $Port)
      $client.Close(); return $true
    } catch { Start-Sleep -Milliseconds 750 }
  }
  return $false
}

if (Wait-Port -Port 7687 -TimeoutSec 90) { Write-Host "✅ Neo4j bolt ready" -ForegroundColor Green } else { Write-Host "⚠️ Neo4j not responding on 7687" -ForegroundColor Red }

# 5. Start backend (port 8000)
Write-Host "🚀 Starting Backend :8000" -ForegroundColor Yellow
Start-Job -Name Backend -ScriptBlock {
  Set-Location $using:RepoRoot/backend
  & $using:RepoRoot/.venv/Scripts/python.exe main.py
} | Out-Null

# 6. Start adapter (port 5000)
Write-Host "🚀 Starting Adapter :5000" -ForegroundColor Yellow
Start-Job -Name Adapter -ScriptBlock {
  Set-Location $using:RepoRoot/frontend
  & $using:RepoRoot/.venv/Scripts/python.exe api_adapter.py
} | Out-Null

# 7. Frontend dependencies
$frontendRoot = Join-Path $RepoRoot 'frontend/new frontend'
if (-not (Test-Path (Join-Path $frontendRoot 'node_modules'))) {
  Write-Host "📦 Installing frontend npm deps" -ForegroundColor Yellow
  pushd $frontendRoot
  npm install --no-audit --no-fund | Out-Null
  popd
}

# 8. Start frontend (port 3000)
Write-Host "🚀 Starting Frontend :3000" -ForegroundColor Yellow
Start-Job -Name Frontend -ScriptBlock {
  Set-Location $using:RepoRoot/'frontend/new frontend'
  npm run dev
} | Out-Null

Start-Sleep -Seconds 5
Write-Host "\n📊 Job Status:" -ForegroundColor Cyan
Get-Job | Format-Table Id, Name, State -AutoSize

Write-Host "\n🌐 Endpoints:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Adapter:   http://localhost:5000/api/health" -ForegroundColor White
Write-Host "  Backend:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Neo4j:     http://localhost:7474" -ForegroundColor White

Write-Host "\nℹ️  View logs with:  Receive-Job -Name Backend -Keep" -ForegroundColor DarkGray
Write-Host "    Stop all:       Get-Job | Stop-Job; Get-Job | Remove-Job" -ForegroundColor DarkGray
Write-Host "\n✨ Full stack starting up..." -ForegroundColor Green

while ($true) { Start-Sleep -Seconds 60 }
