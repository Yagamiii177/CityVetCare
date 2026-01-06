# ============================================
# CityVetCare System Test Script
# Tests: Database, Backend API, Frontend
# ============================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  CityVetCare System Test Suite" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$testsPassed = 0
$testsFailed = 0
$warnings = 0

# Function to test endpoint
function Test-Endpoint {
    param (
        [string]$Url,
        [string]$Description
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction Stop
        
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
            Write-Host "  [PASS] $Description" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  [FAIL] $Description (Status: $($response.StatusCode))" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  [FAIL] $Description - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# ============================================
# TEST 1: MySQL Database
# ============================================
Write-Host "[1/6] Testing MySQL Database Connection..." -ForegroundColor Yellow
Write-Host ""

$mysqlRunning = netstat -an | Select-String ":3306" -Quiet
if ($mysqlRunning) {
    Write-Host "  [PASS] MySQL is running on port 3306" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host "  [FAIL] MySQL is NOT running on port 3306" -ForegroundColor Red
    Write-Host "         Please start XAMPP or MySQL service" -ForegroundColor Yellow
    $testsFailed++
}

Start-Sleep -Seconds 1

# ============================================
# TEST 2: Backend Server
# ============================================
Write-Host ""
Write-Host "[2/6] Testing Backend Server..." -ForegroundColor Yellow
Write-Host ""

$backendRunning = netstat -an | Select-String ":3000" -Quiet
if ($backendRunning) {
    Write-Host "  [PASS] Backend server is running on port 3000" -ForegroundColor Green
    $testsPassed++
    
    # Test backend endpoints
    Write-Host ""
    Write-Host "  Testing Backend API Endpoints:" -ForegroundColor Cyan
    
    if (Test-Endpoint -Url "http://localhost:3000/api/health" -Description "Health Check") { $testsPassed++ } else { $testsFailed++ }
    Start-Sleep -Milliseconds 300
    
    if (Test-Endpoint -Url "http://localhost:3000/api/incidents" -Description "Incidents Endpoint") { $testsPassed++ } else { $testsFailed++ }
    Start-Sleep -Milliseconds 300
    
    if (Test-Endpoint -Url "http://localhost:3000/api/catchers" -Description "Catchers Endpoint") { $testsPassed++ } else { $testsFailed++ }
    Start-Sleep -Milliseconds 300
    
    if (Test-Endpoint -Url "http://localhost:3000/api/patrol-staff" -Description "Patrol Staff Endpoint") { $testsPassed++ } else { $testsFailed++ }
    Start-Sleep -Milliseconds 300
    
    if (Test-Endpoint -Url "http://localhost:3000/api/patrol-schedules" -Description "Patrol Schedules Endpoint") { $testsPassed++ } else { $testsFailed++ }
    Start-Sleep -Milliseconds 300
    
    if (Test-Endpoint -Url "http://localhost:3000/api/dashboard" -Description "Dashboard Endpoint") { $testsPassed++ } else { $testsFailed++ }
    
} else {
    Write-Host "  [FAIL] Backend server is NOT running on port 3000" -ForegroundColor Red
    Write-Host "         Start with: cd Backend-Node; npm start" -ForegroundColor Yellow
    $testsFailed++
}

Start-Sleep -Seconds 1

# ============================================
# TEST 3: Frontend Web Server
# ============================================
Write-Host ""
Write-Host "[3/6] Testing Frontend Web Server..." -ForegroundColor Yellow
Write-Host ""

$frontendRunning = netstat -an | Select-String ":5173" -Quiet
if ($frontendRunning) {
    Write-Host "  [PASS] Frontend server is running on port 5173" -ForegroundColor Green
    $testsPassed++
    
    # Test if frontend is accessible
    if (Test-Endpoint -Url "http://localhost:5173" -Description "Frontend Accessible") { $testsPassed++ } else { $testsFailed++ }
    
} else {
    Write-Host "  [FAIL] Frontend server is NOT running on port 5173" -ForegroundColor Red
    Write-Host "         Start with: cd Frontend/web; npm run dev" -ForegroundColor Yellow
    $testsFailed++
}

Start-Sleep -Seconds 1

# ============================================
# TEST 4: File Structure Integrity
# ============================================
Write-Host ""
Write-Host "[4/6] Testing File Structure Integrity..." -ForegroundColor Yellow
Write-Host ""

$requiredPaths = @(
    @{ Path = "Backend-Node\server.js"; Name = "Backend Server" },
    @{ Path = "Backend-Node\package.json"; Name = "Backend Package" },
    @{ Path = "Backend-Node\.env"; Name = "Backend Environment" },
    @{ Path = "Backend-Node\routes"; Name = "API Routes" },
    @{ Path = "Backend-Node\models"; Name = "Data Models" },
    @{ Path = "Backend-Node\config"; Name = "Configuration" },
    @{ Path = "Frontend\web"; Name = "Web Frontend" },
    @{ Path = "Frontend\mobile"; Name = "Mobile App" },
    @{ Path = "Database\schema.sql"; Name = "Database Schema" }
)

foreach ($item in $requiredPaths) {
    if (Test-Path $item.Path) {
        Write-Host "  [PASS] $($item.Name) exists" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  [FAIL] $($item.Name) missing: $($item.Path)" -ForegroundColor Red
        $testsFailed++
    }
}

# ============================================
# TEST 5: Backend Dependencies
# ============================================
Write-Host ""
Write-Host "[5/6] Testing Backend Dependencies..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "Backend-Node\node_modules") {
    Write-Host "  [PASS] Backend node_modules installed" -ForegroundColor Green
    $testsPassed++
    
    # Check key dependencies
    $keyDeps = @("express", "mysql2", "cors", "dotenv", "bcrypt", "jsonwebtoken", "multer")
    
    foreach ($dep in $keyDeps) {
        if (Test-Path "Backend-Node\node_modules\$dep") {
            Write-Host "  [PASS] $dep installed" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "  [FAIL] $dep missing" -ForegroundColor Red
            $testsFailed++
            $warnings++
        }
    }
    
} else {
    Write-Host "  [FAIL] Backend dependencies not installed" -ForegroundColor Red
    Write-Host "         Run: cd Backend-Node; npm install" -ForegroundColor Yellow
    $testsFailed++
}

# ============================================
# TEST 6: Environment Configuration
# ============================================
Write-Host ""
Write-Host "[6/6] Testing Environment Configuration..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "Backend-Node\.env") {
    $envContent = Get-Content "Backend-Node\.env" -Raw
    
    $requiredEnvVars = @("DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "PORT", "JWT_SECRET")
    
    foreach ($var in $requiredEnvVars) {
        if ($envContent -match "$var=") {
            Write-Host "  [PASS] $var configured" -ForegroundColor Green
            $testsPassed++
        } else {
            Write-Host "  [FAIL] $var not configured" -ForegroundColor Red
            $testsFailed++
        }
    }
} else {
    Write-Host "  [FAIL] .env file not found in Backend-Node" -ForegroundColor Red
    Write-Host "         Copy .env.example to .env and configure" -ForegroundColor Yellow
    $testsFailed++
}

# ============================================
# TEST SUMMARY
# ============================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Test Results Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "  Tests Passed: " -NoNewline
Write-Host "$testsPassed" -ForegroundColor Green

Write-Host "  Tests Failed: " -NoNewline
Write-Host "$testsFailed" -ForegroundColor Red

if ($warnings -gt 0) {
    Write-Host "  Warnings: " -NoNewline
    Write-Host "$warnings" -ForegroundColor Yellow
}

$totalTests = $testsPassed + $testsFailed
if ($totalTests -gt 0) {
    $successRate = [math]::Round(($testsPassed / $totalTests) * 100, 2)
    
    Write-Host ""
    Write-Host "  Success Rate: " -NoNewline
    if ($successRate -ge 90) {
        Write-Host "$successRate%" -ForegroundColor Green
    } elseif ($successRate -ge 70) {
        Write-Host "$successRate%" -ForegroundColor Yellow
    } else {
        Write-Host "$successRate%" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan

# ============================================
# RECOMMENDATIONS
# ============================================
if ($testsFailed -gt 0) {
    Write-Host ""
    Write-Host "Recommendations:" -ForegroundColor Yellow
    Write-Host ""
    
    if (-not $mysqlRunning) {
        Write-Host "  1. Start MySQL/XAMPP service" -ForegroundColor White
    }
    
    if (-not $backendRunning) {
        Write-Host "  2. Start Backend: cd Backend-Node; npm start" -ForegroundColor White
    }
    
    if (-not $frontendRunning) {
        Write-Host "  3. Start Frontend: cd Frontend/web; npm run dev" -ForegroundColor White
    }
    
    if (-not (Test-Path "Backend-Node\node_modules")) {
        Write-Host "  4. Install dependencies: cd Backend-Node; npm install" -ForegroundColor White
    }
    
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "All tests passed! Your system is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Backend API:  http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  Web App:      http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Exit with appropriate code
if ($testsFailed -eq 0) {
    exit 0
} else {
    exit 1
}
