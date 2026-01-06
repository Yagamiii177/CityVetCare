@echo off
echo ================================
echo CityVetCare Node.js Backend
echo ================================
echo.
echo Installing dependencies...
call npm install
echo.
echo ================================
echo Setup complete!
echo ================================
echo.
echo Next steps:
echo 1. Copy .env.example to .env
echo 2. Edit .env with your database credentials
echo 3. Run: npm run migrate
echo 4. Run: npm run dev
echo.
pause
