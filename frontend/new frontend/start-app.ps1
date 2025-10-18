# Combined Startup Script - Runs both Frontend and Backend
# This opens two terminal windows: one for Vite dev server, one for Flask backend

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Bio-Star-Insight with Knowledge Graph" -ForegroundColor Cyan
Write-Host "Starting Frontend + Backend" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend in new window
Write-Host "Starting Python Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", ".\start-backend.ps1"

Start-Sleep -Seconds 2

# Start Frontend in new window  
Write-Host "Starting Vite Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "✓ Both servers are starting!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:5000" -ForegroundColor White
Write-Host "Frontend: Check the new terminal window" -ForegroundColor White
Write-Host ""
Write-Host "Close the terminal windows to stop the servers" -ForegroundColor Yellow

Read-Host "Press Enter to exit this window"
