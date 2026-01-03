@echo off
REM Apply Mobile Fields Stored Procedure Updates
REM Run this to update the database with the new stored procedures

echo ========================================
echo  Updating Database Stored Procedures
echo ========================================
echo.

REM Check if MySQL is accessible
where mysql >nul 2>nul
if errorlevel 1 (
    echo [ERROR] MySQL not found in PATH
    echo.
    echo Please run this command manually in MySQL Workbench or command line:
    echo.
    echo SOURCE C:\Users\libre\OneDrive\Desktop\CityVetCare\Database\migrations\update_stored_procedures_mobile_fields.sql
    echo.
    pause
    exit /b 1
)

echo [INFO] Applying stored procedure updates...
echo.

mysql -u root -p cityvetcare_db < "%~dp0..\Database\migrations\update_stored_procedures_mobile_fields.sql"

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to apply updates
    echo Please check your MySQL connection
    pause
    exit /b 1
)

echo.
echo ========================================
echo  ✅ Database Updated Successfully!
echo ========================================
echo.
echo The following stored procedures have been updated:
echo - sp_incidents_create (now supports 18 parameters)
echo - sp_incidents_update (now supports 18 parameters)
echo.
echo These procedures now include mobile fields:
echo - incident_type
echo - pet_color
echo - pet_breed
echo - animal_type
echo - pet_gender
echo - pet_size
echo.
pause
