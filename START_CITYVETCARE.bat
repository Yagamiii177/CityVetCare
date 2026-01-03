@echo off
echo ========================================
echo  CityVetCare - Complete System Startup
echo ========================================
echo.

echo [1/4] Starting Node.js Backend Server...
echo.
start "CityVetCare Backend" cmd /k "cd /d %~dp0Backend-Node && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/4] Starting Frontend Web Application...
echo.
start "CityVetCare Web" cmd /k "cd /d %~dp0Frontend\web && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/4] Starting Mobile Application (Expo)...
echo.
start "CityVetCare Mobile" cmd /k "cd /d %~dp0Frontend\mobile && npm start"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo  System Started Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:3000
echo Frontend Web: http://localhost:5173
echo Mobile App: Expo DevTools will open automatically
echo.
echo Press any key to open web browser...
pause >nul

start http://localhost:5173

echo.
echo ========================================
echo  All Services Running:
echo ========================================
echo  - Backend: Terminal 1 (Port 3000)
echo  - Web:     Terminal 2 (Port 5173)
echo  - Mobile:  Terminal 3 (Expo)
echo.
echo  Do not close the terminal windows.
echo ========================================
echo.
pause
