# People Core Testing Plan

**Purpose**: Step-by-step plan to verify People Core is working correctly  
**Date**: 2025-01-XX  
**Status**: Ready for execution

---

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js 20+ installed
- ✅ PostgreSQL 16+ running (or Docker)
- ✅ Database credentials configured
- ✅ Environment variables set up

---

## Phase 1: Environment Setup & Verification

### Step 1.1: Verify Database Connection
```bash
cd backend

# Check if database is accessible
npm run db:migrate

# Or verify manually
psql $DATABASE_URL -c "SELECT 1"
```

**Expected**: Database connection successful, migrations applied

### Step 1.2: Verify All Tables Exist
```bash
# Run database verification script
npm run db:verify
# Or manually check
psql $DATABASE_URL -c "\dt pid_*"
```

**Expected**: All 11 PID_ tables exist:
- `pid_person`
- `pid_employee`
- `pid_emp_contract`
- `pid_person_contact`
- `pid_person_identifier`
- `pid_dependent`
- `pid_qualification`
- `pid_employment_history`
- `pid_emp_status_history`
- `pid_wellness_profile`
- `pid_wellness_profile_tag`

---

## Phase 2: Seed Demo Data

### Step 2.1: Run Demo Seed Script
```bash
cd backend
npm run db:seed:demo
```

**Expected Output**:
```
🌱 Starting demo seed...
✅ Created tenant: Demo Company (ID: 1)
✅ Created 5 persons
✅ Created 3 employees
✅ Created 2 contracts
✅ Created 3 contacts
✅ Created 2 wellness profiles
✅ Demo seed completed successfully!
💡 Use tenant ID 1 in X-Tenant-ID header for API requests
```

**Note the tenant ID** from the output (usually `1`)

### Step 2.2: Verify Seed Data in Database
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM pid_person;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM pid_employee WHERE emp_tenant_id = 1;"
```

**Expected**: 
- At least 5 persons
- At least 3 employees for tenant 1

---

## Phase 3: Start API Server

### Step 3.1: Start Development Server
```bash
cd backend
npm run dev
```

**Expected**: Server starts on port 3000 (or configured port)

### Step 3.2: Verify Health Endpoints
```bash
# In another terminal
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

**Expected**:
```json
{"status":"ok"}
{"status":"ready"}
```

---

## Phase 4: API Testing via Swagger UI

### Step 4.1: Open Swagger UI
Open browser: `http://localhost:3000/api-docs`

**Expected**: Swagger UI loads with all People Core endpoints listed

### Step 4.2: Test Person Endpoints

#### 4.2.1: List Persons
- Endpoint: `GET /api/v1/people/persons`
- Headers:
  - `X-Tenant-ID: 1`
  - `X-User-ID: 1`
- Click "Try it out" → "Execute"

**Expected**: Returns array of persons from seed data

#### 4.2.2: Create New Person
- Endpoint: `POST /api/v1/people/persons`
- Headers:
  - `X-Tenant-ID: 1`
  - `X-User-ID: 1`
- Body:
```json
{
  "perFirstName": "Test",
  "perLastName": "User",
  "perDateOfBirth": "1990-01-01",
  "perGenderCode": "MALE",
  "perNationalityCode": "KE"
}
```

**Expected**: Returns created person with `perId`

#### 4.2.3: Get Person by ID
- Use the `perId` from previous step
- Endpoint: `GET /api/v1/people/persons/{id}`
- Headers:
  - `X-Tenant-ID: 1`
  - `X-User-ID: 1`

**Expected**: Returns person details

---

## Phase 5: Critical Flow Testing

### Step 5.1: Employee Creation Flow

#### 5.1.1: Create Person
```bash
curl -X POST http://localhost:3000/api/v1/people/persons \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "perFirstName": "John",
    "perLastName": "Doe",
    "perDateOfBirth": "1990-05-15",
    "perGenderCode": "MALE",
    "perNationalityCode": "KE"
  }'
```

**Save the `perId` from response**

#### 5.1.2: Create Employee
```bash
curl -X POST http://localhost:3000/api/v1/people/employees \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "personId": <PER_ID_FROM_STEP_5.1.1>,
    "empEmployeeNumber": "EMP_TEST_001",
    "empHireDate": "2024-01-01",
    "empEmploymentTypeCode": "PERMANENT",
    "empCurrentStatusCode": "ACTIVE"
  }'
```

**Expected**: Employee created with `empId`

#### 5.1.3: Create Contract
```bash
curl -X POST http://localhost:3000/api/v1/people/contracts \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "ctrEmpId": <EMP_ID_FROM_STEP_5.1.2>,
    "ctrContractTypeCode": "PERMANENT",
    "ctrStartDate": "2024-01-01",
    "ctrStatusCode": "ACTIVE",
    "ctrStandardHoursPerWeek": 40,
    "ctrStandardDaysPerWeek": 5
  }'
```

**Expected**: Contract created successfully

#### 5.1.4: Verify Complete Employee Record
```bash
curl http://localhost:3000/api/v1/people/employees/<EMP_ID> \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1"
```

**Expected**: Complete employee record with person data

---

### Step 5.2: Tenant Isolation Test

#### 5.2.1: Create Employee in Tenant 1
```bash
# Use person from seed or create new
curl -X POST http://localhost:3000/api/v1/people/employees \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "personId": 1,
    "empEmployeeNumber": "TENANT1_EMP"
  }'
```

**Save the `empId`**

