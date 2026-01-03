@echo off
echo ========================================
echo   Fixing sp_incidents_update Procedure
echo ========================================
echo.

REM Get MySQL credentials
set /p MYSQL_USER="Enter MySQL username (default: root): "
if "%MYSQL_USER%"=="" set MYSQL_USER=root

set /p MYSQL_PASS="Enter MySQL password: "

echo.
echo Running SQL fix script...
echo.

REM Run the SQL file
"C:\xampp\mysql\bin\mysql.exe" -u %MYSQL_USER% -p%MYSQL_PASS% < fix-update-procedure.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✓ Procedure fixed successfully!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo   ✗ Error fixing procedure
    echo ========================================
)

echo.
pause
