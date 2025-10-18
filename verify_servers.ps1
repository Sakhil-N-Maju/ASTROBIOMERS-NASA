# Quick health check for running servers
Start-Sleep -Seconds 8
Write-Host "`nVerifying servers..." -ForegroundColor Cyan

try {
    $health = Invoke-RestMethod 'http://localhost:8000/health' -TimeoutSec 5
    Write-Host "✓ Backend API is running" -ForegroundColor Green
    
    $stats = Invoke-RestMethod 'http://localhost:8000/api/graph-stats' -TimeoutSec 5
    Write-Host "✓ Neo4j connected: $($stats.papers) papers, $($stats.nodes) nodes, $($stats.relationships) relationships" -ForegroundColor Green
    
    Write-Host "`n✓✓ All systems operational!" -ForegroundColor Green
    Write-Host "`nOpen your browser to: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "Navigate to Knowledge Graph page to test live data.`n" -ForegroundColor White
} catch {
    Write-Host "⚠ Servers may still be starting up..." -ForegroundColor Yellow
    Write-Host "Wait another 10 seconds and try: Invoke-RestMethod http://localhost:8000/health`n" -ForegroundColor DarkGray
}
