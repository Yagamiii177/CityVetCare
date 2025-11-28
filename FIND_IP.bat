@echo off
REM ============================================
REM CityVetCare - Find Your IP Helper
REM ============================================

echo.
echo ========================================
echo   Find Your IP Address for Mobile App
echo ========================================
echo.
echo Looking for your IP address...
echo.

REM Get the IPv4 address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set ip=%%a
    set ip=!ip:~1!
    echo Found IP: !ip!
)

echo.
echo ========================================
echo   Your Network Information
echo ========================================
ipconfig | findstr /c:"IPv4 Address" /c:"Wireless LAN adapter Wi-Fi" /c:"Ethernet adapter"

echo.
echo ========================================
echo   NEXT STEPS
echo ========================================
echo.
echo 1. Copy one of the IPv4 addresses above
echo    (Usually starts with 192.168.x.x)
echo.
echo 2. Open this file in your editor:
echo    Frontend\mobile\config\api.js
echo.
echo 3. Update the line:
echo    const API_BASE_URL = 'http://YOUR_IP:8000';
echo.
echo    Example:
echo    const API_BASE_URL = 'http://192.168.1.100:8000';
echo.
echo 4. Save the file
echo.
echo 5. Run the mobile app:
echo    cd Frontend\mobile
echo    npm start
echo.
echo ========================================
echo.

pause
