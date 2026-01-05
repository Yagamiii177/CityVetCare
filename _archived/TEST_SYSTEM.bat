@echo off
REM ===========================================
REM CityVetCare - Complete System Test
REM ===========================================

echo.
echo ========================================
echo   CityVetCare - System Test Suite
echo ========================================
echo.

REM Check if backend is running
echo [1/3] Checking backend server...
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ Backend is running
) else (
    echo   ✗ Backend is NOT running!
    echo.
    echo   Starting backend server...
    start "CityVetCare Backend" /min cmd /k "cd Backend-Node && npm start"
    timeout /t 5 /nobreak >nul
)

REM Run validation tests
echo.
echo [2/3] Running system validation...
node validate-system.js
if %errorlevel% equ 0 (
    echo.
    echo   ✓ All validation tests passed
) else (
    echo.
    echo   ✗ Some tests failed
    echo   Please review the test output above
    pause
    exit /b 1
)

REM Success
echo.
echo [3/3] System check complete
echo.
echo ========================================
echo   ✓ CityVetCare System: OPERATIONAL
echo ========================================
echo.
echo   Backend:  http://localhost:3000
echo   API Docs: http://localhost:3000/
echo.
echo   To start web frontend:
echo     cd Frontend\web
echo     npm run dev
echo.
echo   To start mobile app:
echo     cd Frontend\mobile
echo     npm start
echo.
pause
