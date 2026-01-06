@echo off
REM ===================================================================
REM CityVetCare Complete System Startup Script
REM ===================================================================
REM This script starts all components of the CityVetCare system:
REM - Backend API Server (Node.js)
REM - Web Dashboard (React/Vite)
REM - Mobile App (React Native/Expo)
REM ===================================================================

color 0A
title CityVetCare System Startup

echo.
echo ====================================================================
echo               CITYVETCARE SYSTEM STARTUP
echo ====================================================================
echo.
echo Starting all system components...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/5] Checking system requirements...
echo   [OK] Node.js found: 
node --version
echo.

REM Navigate to project root
cd /d "%~dp0"

REM Kill any existing processes on required ports
echo [2/5] Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)
echo   [OK] Ports cleared (3000, 5173, 8081)
echo.

REM Start Backend Server
echo [3/5] Starting Backend API Server...
cd Backend-Node
start "CityVetCare Backend" cmd /k "color 0B && title CityVetCare Backend && echo ============================================ && echo    CITYVETCARE BACKEND SERVER && echo ============================================ && echo. && echo Starting backend server... && echo. && node server.js"
cd ..
timeout /t 4 /nobreak >nul
echo   [OK] Backend server starting on http://localhost:3000
echo.

REM Start Web Dashboard
echo [4/5] Starting Web Dashboard...
cd Frontend\web
start "CityVetCare Web" cmd /k "color 0E && title CityVetCare Web Dashboard && echo ============================================ && echo    CITYVETCARE WEB DASHBOARD && echo ============================================ && echo. && echo Starting web dashboard... && echo. && npm run dev"
cd ..\..
timeout /t 4 /nobreak >nul
echo   [OK] Web dashboard starting on http://localhost:5173
echo.

REM Start Mobile App
echo [5/5] Starting Mobile App (Expo)...
cd Frontend\mobile
start "CityVetCare Mobile" cmd /k "color 0D && title CityVetCare Mobile App && echo ============================================ && echo    CITYVETCARE MOBILE APP && echo ============================================ && echo. && echo Starting mobile app... && echo. && npm start"
cd ..\..
echo   [OK] Mobile app starting on http://localhost:8081
echo.

REM Wait for services to initialize
echo.
echo [WAIT] Initializing services...
timeout /t 10 /nobreak >nul

color 0A
echo.
echo ====================================================================
echo              ALL SYSTEMS STARTED SUCCESSFULLY!
echo ====================================================================
echo.
echo   System Components:
echo   ------------------------------------------------------------------
echo   [1] Backend API       : http://localhost:3000
echo   [2] Web Dashboard     : http://localhost:5173
echo   [3] Mobile App (Expo) : http://localhost:8081
echo   ------------------------------------------------------------------
echo.
echo   Opening Web Dashboard in browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173
echo.
echo ====================================================================
echo                        SYSTEM READY
echo ====================================================================
echo.
echo   Quick Access:
echo     - Web Login: admin / admin123
echo     - Mobile: Scan QR code with Expo Go app
echo     - API Health: http://localhost:3000/api/health
echo.
echo   To stop services:
echo     - Close the individual service windows (Backend/Web/Mobile)
echo     - Or press Ctrl+C in each window
echo.
echo ====================================================================
echo.
echo Press any key to exit this launcher (services will keep running)...
pause >nul
