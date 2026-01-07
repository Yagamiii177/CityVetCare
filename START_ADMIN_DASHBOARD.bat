@echo off
echo ========================================
echo  Admin Dashboard - Quick Start Guide
echo ========================================
echo.

echo This will help you start the Admin Dashboard system.
echo.
echo Prerequisites:
echo  - MySQL database running
echo  - Node.js installed
echo  - Dependencies installed (npm install)
echo.

echo Step 1: Testing Backend Endpoints
echo ----------------------------------
echo Press any key to test backend connection...
pause > nul

cd Backend-Node
echo.
echo Testing admin dashboard endpoints...
node ../test-admin-dashboard.js

echo.
echo ========================================
echo Step 2: Starting Backend Server
echo ========================================
echo.
echo The backend will start on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
echo Starting backend...
start "CityVetCare Backend" cmd /k "npm start"

timeout /t 5 > nul

echo.
echo ========================================
echo Step 3: Starting Frontend
echo ========================================
echo.
echo The frontend will start on http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

cd ..\Frontend\web
echo Starting frontend...
start "CityVetCare Frontend" cmd /k "npm run dev"

timeout /t 3 > nul

echo.
echo ========================================
echo  ✅ Admin Dashboard is Starting!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo Dashboard: http://localhost:5173/admin-dashboard
echo.
echo Two terminal windows have opened:
echo  1. Backend Server (Node.js)
echo  2. Frontend Server (Vite)
echo.
echo Next: Open your browser and navigate to:
echo http://localhost:5173/admin-dashboard
echo.
echo Press any key to open the dashboard in your browser...
pause > nul

start http://localhost:5173/admin-dashboard

echo.
echo ========================================
echo  🎉 Admin Dashboard Launched!
echo ========================================
echo.
echo To stop the servers:
echo  - Press Ctrl+C in each terminal window
echo.
pause
