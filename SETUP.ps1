# CityVetCare Complete Setup Script
# This script will install dependencies, setup database, and verify everything works

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CityVetCare Complete Setup" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will:" -ForegroundColor White
Write-Host "  1. Install backend dependencies" -ForegroundColor Gray
Write-Host "  2. Install frontend dependencies" -ForegroundColor Gray
Write-Host "  3. Setup database" -ForegroundColor Gray
Write-Host "  4. Verify everything is working" -ForegroundColor Gray
Write-Host ""
Write-Host "Please ensure MySQL is running!" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"

$ErrorActionPreference = "Stop"
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

try {
    # Step 1: Install Backend Dependencies
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Step 1: Installing Backend Dependencies" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Set-Location "$scriptPath\Backend-Node"
    npm install
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
    Write-Host ""

    # Step 2: Install Frontend Dependencies
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Step 2: Installing Frontend Dependencies" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Set-Location "$scriptPath\Frontend\web"
    npm install
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
    Write-Host ""

    # Step 3: Setup Database
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Step 3: Setting Up Database" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Set-Location "$scriptPath\Backend-Node"
    node reset-database.js
    Write-Host "✓ Database created successfully" -ForegroundColor Green
    Write-Host ""

    # Apply migrations (safe to rerun)
    Write-Host "Applying database migrations..." -ForegroundColor Yellow
    npm run migrate
    Write-Host "✓ Migrations applied" -ForegroundColor Green
    Write-Host ""

    # Step 4: Verify Setup
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Step 4: Verifying Setup" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Checking backend configuration..." -ForegroundColor Yellow
    if (-not (Test-Path "$scriptPath\Backend-Node\.env")) {
        Write-Host "  WARNING: .env file not found in Backend-Node" -ForegroundColor Yellow
        Write-Host "  Please configure your database settings" -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ Backend .env file exists" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Checking database connection..." -ForegroundColor Yellow
    Set-Location "$scriptPath\Backend-Node"
    
    $testDbScript = @"
import('./config/database.js').then(db => {
    db.testConnection()
        .then(() => {
            console.log('✓ Database connection successful');
            process.exit(0);
        })
        .catch(e => {
            console.error('✗ Database connection failed:', e.message);
            process.exit(1);
        });
})
"@
    
    node -e $testDbScript
    if ($LASTEXITCODE -ne 0) {
        throw "Database connection test failed. Please check your MySQL server and .env configuration"
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ Setup Complete - No Errors Detected!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "All dependencies installed successfully" -ForegroundColor White
    Write-Host "Database setup completed" -ForegroundColor White
    Write-Host "Configuration verified" -ForegroundColor White
    Write-Host ""
    Write-Host "To start the system, run:" -ForegroundColor Yellow
    Write-Host "  Backend:  " -NoNewline; Write-Host "cd Backend-Node && npm start" -ForegroundColor Cyan
    Write-Host "  Frontend: " -NoNewline; Write-Host "cd Frontend\web && npm run dev" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Setup failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Make sure MySQL is running" -ForegroundColor Gray
    Write-Host "  - Check your .env file in Backend-Node folder" -ForegroundColor Gray
    Write-Host "  - Ensure Node.js and npm are installed" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Press Enter to exit this window..." -ForegroundColor Gray
Read-Host
