@echo off
REM ============================================
REM CityVetCare - Complete Application Launcher
REM Starts both Web and Mobile frontends + Backend
REM ============================================

echo.
echo ========================================
echo   CityVetCare Complete App Launcher
echo ========================================
echo.
echo This will start:
echo   1. Backend Server (PHP on port 8000)
echo   2. Web Frontend (Vite on port 5173)
echo   3. Mobile Frontend (Expo)
echo.
echo Press any key to continue...
pause >nul

REM Get the root directory
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo.
echo ========================================
echo   Starting Backend Server
echo ========================================
echo.
start "CityVetCare - Backend" /min cmd /c "cd /d "%ROOT_DIR%Backend" && php -S localhost:8000 && pause"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   Starting Web Frontend
echo ========================================
echo.
start "CityVetCare - Web" /min cmd /c "cd /d "%ROOT_DIR%Frontend\web" && npm run dev && pause"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   Starting Mobile Frontend
echo ========================================
echo.
start "CityVetCare - Mobile" cmd /c "cd /d "%ROOT_DIR%Frontend\mobile" && npm start"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Web:      http://localhost:5173
echo Mobile:   Scan QR code in Expo terminal
echo.
echo IMPORTANT for Mobile:
echo 1. Install Expo Go on your phone
echo 2. Update Frontend/mobile/config/api.js with your IP
echo 3. Scan the QR code in the Expo terminal
echo 4. Make sure phone and computer are on same Wi-Fi
echo.
echo Opening web browser...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo Press any key to exit (this will NOT stop the servers)
pause >nul
