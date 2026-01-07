Write-Host "=== MySQL XAMPP Diagnostic Tool ===" -ForegroundColor Cyan
Write-Host ""

# Check 1: MySQL Processes
Write-Host "[1] Checking for running MySQL processes..." -ForegroundColor Yellow
$mysqlProcesses = Get-Process -Name mysqld -ErrorAction SilentlyContinue
if ($mysqlProcesses) {
    Write-Host "   FOUND: MySQL processes running!" -ForegroundColor Red
    $mysqlProcesses | Format-Table Id, ProcessName, StartTime -AutoSize
    Write-Host "   ACTION: Kill these processes before starting XAMPP MySQL" -ForegroundColor Green
    Write-Host "   Run: taskkill /F /IM mysqld.exe" -ForegroundColor White
} else {
    Write-Host "   OK: No MySQL processes found" -ForegroundColor Green
}
Write-Host ""

# Check 2: Port 3306
Write-Host "[2] Checking port 3306..." -ForegroundColor Yellow
$port3306 = netstat -ano | Select-String ":3306"
if ($port3306) {
    Write-Host "   FOUND: Port 3306 is in use!" -ForegroundColor Red
    Write-Host $port3306
    $pidMatch = $port3306 -match "(\d+)$"
    if ($pidMatch) {
        $pid = $Matches[1]
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "   Process using port: $($process.ProcessName) (PID: $pid)" -ForegroundColor Red
            Write-Host "   ACTION: Stop this process or change MySQL port" -ForegroundColor Green
        }
    }
} else {
    Write-Host "   OK: Port 3306 is available" -ForegroundColor Green
}
Write-Host ""

# Check 3: Lock Files
Write-Host "[3] Checking for lock files in MySQL data directory..." -ForegroundColor Yellow
$dataPath = "C:\xampp\mysql\data"
if (Test-Path $dataPath) {
    $lockFiles = Get-ChildItem -Path $dataPath -Filter "*.lock" -ErrorAction SilentlyContinue
    $pidFiles = Get-ChildItem -Path $dataPath -Filter "*.pid" -ErrorAction SilentlyContinue
    
    if ($lockFiles -or $pidFiles) {
        Write-Host "   FOUND: Lock/PID files detected!" -ForegroundColor Red
        $lockFiles | ForEach-Object { Write-Host "   - $($_.Name)" -ForegroundColor Red }
        $pidFiles | ForEach-Object { Write-Host "   - $($_.Name)" -ForegroundColor Red }
        Write-Host "   ACTION: Delete these files" -ForegroundColor Green
        Write-Host "   Run this script with -DeleteLocks parameter" -ForegroundColor White
    } else {
        Write-Host "   OK: No lock files found" -ForegroundColor Green
    }
} else {
    Write-Host "   WARNING: MySQL data path not found at $dataPath" -ForegroundColor Red
}
Write-Host ""

# Check 4: Error Logs
Write-Host "[4] Checking MySQL error logs..." -ForegroundColor Yellow
$errorLog = Get-ChildItem -Path "C:\xampp\mysql\data" -Filter "*.err" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($errorLog) {
    Write-Host "   Found error log: $($errorLog.Name)" -ForegroundColor Yellow
    Write-Host "   Last 15 lines:" -ForegroundColor Yellow
    Get-Content $errorLog.FullName -Tail 15 | ForEach-Object {
        if ($_ -match "ERROR|FATAL") {
            Write-Host "   $_" -ForegroundColor Red
        } else {
            Write-Host "   $_" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "   No error log found (or MySQL never started)" -ForegroundColor Yellow
}
Write-Host ""

# Check 5: Windows MySQL Services
Write-Host "[5] Checking Windows Services..." -ForegroundColor Yellow
$services = Get-Service -Name "*mysql*" -ErrorAction SilentlyContinue
if ($services) {
    Write-Host "   FOUND: MySQL Windows services!" -ForegroundColor Red
    $services | Format-Table Name, Status, StartType -AutoSize
    Write-Host "   ACTION: Stop and disable these services" -ForegroundColor Green
    Write-Host "   Run: net stop <service-name>" -ForegroundColor White
} else {
    Write-Host "   OK: No MySQL Windows services found" -ForegroundColor Green
}
Write-Host ""

Write-Host "=== RECOMMENDATIONS ===" -ForegroundColor Cyan
Write-Host "1. If processes are running: taskkill /F /IM mysqld.exe" -ForegroundColor White
Write-Host "2. If port is blocked: Stop the blocking service" -ForegroundColor White
Write-Host "3. If lock files exist: Run this script with -DeleteLocks" -ForegroundColor White
Write-Host "4. If Windows service exists: Disable it in services.msc" -ForegroundColor White
Write-Host ""

# Optional parameter to delete lock files
param(
    [switch]$DeleteLocks,
    [switch]$KillProcesses
)

if ($DeleteLocks) {
    Write-Host "Deleting lock and PID files..." -ForegroundColor Yellow
    Remove-Item -Path "C:\xampp\mysql\data\*.lock" -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "C:\xampp\mysql\data\*.pid" -Force -ErrorAction SilentlyContinue
    Write-Host "Done!" -ForegroundColor Green
}

if ($KillProcesses) {
    Write-Host "Killing MySQL processes..." -ForegroundColor Yellow
    Stop-Process -Name mysqld -Force -ErrorAction SilentlyContinue
    Write-Host "Done!" -ForegroundColor Green
}
