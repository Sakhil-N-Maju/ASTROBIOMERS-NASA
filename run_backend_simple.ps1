# Minimal backend launcher that keeps the server alive
param()
$ErrorActionPreference = 'Stop'
$backend = Join-Path $PSScriptRoot 'backend'
$activate = Join-Path $backend '.venv/Scripts/Activate.ps1'
if(-not (Test-Path $activate)){ Write-Error 'Missing backend/.venv virtual environment.'; exit 1 }
Write-Host 'Activating virtual environment...' -ForegroundColor Cyan
. $activate
Set-Location $backend
Write-Host 'Starting uvicorn (no reload)...' -ForegroundColor Green
uvicorn main:app --host 0.0.0.0 --port 8000 --log-level info
