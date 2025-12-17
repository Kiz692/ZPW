# PowerShell script to test API endpoints
# Usage: .\test-api.ps1

$baseUrl = "http://localhost:3000"
$apiBase = "$baseUrl/api/v1/people"

Write-Host "=== Testing ZPW People Core API ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "   ✅ Health Check: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Health Check Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Readiness Check
Write-Host "2. Testing Readiness Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ready" -Method Get
    Write-Host "   ✅ Readiness: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Readiness Check Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: List Persons (may require auth token)
Write-Host "3. Testing GET /api/v1/people/persons..." -ForegroundColor Yellow
try {
    $headers = @{
        "Content-Type" = "application/json"
        # Add Authorization header if needed:
        # "Authorization" = "Bearer YOUR_TOKEN_HERE"
    }
    $response = Invoke-RestMethod -Uri "$apiBase/persons" -Method Get -Headers $headers
    Write-Host "   ✅ Found $($response.Count) persons" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ⚠️  Requires authentication (401)" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Failed: $_" -ForegroundColor Red
    }
}
Write-Host ""

# Test 4: Create Person (may require auth token)
Write-Host "4. Testing POST /api/v1/people/persons..." -ForegroundColor Yellow
try {
    $body = @{
        perFirstName = "Test"
        perLastName = "User"
        perDisplayName = "Test User from PowerShell"
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
        # Add Authorization header if needed:
        # "Authorization" = "Bearer YOUR_TOKEN_HERE"
    }
    
    $response = Invoke-RestMethod -Uri "$apiBase/persons" -Method Post -Body $body -Headers $headers
    Write-Host "   ✅ Created person with ID: $($response.perId)" -ForegroundColor Green
    $createdPersonId = $response.perId
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ⚠️  Requires authentication (401)" -ForegroundColor Yellow
    } elseif ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   ⚠️  Validation error (400)" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Failed: $_" -ForegroundColor Red
    }
    $createdPersonId = $null
}
Write-Host ""

# Test 5: Get Person by ID
if ($createdPersonId) {
    Write-Host "5. Testing GET /api/v1/people/persons/$createdPersonId..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Content-Type" = "application/json"
            # Add Authorization header if needed:
            # "Authorization" = "Bearer YOUR_TOKEN_HERE"
        }
        $response = Invoke-RestMethod -Uri "$apiBase/persons/$createdPersonId" -Method Get -Headers $headers
        Write-Host "   ✅ Retrieved person: $($response.perFirstName) $($response.perLastName)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "=== Testing Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Some endpoints may require authentication." -ForegroundColor Yellow
Write-Host "To test with auth, add your JWT token to the Authorization header." -ForegroundColor Yellow

