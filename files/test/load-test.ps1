# Load Testing Script for Hazjak
# This script simulates multiple users accessing the application

Write-Host "Starting load test for Hazjak application..." -ForegroundColor Green

# Configuration
$baseUrl = "http://localhost:3000"
$concurrentUsers = 10
$requestsPerUser = 5
$totalRequests = $concurrentUsers * $requestsPerUser

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "- Base URL: $baseUrl"
Write-Host "- Concurrent Users: $concurrentUsers"
Write-Host "- Requests per User: $requestsPerUser"
Write-Host "- Total Requests: $totalRequests"
Write-Host ""

# Function to make a request
function Make-Request {
    param([string]$url, [string]$method = "GET", [string]$data = $null)

    try {
        if ($method -eq "GET") {
            $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10
        } else {
            $response = Invoke-WebRequest -Uri $url -Method POST -Body $data -ContentType "application/json" -TimeoutSec 10
        }

        return @{
            StatusCode = $response.StatusCode
            StatusDescription = $response.StatusDescription
            ResponseTime = $response.Headers.'X-Response-Time' # If server provides it
            Success = $true
        }
    } catch {
        return @{
            StatusCode = $_.Exception.Response.StatusCode.value__
            StatusDescription = $_.Exception.Response.StatusDescription
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# Test scenarios
$scenarios = @(
    @{ Name = "Homepage Load"; Url = "$baseUrl/"; Method = "GET" },
    @{ Name = "API Fields"; Url = "$baseUrl/api/fields"; Method = "GET" },
    @{ Name = "API Bookings"; Url = "$baseUrl/api/bookings"; Method = "GET" },
    @{ Name = "Booking Creation"; Url = "$baseUrl/api/bookings"; Method = "POST"; Data = '{"fieldId":1,"fieldName":"Test Field","date":"2026-05-15","time":"14:00","userId":12345,"userName":"Test User","phone":"+963999000000"}' },
    @{ Name = "User Registration"; Url = "$baseUrl/api/users/register"; Method = "POST"; Data = '{"name":"Test User","phone":"+963999111111","password":"test123","idImage":"test.jpg"}' }
)

# Run load test
$results = @()
$startTime = Get-Date

Write-Host "Running load test..." -ForegroundColor Cyan

for ($user = 1; $user -le $concurrentUsers; $user++) {
    Write-Host "Starting user $user..." -ForegroundColor Gray

    # Run requests for each user
    foreach ($scenario in $scenarios) {
        $requestStart = Get-Date

        $result = Make-Request -url $scenario.Url -method $scenario.Method -data $scenario.Data

        $requestEnd = Get-Date
        $duration = ($requestEnd - $requestStart).TotalMilliseconds

        $results += @{
            User = $user
            Scenario = $scenario.Name
            Method = $scenario.Method
            Url = $scenario.Url
            StatusCode = $result.StatusCode
            Success = $result.Success
            Duration = $duration
            Error = $result.Error
        }

        # Small delay between requests
        Start-Sleep -Milliseconds 100
    }

    Write-Host "User $user completed." -ForegroundColor Gray
}

$endTime = Get-Date
$totalDuration = ($endTime - $startTime).TotalSeconds

# Analyze results
$successfulRequests = ($results | Where-Object { $_.Success -eq $true }).Count
$failedRequests = $totalRequests - $successfulRequests
$averageResponseTime = ($results | Where-Object { $_.Success -eq $true } | Measure-Object -Property Duration -Average).Average

Write-Host ""
Write-Host "=== LOAD TEST RESULTS ===" -ForegroundColor Green
Write-Host "Total Duration: $([math]::Round($totalDuration, 2)) seconds"
Write-Host "Total Requests: $totalRequests"
Write-Host "Successful Requests: $successfulRequests"
Write-Host "Failed Requests: $failedRequests"
Write-Host "Success Rate: $([math]::Round(($successfulRequests / $totalRequests) * 100, 2))%"
Write-Host "Average Response Time: $([math]::Round($averageResponseTime, 2)) ms"
Write-Host ""

# Detailed results by scenario
Write-Host "=== DETAILED RESULTS BY SCENARIO ===" -ForegroundColor Yellow
$scenarios | ForEach-Object {
    $scenarioName = $_.Name
    $scenarioResults = $results | Where-Object { $_.Scenario -eq $scenarioName }
    $scenarioSuccess = ($scenarioResults | Where-Object { $_.Success -eq $true }).Count
    $scenarioTotal = $scenarioResults.Count
    $scenarioAvgTime = ($scenarioResults | Where-Object { $_.Success -eq $true } | Measure-Object -Property Duration -Average).Average

    Write-Host "$scenarioName : $scenarioSuccess/$scenarioTotal successful, Avg: $([math]::Round($scenarioAvgTime, 2)) ms"
}

# Performance assessment
Write-Host ""
Write-Host "=== PERFORMANCE ASSESSMENT ===" -ForegroundColor Cyan

if ($averageResponseTime -lt 500) {
    Write-Host "✅ Excellent performance! Average response time under 500ms" -ForegroundColor Green
} elseif ($averageResponseTime -lt 1000) {
    Write-Host "⚠️ Good performance. Average response time between 500-1000ms" -ForegroundColor Yellow
} else {
    Write-Host "❌ Poor performance. Average response time over 1000ms" -ForegroundColor Red
}

$successRate = ($successfulRequests / $totalRequests) * 100
if ($successRate -gt 95) {
    Write-Host "✅ High reliability! Success rate over 95%" -ForegroundColor Green
} elseif ($successRate -gt 80) {
    Write-Host "⚠️ Acceptable reliability. Success rate between 80-95%" -ForegroundColor Yellow
} else {
    Write-Host "❌ Low reliability. Success rate under 80%" -ForegroundColor Red
}

Write-Host ""
Write-Host "Load test completed!" -ForegroundColor Green