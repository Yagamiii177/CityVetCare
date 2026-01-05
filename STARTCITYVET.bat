@echo off
:: =========================================
:: CityVetCare System Startup Script
:: =========================================
:: This script starts all CityVetCare components:
:: - Backend API Server (Node.js)
:: - Web Application (React/Vite)
:: - Mobile Application (React Native/Expo)
:: =========================================

echo.
echo =========================================
echo   CITYVETCARE SYSTEM STARTUP
echo =========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js found: 
node --version
echo.

:: Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

echo [INFO] npm found:
npm --version
echo.

:: =========================================
:: 1. START BACKEND SERVER
:: =========================================
echo =========================================
echo [1/3] Starting Backend API Server...
echo =========================================
echo.

cd Backend-Node

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing backend dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install backend dependencies!
        pause
        exit /b 1
    )
)

:: Start backend in new window
echo [INFO] Launching backend server on port 3000...
start "CityVetCare - Backend API" cmd /k "node server.js"
timeout /t 3 /nobreak >nul

cd ..

:: =========================================
:: 2. START WEB APPLICATION
:: =========================================
echo =========================================
echo [2/3] Starting Web Application...
echo =========================================
echo.

cd Frontend\web

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing web dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install web dependencies!
        pause
        exit /b 1
    )
)

:: Start web in new window
echo [INFO] Launching web application on http://localhost:5173...
start "CityVetCare - Web Application" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

cd ..\..

:: =========================================
:: 3. START MOBILE APPLICATION (OPTIONAL)
:: =========================================
echo =========================================
echo [3/3] Starting Mobile Application...
echo =========================================
echo.

cd Frontend\mobile

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing mobile dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Failed to install mobile dependencies!
        echo [INFO] Mobile app can be started manually later
        cd ..\..
        goto :finish
    )
)

:: Start mobile in new window
echo [INFO] Launching mobile application (Expo)...
echo [INFO] Scan QR code with Expo Go app on your phone
start "CityVetCare - Mobile Application" cmd /k "npm start"

cd ..\..

:finish
:: =========================================
:: STARTUP COMPLETE
:: =========================================
echo.
echo =========================================
echo   CITYVETCARE SYSTEM STARTED!
echo =========================================
echo.
echo [BACKEND]  http://localhost:3000
echo [WEB]      http://localhost:5173
echo [MOBILE]   Check the Expo window for QR code
echo.
echo [INFO] All services are running in separate windows
echo [INFO] Close those windows to stop the services
echo.
echo =========================================
timeout /t 5 /nobreak >nul

:: Open web browser to the web application
echo [INFO] Opening web browser...
start http://localhost:5173

echo.
echo Press any key to exit this window (services will keep running)...
pause >nul
