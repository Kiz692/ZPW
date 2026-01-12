# People Core Demo Guide

**Document Version**: 1.0  
**Created**: 2025-01-XX  
**Purpose**: Guide for preparing and running demos of People Core

---

## Table of Contents

1. [Pre-Demo Checklist](#pre-demo-checklist)
2. [Setting Up Demo Data](#setting-up-demo-data)
3. [Verifying System is Ready](#verifying-system-is-ready)
4. [Demo Scenarios](#demo-scenarios)
5. [Expected Data](#expected-data)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Demo Checklist

Before your demo, ensure:

- [ ] Database is running (PostgreSQL)
- [ ] Backend server is running (`npm run dev` in `backend/`)
- [ ] Frontend server is running (`npm run dev` in `frontend/`)
- [ ] Demo data is seeded (`npm run demo:seed`)
- [ ] Demo data is verified (`npm run demo:verify`)
- [ ] Tests pass (`npm test`)
- [ ] Health endpoints respond (`/health`, `/ready`)

---

## Setting Up Demo Data

### Step 1: Start Database

```bash
# If using Docker
docker-compose up -d postgres

# Or ensure PostgreSQL is running locally
pg_isready
```

### Step 2: Seed Demo Data

```bash
cd backend
npm run demo:seed
```

**Expected Output**:
```
🌱 Starting demo seed...
✅ Found existing tenant: Demo Company (ID: 1)
✅ Found 5 associated persons
✅ All 3 demo employees already exist
✅ All demo contracts already exist
✅ All demo contacts already exist
✅ All demo wellness profiles already exist

✅ Demo seed completed successfully!

📊 Summary:
   - Tenant: Demo Company (ID: 1)
   - Persons: 5
   - Employees: 3
   - Contracts: 2
   - Contacts: 3
   - Wellness Profiles: 2

💡 Use tenant ID 1 in X-Tenant-ID header for API requests
```

**Note**: The seed script is **idempotent** - safe to run multiple times. It will check for existing data before creating.

### Step 3: Verify Demo Data

```bash
npm run demo:verify
```

**Expected Output**:
```
🔍 Verifying demo data...

1. Checking demo tenant...
✅ Demo tenant found: Demo Company (ID: 1)

2. Checking demo persons...
   Total persons: 5
   ✅ Found 5 persons (expected: 5)

3. Checking demo employees...
   Found 3 demo employees:
     - EMP001: ACTIVE
     - EMP002: ACTIVE
     - EMP003: PROBATION
   ✅ All 3 demo employees found

4. Checking demo contracts...
   Found 2 contracts
   ✅ All 2 contracts found

5. Checking demo contacts...
   Found 3 contacts
   ✅ Found 3 contacts (expected: 3)

6. Checking demo wellness profiles...
   Found 2 wellness profiles
   ✅ All 2 wellness profiles found

📊 Verification Summary:
   Tenant ID: 1
   Persons: 5 (expected: 5)
   Employees: 3 (expected: 3)
   Contracts: 2 (expected: 2)
   Contacts: 3 (expected: 3)
   Wellness Profiles: 2 (expected: 2)

✅ Demo data is ready!
```

---

## Verifying System is Ready

### 1. Check Backend Health

```bash
curl http://localhost:3000/health
# Expected: {"status":"ok"}

curl http://localhost:3000/ready
# Expected: {"status":"ready"}
```

### 2. Check API Endpoints

```bash
# List employees
curl http://localhost:3000/api/v1/people/employees \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1"

# Expected: Array with 3 employees
```

### 3. Check Frontend

Open browser: `http://localhost:5173/people/employees`

**Expected**: 
- Page loads without errors
- Employee list displays
- Employee count shows 3 (or more if you created additional)

### 4. Run Tests

```bash
cd backend
npm test
```

**Expected**: All tests pass

---

## Demo Scenarios

### Scenario 1: Show Employee List

**What to Show**:
- Navigate to `/people/employees`
- Show employee list with 3 demo employees
- Show employee details (click on employee)
- Show employee number, status, hire date

**Expected Data**:
- EMP001: John Michael Doe (ACTIVE)
- EMP002: Jane Smith (ACTIVE)
- EMP003: David Johnson (PROBATION)

### Scenario 2: Create New Employee

**What to Show**:
1. Click "Add Employee" or "Create Employee"
2. Fill in form:
   - First Name: "Demo"
   - Last Name: "User"
   - Employee Number: "EMP004"
   - Hire Date: Today's date
   - Status: ACTIVE
3. Submit form
4. Verify employee appears in list
5. Show employee count increased

**Expected Result**:
- Employee created successfully
- Employee appears in list
- Employee count increases from 3 to 4

### Scenario 3: Show Tenant Isolation

**What to Show**:
1. Create employee in Tenant 1 (via API or UI)
2. Try to access as Tenant 2 (via API)
3. Show that Tenant 2 cannot see Tenant 1's data

**API Example**:
```bash
# Create employee in Tenant 1
curl -X POST http://localhost:3000/api/v1/people/employees \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{"personId": 1, "empEmployeeNumber": "TENANT1_001", ...}'

# Try to access as Tenant 2 (should fail or return empty)
curl http://localhost:3000/api/v1/people/employees/<employee_id> \
  -H "X-Tenant-ID: 2" \
  -H "X-User-ID: 1"
```

### Scenario 4: Show Status History

**What to Show**:
1. Navigate to employee detail page
2. Show status history section
3. Update employee status (e.g., PLANNED → ACTIVE)
4. Show new status history entry created
5. Show status history timeline

**Expected Result**:
- Status updated successfully
- New history entry appears
- History shows status changes over time

### Scenario 5: Show Complete Employee Record

**What to Show**:
1. Navigate to employee detail page
2. Show all sections:
   - Basic Info (name, employee number, status)
   - Contracts (list of contracts)
   - Wellness Profile (consent, preferred channel)
   - Dependents (if any)
   - Status History (timeline of status changes)

**Expected Data**:
- Employee: EMP001 (John Michael Doe)
- Contract: PERMANENT, Active
- Wellness Profile: Consent = Yes, Channel = EMAIL

---

## Expected Data

### Demo Tenant

- **Tenant ID**: 1
- **Tenant Name**: "Demo Company"

### Demo Persons (5)

1. John Michael Doe (MALE, DOB: 1990-05-15)
2. Jane Smith (FEMALE, DOB: 1992-08-20)
3. David Johnson (MALE, DOB: 1988-03-10)
4. Sarah Williams (FEMALE, DOB: 1995-11-25)
5. Michael Brown (MALE, DOB: 1987-07-05)

### Demo Employees (3)

1. **EMP001**: John Michael Doe
   - Status: ACTIVE
   - Type: PERMANENT
   - Hire Date: 2023-01-15

2. **EMP002**: Jane Smith
   - Status: ACTIVE
   - Type: PERMANENT
   - Hire Date: 2023-03-01

3. **EMP003**: David Johnson
   - Status: PROBATION
   - Type: FIXED_TERM
   - Hire Date: 2023-06-10

### Demo Contracts (2)

1. Contract for EMP001 (PERMANENT, Active)
2. Contract for EMP002 (PERMANENT, Active)

### Demo Contacts (3)

1. john.doe@demo.com (EMAIL, Primary)
2. +254712345678 (MOBILE, Primary) - for John Doe
3. jane.smith@demo.com (EMAIL, Primary)

### Demo Wellness Profiles (2)

1. Profile for EMP001 (Consent: Yes, Channel: EMAIL)
2. Profile for EMP002 (Consent: Yes, Channel: SMS)

---

## Troubleshooting

### Issue: Employee Count Shows 0

**Possible Causes**:
1. Demo data not seeded
2. Wrong tenant ID in request
3. Database connection issue

**Solution**:
```bash
# 1. Verify demo data exists
npm run demo:verify

# 2. Check database directly
psql $DATABASE_URL -c "SELECT COUNT(*) FROM pid_employee WHERE emp_tenant_id = 1;"

# 3. Check API with correct tenant ID
curl http://localhost:3000/api/v1/people/employees \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1"
```

### Issue: Tests Pass But UI Shows No Data

**Possible Causes**:
1. Frontend not connected to backend
2. Wrong API URL in frontend config
3. CORS issues

**Solution**:
1. Check frontend `.env` file has correct `VITE_API_URL`
2. Check browser console for errors
3. Verify backend is running on port 3000
4. Check network tab in browser dev tools

### Issue: Demo Seed Fails

**Possible Causes**:
1. Database not running
2. Wrong DATABASE_URL
3. Tables don't exist (migrations not run)

**Solution**:
```bash
# 1. Check database connection
psql $DATABASE_URL -c "SELECT 1;"

# 2. Check tables exist
psql $DATABASE_URL -c "\dt pid_*"

# 3. Run migrations if needed
npm run db:migrate

# 4. Try seed again
npm run demo:seed
```

### Issue: Cannot Create Employee

**Possible Causes**:
1. Validation errors
2. Missing required fields
3. Duplicate employee number

**Solution**:
1. Check API response for error details
2. Verify all required fields are provided
3. Use unique employee number
4. Check browser console for frontend errors

---

## Quick Reference

### Essential Commands

```bash
# Seed demo data
npm run demo:seed

# Verify demo data
npm run demo:verify

# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Run tests
cd backend && npm test

# Check health
curl http://localhost:3000/health
```

### API Headers

All API requests require:
- `X-Tenant-ID: 1` (Demo tenant ID)
- `X-User-ID: 1` (User ID)

### Key URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api-docs`
- Health Check: `http://localhost:3000/health`

---

## Next Steps

- See [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) to understand the system
- See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for testing information
- Run `npm run demo:verify` before every demo

---

**Document History**
- v1.0 (2025-01-XX): Initial demo guide for People Core