#### 5.2.2: Try to Access as Tenant 2
```bash
curl http://localhost:3000/api/v1/people/employees/<EMP_ID_FROM_5.2.1> \
  -H "X-Tenant-ID: 2" \
  -H "X-User-ID: 1"
```

**Expected**: 404 Not Found or empty result (tenant isolation working)

#### 5.2.3: Verify Tenant 1 Can Still Access
```bash
curl http://localhost:3000/api/v1/people/employees/<EMP_ID_FROM_5.2.1> \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1"
```

**Expected**: Employee data returned (tenant 1 can access)

---

### Step 5.3: Status History Flow

#### 5.3.1: Create Employee with Initial Status
```bash
curl -X POST http://localhost:3000/api/v1/people/employees \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "personId": 1,
    "empEmployeeNumber": "STATUS_TEST_001",
    "empCurrentStatusCode": "PLANNED"
  }'
```

**Save the `empId`**

#### 5.3.2: Update Employee Status
```bash
curl -X PATCH http://localhost:3000/api/v1/people/employees/<EMP_ID>/status \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "statusCode": "ACTIVE",
    "effectiveDate": "2024-02-01"
  }'
```

**Expected**: Status updated successfully

#### 5.3.3: Get Status History
```bash
curl http://localhost:3000/api/v1/people/employees/<EMP_ID>/status-history \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1"
```

**Expected**: Array with at least 2 status history entries (PLANNED → ACTIVE)

---

## Phase 6: Additional Entity Testing

### Step 6.1: Test Person Contact
```bash
# Create contact for a person
curl -X POST http://localhost:3000/api/v1/people/person-contacts \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "pcoPerId": 1,
    "pcoContactTypeCode": "EMAIL",
    "pcoContactValue": "test@example.com",
    "pcoIsPrimary": true
  }'
```

### Step 6.2: Test Wellness Profile
```bash
# Create wellness profile for an employee
curl -X POST http://localhost:3000/api/v1/people/wellness-profiles \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "wepEmpId": 1,
    "wepConsentFlag": true,
    "wepPreferredChannelCode": "EMAIL"
  }'
```

### Step 6.3: Test Other Entities
Repeat similar tests for:
- Person Identifier
- Dependent
- Qualification
- Employment History

---

## Phase 7: Automated Test Execution

### Step 7.1: Run Unit Tests
```bash
cd backend
npm run test:unit
```

**Expected**: All unit tests pass

### Step 7.2: Run Integration Tests
```bash
npm run test:integration
```

**Expected**: 
- ✅ Employee creation flow passes
- ✅ Tenant isolation flow passes
- ✅ Status history flow passes

### Step 7.3: Run All Tests
```bash
npm test
```

**Expected**: All tests pass

---

## Phase 8: Error Handling Verification

### Step 8.1: Test Validation Errors
```bash
# Try to create person with missing required fields
curl -X POST http://localhost:3000/api/v1/people/persons \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "perFirstName": "Test"
  }'
```

**Expected**: 400 Bad Request with validation error message

### Step 8.2: Test Not Found Errors
```bash
# Try to get non-existent person
curl http://localhost:3000/api/v1/people/persons/99999 \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1"
```

**Expected**: 404 Not Found

### Step 8.3: Test Tenant Isolation Errors
```bash
# Try to access without tenant ID
curl http://localhost:3000/api/v1/people/persons \
  -H "X-User-ID: 1"
```

**Expected**: 401 Unauthorized (if SKIP_AUTH is false)

---

## Phase 9: Smoke Test Checklist

Execute the smoke test checklist from `docs/smoke-tests/people-core-smoke-tests.md`:

- [ ] Database connectivity ✅
- [ ] API endpoints responding ✅
- [ ] Employee creation flow ✅
- [ ] Tenant isolation ✅
- [ ] Demo seed data accessible ✅

---

## Phase 10: Performance & Monitoring

### Step 10.1: Check Application Logs
Review logs for:
- ✅ No errors
- ✅ Audit events being logged
- ✅ Request/response logging

### Step 10.2: Verify Audit Fields
```bash
# Check that audit fields are populated
psql $DATABASE_URL -c "SELECT per_id, per_created_at, per_created_by FROM pid_person LIMIT 1;"
```

**Expected**: `per_created_at` and `per_created_by` are populated

---

## Troubleshooting

### Issue: Database connection fails
**Solution**: 
- Check `DATABASE_URL` environment variable
- Verify PostgreSQL is running
- Check network connectivity

### Issue: Migrations fail
**Solution**:
- Check if tables already exist
- Review migration file for syntax errors
- Check database user permissions

### Issue: API returns 401 Unauthorized
**Solution**:
- Verify `X-Tenant-ID` and `X-User-ID` headers are set
- Check `SKIP_AUTH` environment variable (should be `true` in development)
- Review auth middleware logs

### Issue: Tests fail
**Solution**:
- Ensure test database is set up
- Check `DATABASE_URL` for test environment
- Review test logs for specific errors

---

## Success Criteria

✅ All health endpoints return 200  
✅ Demo seed data loads successfully  
✅ All 3 critical flows work end-to-end  
✅ Tenant isolation enforced  
✅ Status history recorded automatically  
✅ All API endpoints accessible via Swagger  
✅ Unit tests pass  
✅ Integration tests pass  
✅ Error handling works correctly  
✅ Audit fields populated  

---

## Next Steps After Testing

Once testing is complete:
1. Review any issues found
2. Update documentation if needed
3. Prepare for demo presentation
4. Plan next bolt (ORG module, etc.)

---

**Document History**
- v1.0 (2025-01-XX): Initial testing plan for People Core Bolt 0
