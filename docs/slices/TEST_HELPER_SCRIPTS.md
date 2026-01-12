# Test Helper Scripts

Quick helper commands for manual testing.

---

## 🚀 Quick Start Commands

### Start Everything (One Command)
```bash
# Windows PowerShell
docker compose up -d postgres redis; cd backend; Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"; cd ../frontend; Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

### Check Service Status
```bash
# Check Docker services
docker ps

# Check backend health
curl http://localhost:3000/health

# Check if ports are in use
netstat -ano | findstr ":3000"
netstat -ano | findstr ":5173"
```

---

## 🗄️ Database Helper Commands

### Connect to Database
```bash
docker exec -it zpw-postgres psql -U zpw_user -d zpw_db
```

### Quick Database Queries

**Count all persons:**
```sql
SELECT COUNT(*) FROM pid_person WHERE per_deleted_at IS NULL;
```

**View recent persons:**
```sql
SELECT per_id, per_first_name, per_last_name, per_display_name, per_created_at
FROM pid_person 
WHERE per_deleted_at IS NULL
ORDER BY per_created_at DESC
LIMIT 10;
```

**View employees:**
```sql
SELECT emp_id, emp_employee_number, emp_hire_date, emp_current_status_code
FROM pid_employee
WHERE emp_deleted_at IS NULL
ORDER BY emp_created_at DESC;
```

**Check audit trail:**
```sql
SELECT per_id, per_first_name, per_created_at, per_created_by, per_updated_at, per_updated_by
FROM pid_person
WHERE per_id = 1;
```

**Clean up test data (CAREFUL!):**
```sql
-- Only use in development!
UPDATE pid_person SET per_deleted_at = NOW() WHERE per_first_name LIKE 'Test%';
UPDATE pid_employee SET emp_deleted_at = NOW() WHERE emp_employee_number LIKE 'TEST%';
```

---

## 🔌 API Testing Commands

### Using cURL (if you have a token)

**List persons:**
```bash
curl -X GET "http://localhost:3000/api/v1/people/persons" -H "Authorization: Bearer YOUR_TOKEN"
```

**Create person:**
```bash
curl -X POST "http://localhost:3000/api/v1/people/persons" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"perFirstName\":\"Test\",\"perLastName\":\"User\"}"
```

**Get person by ID:**
```bash
curl -X GET "http://localhost:3000/api/v1/people/persons/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using PowerShell Invoke-WebRequest

**Health check:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/health" | Select-Object -ExpandProperty Content
```

**List persons (no auth - will get 401):**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/people/persons" | Select-Object StatusCode, Content
```

---

## 🧹 Cleanup Commands

### Stop All Services
```bash
# Stop Docker services
docker compose down

# Stop backend (Ctrl+C in terminal)
# Stop frontend (Ctrl+C in terminal)
```

### Reset Database (CAREFUL - Deletes all data!)
```bash
# Drop and recreate database
docker exec -it zpw-postgres psql -U zpw_user -d postgres -c "DROP DATABASE zpw_db;"
docker exec -it zpw-postgres psql -U zpw_user -d postgres -c "CREATE DATABASE zpw_db;"

# Reapply migrations
cd backend
npm run db:push
```

### Clear Test Data Only
```sql
-- Connect to database first
UPDATE pid_person SET per_deleted_at = NOW() WHERE per_first_name IN ('Test', 'API', 'John', 'Jane');
UPDATE pid_employee SET emp_deleted_at = NOW() WHERE emp_employee_number LIKE 'EMP%';
```

---

## 📊 Monitoring Commands

### Check Logs
```bash
# Backend logs (if running in terminal, you'll see them)
# Docker logs
docker logs zpw-postgres --tail 50
docker logs zpw-redis --tail 50
```

### Check Database Size
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Table Row Counts
```sql
SELECT 
  'pid_person' as table_name, COUNT(*) as row_count FROM pid_person WHERE per_deleted_at IS NULL
UNION ALL
SELECT 
  'pid_employee', COUNT(*) FROM pid_employee WHERE emp_deleted_at IS NULL
UNION ALL
SELECT 
  'pid_emp_contract', COUNT(*) FROM pid_emp_contract WHERE ctr_deleted_at IS NULL
UNION ALL
SELECT 
  'pid_wellness_profile', COUNT(*) FROM pid_wellness_profile WHERE wep_deleted_at IS NULL;
```

---

## 🔍 Debugging Commands

### Check Environment Variables
```bash
# Backend
cd backend
cat .env

# Frontend
cd frontend
cat .env
```

### Verify Dependencies
```bash
# Backend
cd backend
npm list --depth=0

# Frontend
cd frontend
npm list --depth=0
```

### Check TypeScript Compilation
```bash
# Backend
cd backend
npm run type-check

# Frontend
cd frontend
npm run type-check
```

---

## 📝 Test Data Generation

### Create Test Persons (SQL)
```sql
INSERT INTO pid_person (per_first_name, per_last_name, per_display_name, per_gender_code, per_date_of_birth, per_nationality_code)
VALUES 
  ('Alice', 'Smith', 'Alice Smith', 'F', '1990-05-15', 'US'),
  ('Bob', 'Jones', 'Bob Jones', 'M', '1985-08-20', 'KE'),
  ('Charlie', 'Brown', 'Charlie Brown', 'M', '1992-12-10', 'US');
```

### Create Test Employees (SQL)
```sql
-- First, get a person ID
SELECT per_id FROM pid_person WHERE per_first_name = 'Alice' LIMIT 1;

-- Then create employee (replace 1 with actual person ID, and 1 with tenant ID)
INSERT INTO pid_employee (emp_tenant_id, emp_per_id, emp_employee_number, emp_hire_date, emp_current_status_code)
VALUES (1, 1, 'EMP001', '2024-01-01', 'ACTIVE');
```

---

## ✅ Verification Checklist

Run these to verify everything is set up:

```bash
# 1. Docker services running
docker ps | grep -E "postgres|redis"

# 2. Backend responding
curl http://localhost:3000/health

# 3. Frontend accessible
curl http://localhost:5173

# 4. Database accessible
docker exec -it zpw-postgres psql -U zpw_user -d zpw_db -c "SELECT 1;"

# 5. Tables exist
docker exec -it zpw-postgres psql -U zpw_user -d zpw_db -c "\dt pid_*"
```

---

**Use these commands to speed up your manual testing!** 🚀

