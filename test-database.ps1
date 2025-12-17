# PowerShell script to test database connectivity and query data
# Usage: .\test-database.ps1

Write-Host "=== Testing ZPW Database ===" -ForegroundColor Cyan
Write-Host ""

# Check if Docker container is running
Write-Host "1. Checking PostgreSQL container..." -ForegroundColor Yellow
$container = docker ps --filter "name=zpw-postgres" --format "{{.Names}}"
if ($container -eq "zpw-postgres") {
    Write-Host "   ✅ PostgreSQL container is running" -ForegroundColor Green
} else {
    Write-Host "   ❌ PostgreSQL container is not running" -ForegroundColor Red
    Write-Host "   Run: docker compose up -d postgres" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test database connection
Write-Host "2. Testing database connection..." -ForegroundColor Yellow
try {
    $query = "SELECT version();"
    $result = docker exec -i zpw-postgres psql -U zpw_user -d zpw_db -c $query 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Database connection successful" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Database connection failed" -ForegroundColor Red
        Write-Host "   Error: $result" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error: $_" -ForegroundColor Red
}
Write-Host ""

# Count persons
Write-Host "3. Counting persons in database..." -ForegroundColor Yellow
try {
    $query = "SELECT COUNT(*) as count FROM pid_person WHERE per_deleted_at IS NULL;"
    $result = docker exec -i zpw-postgres psql -U zpw_user -d zpw_db -t -c $query 2>&1
    if ($LASTEXITCODE -eq 0) {
        $count = $result.Trim()
        Write-Host "   ✅ Found $count active persons" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Could not count persons (table may not exist)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Error: $_" -ForegroundColor Yellow
}
Write-Host ""

# Count employees
Write-Host "4. Counting employees in database..." -ForegroundColor Yellow
try {
    $query = "SELECT COUNT(*) as count FROM pid_employee WHERE emp_deleted_at IS NULL;"
    $result = docker exec -i zpw-postgres psql -U zpw_user -d zpw_db -t -c $query 2>&1
    if ($LASTEXITCODE -eq 0) {
        $count = $result.Trim()
        Write-Host "   ✅ Found $count active employees" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Could not count employees (table may not exist)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Error: $_" -ForegroundColor Yellow
}
Write-Host ""

# List recent persons
Write-Host "5. Listing recent persons..." -ForegroundColor Yellow
try {
    $query = @"
SELECT 
    per_id,
    per_first_name,
    per_last_name,
    per_display_name,
    per_created_at
FROM pid_person
WHERE per_deleted_at IS NULL
ORDER BY per_created_at DESC
LIMIT 5;
"@
    $result = docker exec -i zpw-postgres psql -U zpw_user -d zpw_db -c $query 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Recent persons:" -ForegroundColor Green
        Write-Host $result
    } else {
        Write-Host "   ⚠️  Could not list persons" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Error: $_" -ForegroundColor Yellow
}
Write-Host ""

# Check tables
Write-Host "6. Checking People Core tables..." -ForegroundColor Yellow
try {
    $query = @"
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'pid_%'
ORDER BY table_name;
"@
    $result = docker exec -i zpw-postgres psql -U zpw_user -d zpw_db -c $query 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ People Core tables found:" -ForegroundColor Green
        Write-Host $result
    } else {
        Write-Host "   ⚠️  Could not list tables" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Error: $_" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=== Database Testing Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To interact with the database directly, run:" -ForegroundColor Yellow
Write-Host "  docker exec -it zpw-postgres psql -U zpw_user -d zpw_db" -ForegroundColor White

