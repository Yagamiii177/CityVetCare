@echo off
cls
echo ========================================
echo   CityVetCare Application Starter
echo ========================================
echo.

REM Check if PHP is available
where php >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PHP is not installed or not in PATH!
    echo Please install PHP and add it to your system PATH.
    pause
    exit /b 1
)

REM Check if Node/npm is available
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js/npm is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Checking PHP...
php --version | findstr "PHP"
echo.

echo [2/4] Checking Node.js...
node --version
echo.

echo [3/4] Starting Backend PHP Server...
start "CityVetCare Backend" powershell -NoExit -Command "cd 'C:\Users\libre\OneDrive\Desktop\CityVetCare\Backend'; Write-Host '================================' -ForegroundColor Green; Write-Host ' Backend Server Starting...' -ForegroundColor Green; Write-Host '================================' -ForegroundColor Green; Write-Host ''; Write-Host 'Server: http://localhost:8000' -ForegroundColor Cyan; Write-Host 'Router: router.php' -ForegroundColor Gray; Write-Host ''; php -S localhost:8000 router.php"

echo Waiting 3 seconds for backend...
timeout /t 3 /nobreak > nul

echo [4/4] Starting Frontend Vite Server...
start "CityVetCare Frontend" powershell -NoExit -Command "cd 'C:\Users\libre\OneDrive\Desktop\CityVetCare\Frontend\web'; Write-Host '================================' -ForegroundColor Cyan; Write-Host ' Frontend Server Starting...' -ForegroundColor Cyan; Write-Host '================================' -ForegroundColor Cyan; Write-Host ''; Write-Host 'Server: http://localhost:5173' -ForegroundColor Green; Write-Host ''; npm run dev"

echo.
echo Waiting 8 seconds for frontend to compile...
timeout /t 8 /nobreak > nul

echo.
echo [5/5] Opening browser...
start http://localhost:5173

echo.
echo ========================================
echo   APPLICATION STARTED SUCCESSFULLY!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo.
echo ========================================
echo   IMPORTANT NOTES:
echo ========================================
echo.
echo * DO NOT CLOSE the two PowerShell windows
echo * Backend window shows PHP server logs
echo * Frontend window shows Vite build logs
echo * To stop: Close both PowerShell windows
echo.
echo Press any key to exit this launcher...
echo (Servers will continue running)
pause > nul
