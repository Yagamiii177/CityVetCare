@echo off
color 0A
echo.
echo ========================================
echo   CityVetCare - Quick Start System
echo ========================================
echo.
echo [INFO] Starting all services...
echo.

REM Kill any existing Node processes
echo [1/5] Stopping existing servers...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start Backend
echo [2/5] Starting Backend Server...
cd /d "%~dp0Backend-Node"
start "CityVetCare Backend" cmd /k "node server.js"
timeout /t 5 /nobreak >nul

REM Test Backend
echo [3/5] Testing Backend Connection...
curl -s http://localhost:3000/api/incidents/status-counts >nul 2>&1
if %errorlevel% equ 0 (
    echo       SUCCESS - Backend is running!
) else (
    echo       WARNING - Backend may still be starting...
)

REM Start Frontend
echo [4/5] Starting Frontend...
cd /d "%~dp0Frontend\web"
start "CityVetCare Frontend" cmd /k "npm run dev"

echo [5/5] Waiting for services to initialize...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   CITYVETCARE SYSTEM STARTED!
echo ========================================
echo.
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:5173
echo.
echo   Press any key to open in browser...
echo ========================================
pause >nul

start http://localhost:5173

echo.
echo System is running! Close this window anytime.
pause
