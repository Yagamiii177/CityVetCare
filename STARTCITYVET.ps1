# =========================================
# CityVetCare System Startup Script (PowerShell)
# =========================================
# This script starts all CityVetCare components:
# - Backend API Server (Node.js)
# - Web Application (React/Vite)
# - Mobile Application (React Native/Expo)
# =========================================

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  CITYVETCARE SYSTEM STARTUP" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[INFO] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "[INFO] npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm is not installed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# =========================================
# 1. START BACKEND SERVER
# =========================================
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "[1/3] Starting Backend API Server..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location Backend-Node

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "[INFO] Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install backend dependencies!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Start backend in new window
Write-Host "[INFO] Launching backend server on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node server.js" -WindowStyle Normal
Start-Sleep -Seconds 3

Set-Location ..

# =========================================
# 2. START WEB APPLICATION
# =========================================
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "[2/3] Starting Web Application..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location Frontend\web

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "[INFO] Installing web dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install web dependencies!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Start web in new window
Write-Host "[INFO] Launching web application on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3

Set-Location ..\..

# =========================================
# 3. START MOBILE APPLICATION (OPTIONAL)
# =========================================
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "[3/3] Starting Mobile Application..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location Frontend\mobile

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "[INFO] Installing mobile dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARNING] Failed to install mobile dependencies!" -ForegroundColor Yellow
        Write-Host "[INFO] Mobile app can be started manually later" -ForegroundColor Yellow
        Set-Location ..\..
        goto finish
    }
}

# Start mobile in new window
Write-Host "[INFO] Launching mobile application (Expo)..." -ForegroundColor Green
Write-Host "[INFO] Scan QR code with Expo Go app on your phone" -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

Set-Location ..\..

# =========================================
# STARTUP COMPLETE
# =========================================
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  CITYVETCARE SYSTEM STARTED!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "[BACKEND]  http://localhost:3000" -ForegroundColor Cyan
Write-Host "[WEB]      http://localhost:5173" -ForegroundColor Cyan
Write-Host "[MOBILE]   Check the Expo window for QR code" -ForegroundColor Cyan
Write-Host ""
Write-Host "[INFO] All services are running in separate windows" -ForegroundColor Yellow
Write-Host "[INFO] Close those windows to stop the services" -ForegroundColor Yellow
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Start-Sleep -Seconds 3

# Open web browser to the web application
Write-Host "[INFO] Opening web browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Press any key to exit this window (services will keep running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
