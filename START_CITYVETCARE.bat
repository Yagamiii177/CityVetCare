@echo off
echo ========================================
echo  CityVetCare - Complete System Startup
echo ========================================
echo.

echo [1/3] Starting Node.js Backend Server...
echo.
start "CityVetCare Backend" cmd /k "cd /d %~dp0Backend-Node && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend Web Application...
echo.
start "CityVetCare Frontend" cmd /k "cd /d %~dp0Frontend\web && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo  System Started Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:3000
echo Frontend Web: http://localhost:5173
echo.
echo Press any key to open browser...
pause >nul

start http://localhost:5173

echo.
echo System is running. Do not close the terminal windows.
echo.
pause
