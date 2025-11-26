@echo off
title CityVetCare Launcher
cls
echo.
echo ========================================
echo   STARTING CITYVETCARE...
echo ========================================
echo.

REM Start Backend
start /MIN powershell -NoExit -Command "$host.UI.RawUI.WindowTitle='Backend Server'; cd 'C:\Users\libre\OneDrive\Desktop\CityVetCare\Backend'; php -S localhost:8000 router.php"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start Frontend
start /MIN powershell -NoExit -Command "$host.UI.RawUI.WindowTitle='Frontend Server'; cd 'C:\Users\libre\OneDrive\Desktop\CityVetCare\Frontend\web'; npm run dev"

REM Wait 6 seconds for servers to start
timeout /t 6 /nobreak >nul

REM Open browser
start http://localhost:5173

echo.
echo ========================================
echo   READY!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo.
echo Close this window anytime.
echo (The 2 server windows will stay open)
echo.
timeout /t 3 >nul
exit
