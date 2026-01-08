# Test Mobile Emergency Report - PowerShell Script

Write-Host "`n╔═══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Mobile Emergency Report Test Suite  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════╝" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TEST 1: Backend Health Check" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get
    if ($health.status -eq "ok") {
        Write-Host "✅ Backend is running and healthy" -ForegroundColor Green
        $healthOk = $true
    } else {
        Write-Host "❌ Backend health check failed" -ForegroundColor Red
        $healthOk = $false
    }
} catch {
    Write-Host "❌ Cannot connect to backend: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure backend is running on port 3000" -ForegroundColor Yellow
    exit 1
}

# Test 2: Submit Emergency Report
Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TEST 2: Emergency Report Submission" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

$reportData = @{
    title = "Stray Animal Report"
    description = "Test emergency report from PowerShell - stray dog found"
    location = "14.5995,120.9842"
    latitude = 14.5995
    longitude = 120.9842
    status = "Pending"
    reporter_name = "PowerShell Test User"
    reporter_contact = "09112233445"
    incident_date = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    incident_type = "stray"
    pet_color = "Brown"
    pet_breed = "Aspin"
    animal_type = "dog"
    pet_gender = "Male"
    pet_size = "Medium"
    images = @()
} | ConvertTo-Json

try {
    Write-Host "📤 Submitting emergency report..." -ForegroundColor Blue
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/incidents" -Method Post -Body $reportData -ContentType "application/json"
    
    if ($response.success -and $response.id) {
        Write-Host "✅ Report submitted successfully!" -ForegroundColor Green
        Write-Host "   Report ID: $($response.id)" -ForegroundColor Green
        $reportId = $response.id
        $submitOk = $true
    } else {
        Write-Host "❌ Report submission failed" -ForegroundColor Red
        $submitOk = $false
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    exit 1
}

# Test 3: Verify in Database
Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TEST 3: Database Verification" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

try {
    Write-Host "🔍 Fetching report $reportId..." -ForegroundColor Blue
    $incident = Invoke-RestMethod -Uri "http://localhost:3000/api/incidents/$reportId" -Method Get
    
    if ($incident.success -and $incident.data) {
        Write-Host "✅ Report found in database!" -ForegroundColor Green
        Write-Host "`n📋 Report Details:" -ForegroundColor Cyan
        Write-Host "   ID: $($incident.data.id)" -ForegroundColor Blue
        Write-Host "   Type: $($incident.data.report_type)" -ForegroundColor Blue
        Write-Host "   Status: $($incident.data.status)" -ForegroundColor Blue
        Write-Host "   Reporter: $($incident.data.reporter_name)" -ForegroundColor Blue
        Write-Host "   Contact: $($incident.data.reporter_contact)" -ForegroundColor Blue
        Write-Host "   Animal: $($incident.data.animal_type) - $($incident.data.pet_breed)" -ForegroundColor Blue
        $dbOk = $true
    } else {
        Write-Host "❌ Report not found" -ForegroundColor Red
        $dbOk = $false
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $dbOk = $false
}

# Test 4: Verify in Monitoring List
Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TEST 4: Monitoring List Verification" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

try {
    Write-Host "🔍 Fetching all incidents..." -ForegroundColor Blue
    $incidents = Invoke-RestMethod -Uri "http://localhost:3000/api/incidents" -Method Get
    
    if ($incidents.success) {
        Write-Host "✅ Found $($incidents.records.Count) total incidents" -ForegroundColor Green
        
        $testReport = $incidents.records | Where-Object { $_.reporter_contact -eq "09112233445" }
        
        if ($testReport) {
            Write-Host "✅ Test report appears in monitoring!" -ForegroundColor Green
            Write-Host "   Report will be visible in web dashboard" -ForegroundColor Green
            $monitoringOk = $true
        } else {
            Write-Host "⚠️  Test report not found in list" -ForegroundColor Yellow
            $monitoringOk = $false
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $monitoringOk = $false
}

# Summary
Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

$tests = @{
    "Backend Health" = $healthOk
    "Report Submission" = $submitOk
    "Database Storage" = $dbOk
    "Monitoring Display" = $monitoringOk
}

foreach ($test in $tests.GetEnumerator()) {
    if ($test.Value) {
        Write-Host "✅ $($test.Key)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($test.Key)" -ForegroundColor Red
    }
}

$passedCount = ($tests.Values | Where-Object { $_ -eq $true }).Count
$totalCount = $tests.Count

Write-Host "`n$passedCount/$totalCount tests passed`n" -ForegroundColor $(if ($passedCount -eq $totalCount) { "Green" } else { "Yellow" })

if ($passedCount -eq $totalCount) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "`n✅ Mobile emergency reports are working correctly:" -ForegroundColor Green
    Write-Host "   • Reports are stored in database" -ForegroundColor Green
    Write-Host "   • Reports appear in web monitoring" -ForegroundColor Green
    Write-Host "   • No login required (emergency feature)" -ForegroundColor Green
    Write-Host "`n📱 You can now test on your mobile device!" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  SOME TESTS FAILED - Review errors above" -ForegroundColor Yellow
}
