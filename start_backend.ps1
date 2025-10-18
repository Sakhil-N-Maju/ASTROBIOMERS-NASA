<#
    start_backend.ps1
    ---------------------------------
    Launches the FastAPI backend (uvicorn) in a dedicated PowerShell window so it stays running.
    Usage:
        ./start_backend.ps1              # normal start
        ./start_backend.ps1 -Reload      # start with --reload (auto-reload on code changes)

    Requirements:
      - backend/.venv must exist and contain uvicorn & fastapi
      - backend/main.py defines `app`
      - .env at project root contains Neo4j credentials (already added)

    This avoids the issue where starting via transient task closes the server after a short period.
#>
param(
    [switch]$Reload
)

$ErrorActionPreference = 'Stop'

$backendPath = Join-Path $PSScriptRoot 'backend'
$venvActivate = Join-Path $backendPath '.venv/Scripts/Activate.ps1'
if (-not (Test-Path $venvActivate)) {
    Write-Error "Virtual environment not found at $venvActivate. Create it first."
    exit 1
}

$uvicornCmd = if ($Reload) { 'uvicorn main:app --reload --port 8000 --log-level info' } else { 'uvicorn main:app --port 8000 --log-level info' }

Write-Host "Starting backend with command: $uvicornCmd" -ForegroundColor Cyan

# Start a new PowerShell window that remains open
Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-ExecutionPolicy','Bypass',
    '-Command',
    "cd '$backendPath'; . '$venvActivate'; $uvicornCmd"
) | Out-Null

Write-Host "Backend launch initiated. Check the new PowerShell window for logs." -ForegroundColor Green
