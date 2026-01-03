@echo off
chcp 65001 >nul
title CityVetCare System Launcher
color 0B

:: ========================================================================
::                         CityVetCare System Launcher
::                    Naga City Anti-Rabies Management System
:: ========================================================================

cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                   CityVetCare System Launcher                    ║
echo ║                                                                  ║
echo ║           Naga City Anti-Rabies Management System                ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo.

:MENU
cls
echo ════════════════════════════════════════════════════════════════════
echo                      SELECT OPTION TO START:
echo ════════════════════════════════════════════════════════════════════
echo.
echo   [1] 🌐 Start Web Application (Dashboard)
echo   [2] 📱 Start Mobile Application (Expo)
echo   [3] 🚀 Start BOTH Web ^& Mobile
echo   [4] 🔧 Install/Update Dependencies (All)
echo   [5] ℹ️  System Information
echo   [6] ❌ Exit
echo.
echo ════════════════════════════════════════════════════════════════════
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto START_WEB
if "%choice%"=="2" goto START_MOBILE
if "%choice%"=="3" goto START_BOTH
if "%choice%"=="4" goto INSTALL_DEPS
if "%choice%"=="5" goto SYSTEM_INFO
if "%choice%"=="6" goto END

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto MENU

:: ========================================================================
::                           START WEB APPLICATION
:: ========================================================================
:START_WEB
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo                    Starting Web Application...
echo ════════════════════════════════════════════════════════════════════
echo.
echo [Step 1/3] Starting Backend API Server...
start "CityVetCare - Backend API" /MIN cmd /c "cd /d %~dp0Backend-Node && npm run dev"
echo    ✓ Backend starting on port 3000...
timeout /t 5 >nul

echo [Step 2/3] Starting Frontend Web Dashboard...
start "CityVetCare - Web Dashboard" /MIN cmd /c "cd /d %~dp0Frontend\web && npm run dev"
echo    ✓ Web dashboard starting on port 5173...
timeout /t 8 >nul

echo [Step 3/3] Opening browser...
start http://localhost:5173
timeout /t 2 >nul

echo.
echo ════════════════════════════════════════════════════════════════════
echo                   Web Application Started Successfully!
echo ════════════════════════════════════════════════════════════════════
echo.
echo   🌐 Backend API:        http://localhost:3000
echo   🖥️  Web Dashboard:      http://localhost:5173
echo.
echo   ℹ️  Servers are running in background (minimized windows)
echo   ℹ️  To stop: Close the minimized terminal windows
echo   ℹ️  To view logs: Click on minimized windows in taskbar
echo.
echo   Press any key to return to menu...
pause >nul
goto MENU

:: ========================================================================
::                          START MOBILE APPLICATION
:: ========================================================================
:START_MOBILE
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo                   Starting Mobile Application...
echo ════════════════════════════════════════════════════════════════════
echo.
echo [Step 1/3] Starting Backend API Server...
start "CityVetCare - Backend API" /MIN cmd /c "cd /d %~dp0Backend-Node && npm run dev"
echo    ✓ Backend starting on port 3000...
timeout /t 5 >nul

echo [Step 2/3] Starting Mobile App with Expo...
echo    ℹ️  Expo window will open - DO NOT CLOSE IT!
timeout /t 2 >nul
start "CityVetCare - Mobile App - QR CODE HERE" cmd /c "cd /d %~dp0Frontend\mobile && npx expo start"

echo.
echo ════════════════════════════════════════════════════════════════════
echo                   Mobile Application Started!
echo ════════════════════════════════════════════════════════════════════
echo.
echo   🌐 Backend API:        http://localhost:3000 (minimized)
echo   📱 Expo Dev Server:    See the Expo terminal for QR code
echo.
echo   📖 Quick Instructions:
echo   1. Install "Expo Go" app on your phone
echo   2. Scan the QR code in the Expo terminal window
echo   3. Or press 'a' for Android / 'i' for iOS emulator
echo.
echo   ⚠️  IMPORTANT: Keep the Expo window open to use the app!
echo.
echo   Press any key to return to menu...
pause >nul
goto MENU

:: ========================================================================
::                           START BOTH APPLICATIONS
:: ========================================================================
:START_BOTH
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo                Starting Complete System (Web + Mobile)...
echo ════════════════════════════════════════════════════════════════════
echo.
echo [Step 1/4] Starting Backend API Server...
start "CityVetCare - Backend API" /MIN cmd /c "cd /d %~dp0Backend-Node && npm run dev"
echo    ✓ Backend starting on port 3000...
timeout /t 5 >nul

echo [Step 2/4] Starting Frontend Web Dashboard...
start "CityVetCare - Web Dashboard" /MIN cmd /c "cd /d %~dp0Frontend\web && npm run dev"
echo    ✓ Web dashboard starting on port 5173...
timeout /t 8 >nul

