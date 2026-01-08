$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"
$sqlFile = "Database\migrations\add_owner_id_to_incident_report.sql"
$database = "cityvetcare_db"
$user = "root"
$password = ""

Write-Host "Running migration: add_owner_id_to_incident_report.sql" -ForegroundColor Yellow

# Read SQL file content
$sqlContent = Get-Content $sqlFile -Raw

# Execute SQL
$process = Start-Process -FilePath $mysqlPath `
    -ArgumentList "-u$user", "-p$password", $database `
    -NoNewWindow `
    -Wait `
    -PassThru `
    -RedirectStandardInput $sqlFile `
    -RedirectStandardOutput "migration-output.txt" `
    -RedirectStandardError "migration-error.txt"

if ($process.ExitCode -eq 0) {
    Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
    if (Test-Path "migration-output.txt") {
        Get-Content "migration-output.txt"
    }
} else {
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    if (Test-Path "migration-error.txt") {
        Get-Content "migration-error.txt"
    }
}

# Cleanup temporary files
Remove-Item "migration-output.txt" -ErrorAction SilentlyContinue
Remove-Item "migration-error.txt" -ErrorAction SilentlyContinue
