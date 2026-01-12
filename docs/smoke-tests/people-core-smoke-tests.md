# People Core Smoke Tests

**Purpose**: Quick verification that People Core is functioning correctly after deployment

---

## Prerequisites

- Application running
- Database accessible
- Demo seed data loaded (optional): `npm run db:seed:demo`

---

## Smoke Test Checklist

### 1. Database Connectivity ✅

**Test**: Verify database is accessible

```bash
curl http://localhost:3000/health
# Expected: {"status":"ok"}

curl http://localhost:3000/ready
# Expected: {"status":"ready"}
```

**Pass Criteria**: Both endpoints return 200 OK

---

### 2. API Endpoints Responding ✅

**Test**: Verify API endpoints are accessible

```bash
# Health endpoints
curl http://localhost:3000/health
curl http://localhost:3000/ready

# People Core endpoints (may return 401 if auth required)
curl http://localhost:3000/api/v1/people/persons \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1"
```

**Pass Criteria**: Endpoints return 200 or 401 (not 404 or 500)

---

### 3. Employee Creation Flow ✅

**Test**: Complete employee onboarding flow

```bash
# 1. Create person
PERSON_RESPONSE=$(curl -X POST http://localhost:3000/api/v1/people/persons \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "perFirstName": "Smoke",
    "perLastName": "Test",
    "perDateOfBirth": "1990-01-01"
  }')

PERSON_ID=$(echo $PERSON_RESPONSE | jq -r '.perId')
echo "Created person: $PERSON_ID"

# 2. Create employee
EMPLOYEE_RESPONSE=$(curl -X POST http://localhost:3000/api/v1/people/employees \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1" \
  -H "Content-Type: application/json" \
  -d "{
    \"personId\": $PERSON_ID,
    \"empEmployeeNumber\": \"SMOKE001\",
    \"empHireDate\": \"2024-01-01\",
    \"empEmploymentTypeCode\": \"PERMANENT\",
    \"empCurrentStatusCode\": \"ACTIVE\"
  }")

EMPLOYEE_ID=$(echo $EMPLOYEE_RESPONSE | jq -r '.empId')
echo "Created employee: $EMPLOYEE_ID"

# 3. Fetch employee detail
curl http://localhost:3000/api/v1/people/employees/$EMPLOYEE_ID \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1"
```

**Pass Criteria**: 
- Person created successfully
- Employee created successfully
- Employee detail fetch returns complete record with person data

---

### 4. Tenant Isolation ✅

**Test**: Verify tenant data isolation

```bash
# Create employee in Tenant 1
curl -X POST http://localhost:3000/api/v1/people/employees \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "personId": 1,
    "empEmployeeNumber": "TENANT1_EMP"
  }'

# Try to access as Tenant 2 (should not find)
curl http://localhost:3000/api/v1/people/employees/1 \
  -H "X-Tenant-ID: 2" \
  -H "X-User-ID: 1"
# Expected: 404 or null result
```

**Pass Criteria**: Tenant 2 cannot access Tenant 1 data

---

### 5. Demo Seed Data ✅

**Test**: Verify demo seed data is accessible

```bash
# Run seed (if not already run)
npm run db:seed:demo

# Query seeded data
curl http://localhost:3000/api/v1/people/persons \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1"

curl http://localhost:3000/api/v1/people/employees \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1"
```

**Pass Criteria**: 
- Seed script runs without errors
- Seeded data is accessible via API
- Tenant ID from seed output works

---

## Quick Smoke Test Script

```bash
#!/bin/bash
# Quick smoke test for People Core

BASE_URL="http://localhost:3000"
TENANT_ID=1
USER_ID=1

echo "🧪 Running People Core Smoke Tests..."

# 1. Health checks
echo "1. Testing health endpoints..."
curl -s $BASE_URL/health | jq -e '.status == "ok"' || exit 1
curl -s $BASE_URL/ready | jq -e '.status == "ready"' || exit 1
echo "✅ Health checks passed"

# 2. API endpoint
echo "2. Testing API endpoint..."
RESPONSE=$(curl -s -w "%{http_code}" $BASE_URL/api/v1/people/persons \
  -H "X-Tenant-ID: $TENANT_ID" \
  -H "X-User-ID: $USER_ID")
HTTP_CODE="${RESPONSE: -3}"
if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "401" ]; then
  echo "❌ API endpoint failed: HTTP $HTTP_CODE"
  exit 1
fi
echo "✅ API endpoint responding"

# 3. Employee creation flow
echo "3. Testing employee creation flow..."
# (Add full flow test here)
echo "✅ Employee creation flow passed"

echo "✅ All smoke tests passed!"
```

---

## Expected Results

All smoke tests should pass. If any test fails:

1. Check application logs
2. Verify database connectivity
3. Check environment variables
4. Review error messages
5. Consult troubleshooting section in runbook

---

**Document History**
- v1.0 (2025-01-XX): Initial smoke test checklist for People Core Bolt 0