echo [Step 3/4] Starting Mobile App with Expo...
echo    ℹ️  Expo window will open - Keep it open for QR code!
timeout /t 2 >nul
start "CityVetCare - Mobile App - QR CODE" cmd /c "cd /d %~dp0Frontend\mobile && npx expo start"
timeout /t 3 >nul

echo [Step 4/4] Opening browser...
start http://localhost:5173
timeout /t 2 >nul

echo.
echo ════════════════════════════════════════════════════════════════════
echo                    Complete System Started Successfully!
echo ════════════════════════════════════════════════════════════════════
echo.
echo   🌐 Backend API:        http://localhost:3000 (minimized)
echo   🖥️  Web Dashboard:      http://localhost:5173 (browser opened)
echo   📱 Mobile App:         Scan QR code in Expo window
echo.
echo   ℹ️  Backend and Web run in background (minimized)
echo   ℹ️  Expo window shows QR code - keep it open!
echo   ℹ️  To stop: Close all terminal windows from taskbar
echo.
echo   Press any key to return to menu...
pause >nul
goto MENU

:: ========================================================================
::                        INSTALL/UPDATE DEPENDENCIES
:: ========================================================================
:INSTALL_DEPS
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo                  Installing/Updating Dependencies...
echo ════════════════════════════════════════════════════════════════════
echo.

echo [1/3] Installing Backend Dependencies...
cd /d %~dp0Backend-Node
call npm install
if errorlevel 1 (
    echo ❌ Backend dependency installation failed!
    pause
    goto MENU
)
echo ✅ Backend dependencies installed successfully!
echo.

echo [2/3] Installing Web Frontend Dependencies...
cd /d %~dp0Frontend\web
call npm install
if errorlevel 1 (
    echo ❌ Web frontend dependency installation failed!
    pause
    goto MENU
)
echo ✅ Web frontend dependencies installed successfully!
echo.

echo [3/3] Installing Mobile App Dependencies...
cd /d %~dp0Frontend\mobile
call npm install
if errorlevel 1 (
    echo ❌ Mobile app dependency installation failed!
    pause
    goto MENU
)
echo ✅ Mobile app dependencies installed successfully!
echo.

echo.
echo ════════════════════════════════════════════════════════════════════
echo               All Dependencies Installed Successfully!
echo ════════════════════════════════════════════════════════════════════
echo.
pause
goto MENU

:: ========================================================================
::                           SYSTEM INFORMATION
:: ========================================================================
:SYSTEM_INFO
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo                        System Information
echo ════════════════════════════════════════════════════════════════════
echo.
echo   Project:        CityVetCare - Anti-Rabies Management System
echo   Location:       Naga City, Philippines
echo.
echo   Components:
echo   ├── Backend API:       Node.js + Express (Port 3000)
echo   ├── Web Dashboard:     React + Vite (Port 5173)
echo   └── Mobile App:        React Native + Expo
echo.
echo   Database:          MySQL
echo   Authentication:    JWT Tokens
echo.
echo ════════════════════════════════════════════════════════════════════
echo                          Access URLs
echo ════════════════════════════════════════════════════════════════════
echo.
echo   Backend API:       http://localhost:3000
echo   API Health Check:  http://localhost:3000/api/health
echo   Web Dashboard:     http://localhost:5173
echo.
echo ════════════════════════════════════════════════════════════════════
echo                      Default Login Credentials
echo ════════════════════════════════════════════════════════════════════
echo.
echo   Admin Account:
echo   Username: admin
echo   Password: admin123
echo.
echo   Veterinarian Account:
echo   Username: vet
echo   Password: vet123
echo.
echo   ⚠️  Change default passwords in production!
echo.
echo ════════════════════════════════════════════════════════════════════
echo                        Troubleshooting
echo ════════════════════════════════════════════════════════════════════
echo.
echo   Problem: Port already in use
echo   Solution: Close other applications using ports 3000 or 5173
echo.
echo   Problem: Dependencies not found
echo   Solution: Run option [4] to install dependencies
echo.
echo   Problem: Database connection failed
echo   Solution: Ensure MySQL is running and configured
echo.
echo   Problem: Mobile app won't connect
echo   Solution: Check Frontend\mobile\config\api-config.js
echo            - Android Emulator: Use 10.0.2.2:3000
echo            - iOS Simulator: Use localhost:3000
echo            - Physical Device: Use your computer's IP
echo.
echo ════════════════════════════════════════════════════════════════════
echo.
pause
goto MENU

:: ========================================================================
::                              EXIT
:: ========================================================================
:END
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo                        Exiting System Launcher
echo ════════════════════════════════════════════════════════════════════
echo.
echo   Thank you for using CityVetCare!
echo.
echo   📧 For support or issues, contact your system administrator.
echo.
timeout /t 2 >nul
exit
