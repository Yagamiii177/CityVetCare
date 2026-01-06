@echo off
cls
echo ========================================
echo    Mobile Connection Diagnostics
echo ========================================
echo.
echo This will test if your mobile device can
echo connect to the backend server.
echo.
echo ========================================
echo Step 1: Check Network Configuration
echo ========================================
echo.

echo Your PC's IP Addresses:
ipconfig | findstr /i "IPv4"

echo.
echo ========================================
echo Step 2: Test Backend Server
echo ========================================
echo.

echo Testing if backend is running on port 3000...
netstat -ano | findstr ":3000" | findstr "LISTENING"
if errorlevel 1 (
    echo.
    echo ❌ Backend is NOT running on port 3000
    echo.
    echo Please start the backend server first:
    echo   1. Run RUN.bat and select option 1
    echo   OR
    echo   2. cd Backend-Node ^&^& npm start
    echo.
    pause
    exit /b 1
) else (
    echo ✓ Backend is running on port 3000
)

echo.
echo ========================================
echo Step 3: Test Health Endpoint
echo ========================================
echo.

cd Backend-Node
node -e "fetch('http://localhost:3000/api/health').then(r => r.json()).then(d => console.log('✓ Health check passed:', JSON.stringify(d))).catch(e => console.error('✗ Health check failed:', e.message))"

echo.
echo ========================================
echo Step 4: Firewall Check
echo ========================================
echo.
echo Checking Windows Firewall status...
netsh advfirewall show currentprofile state

echo.
echo ========================================
echo Configuration Summary
echo ========================================
echo.
echo Backend URL for mobile app:
echo   http://192.168.0.108:3000/api
echo.
echo Make sure:
echo   ✓ Your phone is on the SAME WiFi network
echo   ✓ Backend server is running
echo   ✓ Windows Firewall allows Node.js
echo.
echo If mobile still can't connect:
echo   1. Temporarily disable Windows Firewall
echo   2. Check your router settings
echo   3. Verify IP address with 'ipconfig'
echo.
pause
