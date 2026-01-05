@echo off
cls
echo ========================================
echo    CityVetCare Complete Setup
echo ========================================
echo.
echo This will:
echo   1. Install backend dependencies
echo   2. Install frontend (web) dependencies
echo   3. Install frontend (mobile) dependencies
echo   4. Setup database
echo   5. Verify everything is working
echo.
echo Please ensure MySQL is running!
echo.
pause

cd /d "%~dp0"

echo.
echo ========================================
echo Step 1: Installing Backend Dependencies
echo ========================================
cd Backend-Node
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed
echo.

echo ========================================
echo Step 2: Installing Frontend (Web) Dependencies
echo ========================================
cd ..\Frontend\web
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install web dependencies
    pause
    exit /b 1
)
echo ✓ Web dependencies installed
echo.

echo ========================================
echo Step 3: Installing Frontend (Mobile) Dependencies
echo ========================================
cd ..\mobile
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install mobile dependencies
    pause
    exit /b 1
)
echo ✓ Mobile dependencies installed
echo.

echo ========================================
echo Step 4: Setting Up Database
echo ========================================
cd ..\..\Backend-Node
node reset-database.js
if errorlevel 1 (
    echo ERROR: Failed to setup database
    echo Please check if MySQL is running
    pause
    exit /b 1
)
echo ✓ Database created successfully
echo.

echo ========================================
echo Step 5: Verifying Setup
echo ========================================
echo.

echo Checking backend configuration...
if not exist "%~dp0Backend-Node\.env" (
    echo WARNING: .env file not found in Backend-Node
    echo Please configure your database settings
) else (
    echo ✓ Backend .env file exists
)

echo.
echo Checking database connection...
cd "%~dp0Backend-Node"
node -e "import('./config/database.js').then(db => db.testConnection().then(() => { console.log('✓ Database connection successful'); process.exit(0); }).catch(e => { console.error('✗ Database connection failed:', e.message); process.exit(1); }))"
if errorlevel 1 (
    echo.
    echo ERROR: Database connection test failed
    echo Please check your MySQL server and .env configuration
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✓ Setup Complete - No Errors Detected!
echo ========================================
echo.
echo All dependencies installed successfully
echo Database setup completed
echo Configuration verified
echo.
echo To start the system, run:
echo   Backend:  cd Backend-Node ^&^& npm start
echo   Web:      cd Frontend\web ^&^& npm run dev
echo   Mobile:   cd Frontend\mobile ^&^& npm start
echo.
pause
