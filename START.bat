@echo off
REM CityVetCare System - Production Start Script
REM This script checks prerequisites and starts the system

echo ========================================
echo  CityVetCare - System Startup Check
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version
echo.

REM Check npm
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm is not installed or not in PATH
    pause
    exit /b 1
)

echo [OK] npm found:
npm --version
echo.

REM Check Backend dependencies
if not exist "%~dp0Backend-Node\node_modules\" (
    echo [WARNING] Backend dependencies not installed
    echo Installing backend dependencies...
    cd /d "%~dp0Backend-Node"
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo.
)

REM Check Frontend Web dependencies
if not exist "%~dp0Frontend\web\node_modules\" (
    echo [WARNING] Frontend Web dependencies not installed
    echo Installing frontend web dependencies...
    cd /d "%~dp0Frontend\web"
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo.
)

REM Check Backend .env file
if not exist "%~dp0Backend-Node\.env" (
    echo [WARNING] Backend .env file not found
    echo Please copy .env.example to .env and configure it
    echo.
    if exist "%~dp0Backend-Node\.env.example" (
        copy "%~dp0Backend-Node\.env.example" "%~dp0Backend-Node\.env"
        echo Created .env file from example. Please edit it with your settings.
        pause
    ) else (
        echo [ERROR] .env.example not found
        pause
        exit /b 1
    )
)

REM Check Frontend Web .env file
if not exist "%~dp0Frontend\web\.env" (
    echo [WARNING] Frontend Web .env file not found
    if exist "%~dp0Frontend\web\.env.example" (
        copy "%~dp0Frontend\web\.env.example" "%~dp0Frontend\web\.env"
        echo Created .env file from example.
    )
)

echo ========================================
echo  Prerequisites Check Complete
echo ========================================
echo.
echo Starting CityVetCare System...
echo.

REM Start Backend
echo [1/2] Starting Backend API Server...
start "CityVetCare Backend" cmd /k "cd /d %~dp0Backend-Node && npm start"
timeout /t 5 /nobreak >nul

REM Start Frontend Web
echo [2/2] Starting Frontend Web Application...
start "CityVetCare Web" cmd /k "cd /d %~dp0Frontend\web && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo  System Started Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:3000
echo Frontend Web: http://localhost:5173
echo API Documentation: http://localhost:3000/
echo.
echo Press any key to open the web application...
pause >nul
start http://localhost:5173
