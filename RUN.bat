@echo off
:MENU
cls
echo ========================================
echo    CityVetCare Server Management
echo ========================================
echo.
echo 1. Start Servers
echo 2. Stop Servers
echo 3. Restart Servers
echo 4. Exit
echo.
echo ========================================
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto START
if "%choice%"=="2" goto STOP
if "%choice%"=="3" goto RESTART
if "%choice%"=="4" goto EXIT
echo Invalid choice. Please try again.
timeout /t 2 /nobreak > nul
goto MENU

:START
cls
echo ========================================
echo    Starting CityVetCare System
echo ========================================
echo.
echo Starting Backend, Frontend (Web), and Mobile servers...
echo.

cd /d "%~dp0"

echo Starting Backend Server on port 3000...
start "CityVetCare Backend" cmd /k "cd /d %~dp0Backend-Node && npm start"

timeout /t 2 /nobreak > nul

echo Starting Frontend (Web) Development Server on port 5173...
start "CityVetCare Web" cmd /k "cd /d %~dp0Frontend\web && npm run dev"

timeout /t 2 /nobreak > nul

echo Starting Frontend (Mobile) Server...
start "CityVetCare Mobile" cmd /k "cd /d %~dp0Frontend\mobile && npm start"

echo.
echo ========================================
echo ✓ Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Web:      http://localhost:5173
echo Mobile:   Expo DevTools (check mobile window)
echo.
echo Servers are running in separate windows.
echo.
pause
goto MENU

:STOP
cls
echo ========================================
echo    Stopping CityVetCare System
echo ========================================
echo.
echo Stopping all servers...
echo.

REM Method 1: Kill by port
echo Checking port 3000 (Backend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo   Killing process %%a on port 3000...
    taskkill /F /PID %%a 2>nul
)

echo Checking port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo   Killing process %%a on port 5173...
    taskkill /F /PID %%a 2>nul
)

REM Method 2: Kill all node processes (more aggressive)
echo.
echo Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
if errorlevel 1 (
    echo   No Node.js processes found
) else (
    echo   ✓ Node.js processes terminated
)

REM Method 3: Kill by window title
taskkill /FI "WINDOWTITLE eq CityVetCare Backend*" /F 2>nul
taskkill /FI "WINDOWTITLE eq CityVetCare Web*" /F 2>nul
taskkill /FI "WINDOWTITLE eq CityVetCare Mobile*" /F 2>nul

echo.
echo ========================================
echo ✓ All Servers Stopped!
echo ========================================
echo.
pause
goto MENU

:RESTART
cls
echo ========================================
echo    Restarting CityVetCare System
echo ========================================
echo.
echo Stopping servers...

REM Kill all node processes
taskkill /F /IM node.exe 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
taskkill /FI "WINDOWTITLE eq CityVetCare Backend*" /F 2>nul
taskkill /FI "WINDOWTITLE eq CityVetCare Web*" /F 2>nul
taskkill /FI "WINDOWTITLE eq CityVetCare Mobile*" /F 2>nul

echo ✓ Servers stopped
echo.
echo Waiting 3 seconds...
timeout /t 3 /nobreak > nul
echo.
echo Starting servers...

cd /d "%~dp0"
start "CityVetCare Backend" cmd /k "cd /d %~dp0Backend-Node && npm start"
timeout /t 2 /nobreak > nul
start "CityVetCare Web" cmd /k "cd /d %~dp0Frontend\web && npm run dev"
timeout /t 2 /nobreak > nul
start "CityVetCare Mobile" cmd /k "cd /d %~dp0Frontend\mobile && npm start"

echo.
echo ========================================
echo ✓ Servers Restarted!
echo ========================================
echo.
pause
goto MENU

:EXIT
cls
echo.
echo Exiting CityVetCare Server Management...
echo.
timeout /t 1 /nobreak > nul
exit
