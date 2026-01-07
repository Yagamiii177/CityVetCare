@echo off
echo ========================================
echo CityVetCare Backend - Complete Restart
echo ========================================
echo.

echo [1/4] Stopping all Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/4] Waiting for ports to free...
timeout /t 3 /nobreak >nul

echo [3/4] Starting backend server...
cd /d "%~dp0Backend-Node"
start "CityVetCare Backend" cmd /k "node server.js"

echo [4/4] Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo ✅ Backend server restarted successfully
echo Server should be running on http://localhost:3000
echo ========================================
echo.
pause
