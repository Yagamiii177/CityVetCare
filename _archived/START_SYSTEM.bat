@echo off
REM ===========================================
REM CityVetCare System - Complete Start Script
REM ===========================================

echo.
echo ========================================
echo   CityVetCare System Startup
echo ========================================
echo.

REM Check if MySQL is running
echo [1/4] Checking MySQL/MariaDB...
netstat -an | findstr ":3306" >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ MySQL is running on port 3306
) else (
    echo   ✗ MySQL is NOT running!
    echo   Please start XAMPP/MySQL first
    echo.
    pause
    exit /b 1
)

REM Start Backend Server
echo.
echo [2/4] Starting Backend Server...
cd Backend-Node
if exist node_modules\ (
    echo   ✓ Node modules found
) else (
    echo   Installing dependencies...
    call npm install
)

echo   Starting server on port 3000...
start "CityVetCare Backend" /min cmd /k "npm start"
timeout /t 5 /nobreak >nul
echo   ✓ Backend server started

REM Check if backend is responding
echo.
echo [3/4] Verifying backend connection...
timeout /t 2 /nobreak >nul
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ Backend API is responding
) else (
    echo   ⚠ Backend may still be starting...
)

cd ..

REM Start Web Frontend  
echo.
echo [4/4] Starting Web Frontend...
cd Frontend\web
if exist node_modules\ (
    echo   ✓ Node modules found
) else (
    echo   Installing dependencies...
    call npm install
)

echo   Starting Vite dev server...
start "CityVetCare Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo   ✓ Frontend server started

cd ..\..

echo.
echo ========================================
echo   System Started Successfully!
echo ========================================
echo.
echo   Backend API:  http://localhost:3000
echo   Web App:      http://localhost:5173
echo.
echo   Check browser windows for access
echo.
echo   Press any key to view system status...
pause >nul

REM Display system status
cls
echo.
echo ========================================
echo   CityVetCare System Status
echo ========================================
echo.
echo Backend Server:
curl -s http://localhost:3000/ 2>nul || echo   [Unable to connect]
echo.
echo.
echo ========================================
echo.
echo To stop the system:
echo   1. Close the Backend terminal window
echo   2. Close the Frontend terminal window
echo   3. Or use: taskkill /F /IM node.exe
echo.
echo ========================================
echo.
pause
