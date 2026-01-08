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
echo 0. Reset Database (apply schema.sql)
echo 1. Retrieve Database Schema
echo 2. Populate Sample Data
echo 3. Exit
echo.
echo ========================================
set /p choice="Enter your choice (1-3): "

if "%choice%"=="0" goto RESET_DB
if "%choice%"=="1" goto RETRIEVE_DB
if "%choice%"=="2" goto POPULATE_DATA
if "%choice%"=="3" goto EXIT
:RETRIEVE_DB
:cls
:echo ========================================
:echo    Retrieving Database Schema
:echo ========================================
:echo.
:echo This will:
:echo   - Scan all tables in the database
:echo   - Generate model files automatically
:echo   - Create CRUD methods for each table
:echo.
:pause
:echo.
:
:cd /d "%~dp0Backend-Node"
:node retrieve-database.js
:
:echo.
:pause
:goto MENU

:RESET_DB
cls
echo ========================================
echo    Resetting Database (Schema Apply)
echo ========================================
echo.
echo This will:
echo   - Drop and recreate cityvetcare_db
echo   - Apply Database/schema.sql
echo.
pause
echo.

cd /d "%~dp0Backend-Node"
node reset-database.js

echo.
echo Applying database migrations...
call npm run migrate

echo.
pause
goto MENU
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

:POPULATE_DATA
cls
echo ========================================
echo    Populating Sample Data
echo ========================================
echo.
echo This will:
echo   - Insert 1-3 sample records into each table
echo   - Populate administrators, pet owners, pets, etc.
echo   - Create sample stray animal records
echo.
pause
echo.

cd /d "%~dp0Backend-Node"
node populate-sample-data.js

echo.
pause
goto MENU

:EXIT
exit
