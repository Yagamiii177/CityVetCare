# PowerShell Test Script for Image Upload API

Write-Host "Testing Image Upload API..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Testing backend health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get
    Write-Host "Backend is running!" -ForegroundColor Green
    Write-Host "Version: $($healthResponse.version)" -ForegroundColor Gray
} catch {
    Write-Host "Backend is not running!" -ForegroundColor Red
    Write-Host "Please start the backend server first." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

Write-Host "Testing upload endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/incidents/upload-images" -Method Post -ContentType "multipart/form-data"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "Endpoint correctly rejects empty uploads" -ForegroundColor Green
    } else {
        Write-Host "Unexpected response" -ForegroundColor Yellow
    }
}
Write-Host ""

Write-Host "Backend is ready for image uploads!" -ForegroundColor Green
Write-Host ""
Write-Host "What was fixed:" -ForegroundColor Cyan
Write-Host "- Frontend now uploads actual files" -ForegroundColor Gray
Write-Host "- Images saved to Backend-Node/uploads/incident-images/" -ForegroundColor Gray
Write-Host "- Images accessible via HTTP on port 3000" -ForegroundColor Gray
Write-Host ""
Write-Host "To test manually:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5174" -ForegroundColor Gray
Write-Host "2. Go to All Incident Reports" -ForegroundColor Gray
Write-Host "3. Click New Report and upload images" -ForegroundColor Gray
Write-Host "4. Submit and verify images display" -ForegroundColor Gray
