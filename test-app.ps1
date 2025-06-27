# Test Application Script
Write-Host "🔍 Testing Football Ticket Booking Application..." -ForegroundColor Green

# Wait for application to start
Write-Host "⏳ Waiting for application to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Test if application is running
Write-Host "🔍 Checking if application is running on port 8481..." -ForegroundColor Cyan
$portCheck = netstat -ano | findstr :8481
if ($portCheck) {
    Write-Host "✅ Application is running on port 8481" -ForegroundColor Green
    Write-Host $portCheck -ForegroundColor Gray
} else {
    Write-Host "❌ Application is not running on port 8481" -ForegroundColor Red
    exit 1
}

# Test home page
Write-Host "🌐 Testing home page..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8481/" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Home page accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Home page not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test login page
Write-Host "🔐 Testing login page..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8481/login.html" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Login page accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Login page not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test H2 console
Write-Host "🗄️ Testing H2 console..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8481/h2-console" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ H2 console accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ H2 console not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test API endpoints
Write-Host "🔌 Testing API endpoints..." -ForegroundColor Cyan

# Test events endpoint
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8481/api/events/all" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Events API accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Events API not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test protected endpoint (should return 401)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8481/api/bookings/all" -UseBasicParsing -TimeoutSec 10
    Write-Host "⚠️ Bookings API accessible without auth (Status: $($response.StatusCode))" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Bookings API properly protected (Status: 401)" -ForegroundColor Green
    } else {
        Write-Host "❌ Bookings API error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Application testing completed!" -ForegroundColor Green 