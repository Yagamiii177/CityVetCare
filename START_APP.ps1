# CityVetCare Application Starter (PowerShell)
# This script starts both backend and frontend servers

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  CityVetCare Application Starter" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if PHP is available
Write-Host "[1/5] Checking PHP..." -ForegroundColor Yellow
if (Get-Command php -ErrorAction SilentlyContinue) {
    $phpVersion = php --version | Select-Object -First 1
    Write-Host "  ✓ $phpVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ PHP is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "  Please install PHP and add it to your system PATH." -ForegroundColor Yellow
    pause
    exit 1
}

# Check if Node/npm is available
Write-Host "`n[2/5] Checking Node.js..." -ForegroundColor Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js/npm is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "  Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    pause
    exit 1
}

# Start Backend Server
Write-Host "`n[3/5] Starting Backend PHP Server..." -ForegroundColor Yellow
$backendPath = "C:\Users\libre\OneDrive\Desktop\CityVetCare\Backend"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$backendPath'; Write-Host '================================' -ForegroundColor Green; Write-Host ' Backend Server' -ForegroundColor Green; Write-Host '================================' -ForegroundColor Green; Write-Host ''; Write-Host 'Server: http://localhost:8000' -ForegroundColor Cyan; Write-Host 'Status: Running' -ForegroundColor Green; Write-Host ''; Write-Host 'Press Ctrl+C to stop server' -ForegroundColor Yellow; Write-Host ''; php -S localhost:8000 router.php"
) -WindowStyle Normal

Write-Host "  ✓ Backend server process started" -ForegroundColor Green
Write-Host "  Waiting 3 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "`n[4/5] Starting Frontend Vite Server..." -ForegroundColor Yellow
$frontendPath = "C:\Users\libre\OneDrive\Desktop\CityVetCare\Frontend\web"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$frontendPath'; Write-Host '================================' -ForegroundColor Cyan; Write-Host ' Frontend Server' -ForegroundColor Cyan; Write-Host '================================' -ForegroundColor Cyan; Write-Host ''; Write-Host 'Server: http://localhost:5173' -ForegroundColor Green; Write-Host 'Status: Starting...' -ForegroundColor Yellow; Write-Host ''; npm run dev"
) -WindowStyle Normal

Write-Host "  ✓ Frontend server process started" -ForegroundColor Green
Write-Host "  Waiting 8 seconds for compilation..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# Test servers
Write-Host "`n[5/5] Testing servers..." -ForegroundColor Yellow
try {
    $backendTest = Invoke-WebRequest -Uri "http://localhost:8000/routes/incidents.php" -UseBasicParsing -TimeoutSec 3
    Write-Host "  ✓ Backend API: Responding" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Backend API: Not responding (may still be starting)" -ForegroundColor Yellow
}

try {
    $frontendTest = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 3
    Write-Host "  ✓ Frontend: Responding" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Frontend: Not responding (may still be starting)" -ForegroundColor Yellow
}

# Open browser
Write-Host "`n[6/6] Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"
Write-Host "  ✓ Browser opened" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  APPLICATION STARTED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  IMPORTANT NOTES:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "✓ Two PowerShell windows were opened" -ForegroundColor White
Write-Host "✓ DO NOT CLOSE those windows" -ForegroundColor White
Write-Host "✓ Backend window shows PHP logs" -ForegroundColor White
Write-Host "✓ Frontend window shows Vite logs" -ForegroundColor White
Write-Host ""
Write-Host "To stop the servers:" -ForegroundColor Yellow
Write-Host "  • Close both PowerShell windows, OR" -ForegroundColor White
Write-Host "  • Press Ctrl+C in each window" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
Write-Host "(Servers will continue running)" -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
