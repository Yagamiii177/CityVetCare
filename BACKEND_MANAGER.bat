@echo off
:MENU
cls
echo ========================================
echo    CityVetCare Backend Manager
echo ========================================
echo.

cd /d "%~dp0Backend-Node"
node show-database-info.js

echo.
echo ========================================
echo.
echo 1. Retrieve Database Schema
echo 2. Exit
echo.
echo ========================================
set /p choice="Enter your choice (1-2): "

if "%choice%"=="1" goto RETRIEVE_DB
if "%choice%"=="2" goto EXIT
echo Invalid choice. Please try again.
timeout /t 2 /nobreak > nul
goto MENU

:RETRIEVE_DB
cls
echo ========================================
echo    Retrieving Database Schema
echo ========================================
echo.
echo This will:
echo   - Scan all tables in the database
echo   - Generate model files automatically
echo   - Create CRUD methods for each table
echo.
pause
echo.

cd /d "%~dp0Backend-Node"
node retrieve-database.js

echo.
pause
goto MENU

:EXIT
exit
