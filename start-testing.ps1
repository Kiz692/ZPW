# PowerShell script to start all services for testing
# Usage: .\start-testing.ps1

Write-Host "=== Starting ZPW Services for Testing ===" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "1. Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Docker is running" -ForegroundColor Green
} else {
    Write-Host "   ❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Start Docker services
Write-Host "2. Starting Docker services (PostgreSQL, Redis)..." -ForegroundColor Yellow
docker compose up -d postgres redis
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Docker services started" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed to start Docker services" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Wait for services to be ready
Write-Host "3. Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "   ✅ Services should be ready" -ForegroundColor Green
Write-Host ""

# Check if services are healthy
Write-Host "4. Checking service health..." -ForegroundColor Yellow
$postgresHealth = docker exec zpw-postgres pg_isready -U zpw_user 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ PostgreSQL is ready" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  PostgreSQL may not be ready yet" -ForegroundColor Yellow
}

$redisHealth = docker exec zpw-redis redis-cli ping 2>&1
if ($redisHealth -eq "PONG") {
    Write-Host "   ✅ Redis is ready" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Redis may not be ready yet" -ForegroundColor Yellow
}
Write-Host ""

# Instructions
Write-Host "=== Services Started ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start Backend (in a new terminal):" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start Frontend (in another terminal):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Access:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host "   Backend API: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Swagger UI: http://localhost:3000/api-docs" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Run tests:" -ForegroundColor White
Write-Host "   .\test-api.ps1        # Test API endpoints" -ForegroundColor Gray
Write-Host "   .\test-database.ps1   # Test database" -ForegroundColor Gray
Write-Host ""

