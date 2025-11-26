# CityVetCare Status Check
# This script checks if the application is running

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CityVetCare Status Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Backend
Write-Host "Checking Backend Server..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8000/routes/incidents.php" -UseBasicParsing -TimeoutSec 3
    Write-Host "  ✓ Backend API: " -NoNewline -ForegroundColor Green
    Write-Host "RUNNING" -ForegroundColor Green
    Write-Host "    URL: http://localhost:8000" -ForegroundColor Gray
    Write-Host "    Status: $($backendResponse.StatusCode)" -ForegroundColor Gray
    
    $data = ($backendResponse.Content | ConvertFrom-Json)
    Write-Host "    Records: $($data.total)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ Backend API: " -NoNewline -ForegroundColor Red
    Write-Host "NOT RUNNING" -ForegroundColor Red
    Write-Host "    Run START_APP.bat to start" -ForegroundColor Yellow
}

Write-Host ""

# Check Frontend
Write-Host "Checking Frontend Server..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 3
    Write-Host "  ✓ Frontend: " -NoNewline -ForegroundColor Green
    Write-Host "RUNNING" -ForegroundColor Green
    Write-Host "    URL: http://localhost:5173" -ForegroundColor Gray
    Write-Host "    Status: $($frontendResponse.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ Frontend: " -NoNewline -ForegroundColor Red
    Write-Host "NOT RUNNING" -ForegroundColor Red
    Write-Host "    Run START_APP.bat to start" -ForegroundColor Yellow
}

Write-Host ""

# Check processes
Write-Host "Checking Running Processes..." -ForegroundColor Yellow
$phpProcesses = Get-Process | Where-Object {$_.ProcessName -like "*php*" -and $_.Id -ne $PID}
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -like "*node*"}

if ($phpProcesses) {
    Write-Host "  ✓ PHP Processes: $($phpProcesses.Count)" -ForegroundColor Green
} else {
    Write-Host "  ✗ PHP Processes: None" -ForegroundColor Red
}

if ($nodeProcesses) {
    Write-Host "  ✓ Node Processes: $($nodeProcesses.Count)" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node Processes: None" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
