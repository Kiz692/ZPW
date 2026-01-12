# People Core Testing Guide

**Document Version**: 1.0  
**Created**: 2025-01-XX  
**Purpose**: Guide for running tests and interpreting results

---

## Table of Contents

1. [Test Types](#test-types)
2. [Running Tests](#running-tests)
3. [Interpreting Results](#interpreting-results)
4. [Troubleshooting](#troubleshooting)
5. [Test Structure](#test-structure)

---

## Test Types

### 1. Unit Tests

**Location**: `backend/src/tests/unit/`

**Purpose**: Test individual functions and classes in isolation

**What They Test**:
- Business logic in services
- Data access in repositories
- Validation rules
- Data transformations

**Example**: `employee.service.test.ts`
- Tests employee creation
- Tests status updates
- Tests validation rules
- Verifies database state after operations

**Run**: `npm run test:unit`

### 2. Integration Tests

**Location**: `backend/src/tests/integration/`

**Purpose**: Test API endpoints and database interactions together

**What They Test**:
- API endpoints work correctly
- Database operations persist data
- Tenant isolation works
- Critical business flows

**Example**: `critical-flows.test.ts`
- Employee creation flow (person → employee → contract)
- Tenant isolation flow
- Status history flow

**Run**: `npm run test:integration`

### 3. E2E Tests (End-to-End)

**Location**: `backend/src/tests/e2e/`

**Purpose**: Test full stack (Frontend + Backend + Database)

**What They Test**:
- UI displays data correctly
- User interactions work
- API integration from frontend
- Complete user journeys

**Example**: `people-core.spec.ts`
- Employee count displays correctly
- Demo data visible in UI
- Create employee flow in UI

**Run**: `npm run test:e2e`

---

## Running Tests

### Prerequisites

1. **Database**: PostgreSQL must be running
2. **Environment**: Set `DATABASE_URL` environment variable
3. **Dependencies**: Run `npm install` in backend directory

### Quick Start

```bash
cd backend

# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests (requires frontend running)
npm run test:e2e

# Run with coverage
npm run test:coverage
```

### Running Specific Tests

```bash
# Run a specific test file
npm test -- employee.service.test.ts

# Run tests matching a pattern
npm test -- --grep "employee creation"

# Run in watch mode (auto-rerun on changes)
npm run test:watch
```

### Environment Variables

Tests use these environment variables:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/zpw_db
NODE_ENV=test
SKIP_AUTH=true
```

Set these in `.env` file or export before running tests.

---

## Interpreting Results

### Test Output

#### Passing Test
```
✓ should create employee with person ID (123ms)
  ✓ EmployeeService > create > should create employee with person ID
```

#### Failing Test
```
✗ should create employee with person ID (45ms)
  AssertionError: expected 0 to be 1
    at EmployeeService.create (employee.service.test.ts:42)
```

### Common Test Patterns

#### 1. Database State Verification

Tests now verify actual database state:

```typescript
// Before: Only checked return value
expect(employee.empId).toBeDefined();

// Now: Also checks database
const exists = await verifyEmployeeExists(employee.empId, tenantId);
expect(exists).toBe(true);
const count = await getEmployeeCount(tenantId);
expect(count).toBe(initialCount + 1);
```

#### 2. Count Assertions

Tests verify counts match expectations:

```typescript
const initialCount = await getEmployeeCount(tenantId);
// ... create employee ...
const finalCount = await getEmployeeCount(tenantId);
expect(finalCount).toBe(initialCount + 1);
```

#### 3. Tenant Isolation Verification

Tests verify tenant isolation:

```typescript
const isolation = await verifyTenantIsolation(
  employeeId, 
  correctTenantId, 
  wrongTenantId
);
expect(isolation.existsInCorrectTenant).toBe(true);
expect(isolation.existsInWrongTenant).toBe(false);
```

### Test Results Summary

After running tests, you'll see:

```
Test Files  1 passed (1)
     Tests  5 passed (5)
      Time  2.34s
```

- **Test Files**: Number of test files executed
- **Tests**: Number of individual test cases
- **Time**: Total execution time

---

## Troubleshooting

### Common Issues

#### 1. Tests Pass But Data Not Visible

**Problem**: Tests pass but employee count shows 0 in UI

**Cause**: Test cleanup may have removed demo data

**Solution**: 
- Tests now preserve demo seed data (EMP001, EMP002, EMP003)
- Run `npm run demo:verify` to check demo data exists
- Run `npm run demo:seed` to recreate demo data if needed

#### 2. Database Connection Errors

**Problem**: `Error: connect ECONNREFUSED`

**Cause**: PostgreSQL not running or wrong DATABASE_URL

**Solution**:
```bash
# Check PostgreSQL is running
docker ps  # if using Docker
# or
pg_isready

# Verify DATABASE_URL
echo $DATABASE_URL
```

#### 3. Flaky Tests

**Problem**: Tests pass sometimes, fail other times

**Cause**: 
- Race conditions
- Database state conflicts
- Timeout issues

**Solution**:
- Tests now run sequentially (single thread)
- Increased timeouts (30 seconds)
- Retry logic enabled (2 retries)
- Better test isolation

#### 4. Tenant Isolation Test Failures

**Problem**: Tenant isolation tests fail

**Cause**: Tenant ID not properly filtered

**Solution**:
- Verify `X-Tenant-ID` header is set in tests
- Check repository queries include tenant filter
- Verify database has correct tenant IDs

### Debugging Tests

#### Enable Verbose Output

```bash
npm test -- --reporter=verbose
```

#### Run Single Test with Debug

```bash
# Add debugger statement in test
debugger;

# Run with Node inspector
node --inspect-brk node_modules/.bin/vitest run
```

#### Check Database State

```bash
# Connect to database
psql $DATABASE_URL

# Check employee count
SELECT COUNT(*) FROM pid_employee WHERE emp_tenant_id = 1;

# Check demo employees
SELECT emp_employee_number FROM pid_employee 
WHERE emp_employee_number IN ('EMP001', 'EMP002', 'EMP003');
```

---

## Test Structure

### Test File Organization

```
backend/src/tests/
├── unit/                    # Unit tests
│   ├── repositories/        # Repository tests
│   └── services/           # Service tests
├── integration/            # Integration tests
│   ├── critical-flows.test.ts
│   └── db-constraints.test.ts
├── e2e/                    # E2E tests
│   ├── people-core.spec.ts
│   └── helpers/
├── helpers/                # Test utilities
│   ├── test-db.ts          # Database setup/cleanup
│   ├── test-factories.ts   # Test data factories
│   ├── test-helpers.ts     # Common helpers
│   └── verify-data.ts      # Data verification helpers
```

### Test Helpers

#### `test-db.ts`
- `setupTestDb()` - Setup test database
- `cleanupTestDb()` - Clean test data (preserves demo data)
- `ensureTestTenant()` - Create test tenant if needed

#### `test-factories.ts`
- `TestFactories.createPerson()` - Create test person data
- `TestFactories.createEmployee()` - Create test employee data
- Other entity factories

#### `verify-data.ts`
- `getEmployeeCount()` - Get employee count from database
- `verifyEmployeeExists()` - Verify employee exists
- `verifyTenantIsolation()` - Verify tenant isolation

### Writing New Tests

#### Unit Test Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { EmployeeService } from '../../../modules/people/services/employee.service.js';
import { setupTestDb, cleanupTestDb } from '../../helpers/test-db.js';
import { verifyEmployeeExists, getEmployeeCount } from '../../helpers/verify-data.js';

describe('EmployeeService', () => {
  let service: EmployeeService;
  const tenantId = 1;

  beforeEach(async () => {
    await setupTestDb();
    await cleanupTestDb();
    service = new EmployeeService();
  });

  it('should create employee', async () => {
    const initialCount = await getEmployeeCount(tenantId);
    
    const employee = await service.create(
      { empEmployeeNumber: 'TEST001', ... },
      tenantId,
      1
    );

    expect(employee.empId).toBeDefined();
    
    // Verify in database
    const exists = await verifyEmployeeExists(employee.empId, tenantId);
    expect(exists).toBe(true);
    
    const finalCount = await getEmployeeCount(tenantId);
    expect(finalCount).toBe(initialCount + 1);
  });
});
```

---

## Best Practices

1. **Always Verify Database State**: Don't just check return values, verify data in database
2. **Use Test Helpers**: Use `verify-data.ts` helpers for consistency
3. **Preserve Demo Data**: Tests should not delete demo seed data
4. **Isolate Tests**: Each test should be independent
5. **Clean Up**: Use `cleanupTestDb()` in `afterEach` to clean test data
6. **Use Factories**: Use `TestFactories` for consistent test data

---

## Next Steps

- See [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) to understand the system
- See [DEMO_GUIDE.md](./DEMO_GUIDE.md) for demo preparation
- Run `npm run demo:verify` to check demo data

---

**Document History**
- v1.0 (2025-01-XX): Initial testing guide for People Core
