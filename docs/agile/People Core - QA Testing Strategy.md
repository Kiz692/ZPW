# People Core - QA Testing Strategy

**Document Version**: 1.0  
**Created**: 2025-12-25  
**Author**: QA Engineer  
**Purpose**: Comprehensive testing approach for People Core stability and reliability  
**Focus**: Database layer through API layer validation

---

## 1. Testing Philosophy

### 1.1 Stability-First Approach
The primary goal is to ensure **People Core is stable and reliable** before adding new features. This means:

- **Data Integrity First**: No corrupted data, no lost records
- **Multi-Tenancy Safety**: Zero cross-tenant data leakage
- **Audit Trail Completeness**: Every change tracked and traceable
- **Performance Baseline**: Establish performance benchmarks
- **Security Hardening**: No unauthorized data access

### 1.2 Testing Pyramid for People Core
```
E2E Tests (5%)     - Critical user journeys
Integration Tests (25%) - API + Database interactions
Unit Tests (70%)  - Business logic, data validation
```

---

## 2. Database Layer Testing

### 2.1 Schema Validation Tests

#### Table Structure Tests
```sql
-- Test: All PID_ tables exist with correct structure
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'pid_%'
AND table_name IN (
    'pid_person', 'pid_employee', 'pid_emp_contract', 
    'pid_person_contact', 'pid_person_identifier',
    'pid_dependent', 'pid_qualification', 'pid_employment_history',
    'pid_wellness_profile', 'pid_wellness_profile_tag'
);
```

#### Column Validation Tests
```sql
-- Test: All tables have audit columns
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name LIKE 'pid_%'
AND column_name LIKE '%_created_at'
AND column_name LIKE '%_updated_at';
```

#### Constraint Testing
```sql
-- Test: Foreign key constraints work
-- Try to insert employee with invalid person_id
-- Should fail with FK violation

-- Test: Unique constraints work
-- Try to insert duplicate employee number in same tenant
-- Should fail with unique constraint violation
```

### 2.2 Data Integrity Tests

#### Multi-Tenancy Tests
```sql
-- Test: Tenant isolation at database level
-- 1. Create data in Tenant A
-- 2. Query from Tenant A context - should see data
-- 3. Query from Tenant B context - should NOT see data
-- 4. Verify row-level security policies work
```

#### Audit Trail Tests
```sql
-- Test: Audit fields are populated
INSERT INTO pid_person (per_first_name, per_last_name) VALUES ('Test', 'User');
SELECT per_created_at, per_created_by FROM pid_person WHERE per_first_name = 'Test';
-- Should have non-null created_at and created_by
```

#### Soft Delete Tests
```sql
-- Test: Soft delete doesn't actually delete
UPDATE pid_person SET per_deleted_at = NOW() WHERE per_id = X;
SELECT * FROM pid_person WHERE per_id = X;
-- Should still return row with deleted_at populated
SELECT * FROM pid_person WHERE per_id = X AND per_deleted_at IS NULL;
-- Should NOT return row
```

---

## 3. Business Logic Testing

### 3.1 Person Management Tests

#### Person Creation Tests
```typescript
// Test: Complete person creation workflow
describe('Person Creation', () => {
  test('should create person with all required fields', async () => {
    const personData = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      genderCode: 'MALE',
      nationalityCode: 'KE'
    };
    
    const result = await personService.create(personData);
    
    expect(result.perId).toBeDefined();
    expect(result.perFirstName).toBe('John');
    expect(result.perCreatedAt).toBeDefined();
    expect(result.perCreatedBy).toBeDefined();
  });

  test('should enforce required field validation', async () => {
    const invalidData = { firstName: 'John' }; // missing lastName
    
    await expect(personService.create(invalidData))
      .rejects.toThrow('lastName is required');
  });
});
```

#### Person Search Tests
```typescript
// Test: Person search across tenants
describe('Person Search', () => {
  test('should find person by name across tenants', async () => {
    // Create person in Tenant A
    const personA = await createPersonInTenant('John Doe', tenantA);
    // Create person in Tenant B
    const personB = await createPersonInTenant('John Doe', tenantB);
    
    // Search should return both persons (global search)
    const results = await personService.searchByName('John Doe');
    expect(results).toHaveLength(2);
  });
});
```

### 3.2 Employee Management Tests

#### Employee Creation Tests
```typescript
describe('Employee Creation', () => {
  test('should create employee linked to existing person', async () => {
    const person = await createTestPerson();
    const employeeData = {
      personId: person.perId,
      tenantId: testTenantId,
      employeeNumber: 'EMP001',
      hireDate: '2024-01-01',
      employmentTypeCode: 'PERMANENT'
    };
    
    const employee = await employeeService.create(employeeData);
    
    expect(employee.empId).toBeDefined();
    expect(employee.empPersonId).toBe(person.perId);
    expect(employee.empTenantId).toBe(testTenantId);
  });

  test('should enforce unique employee number within tenant', async () => {
    const employeeData = { employeeNumber: 'EMP001', tenantId: testTenantId };
    await employeeService.create(employeeData);
    
    // Second employee with same number in same tenant should fail
    await expect(employeeService.create(employeeData))
      .rejects.toThrow('Employee number must be unique within tenant');
  });
});
```

#### Status History Tests
```typescript
describe('Employee Status History', () => {
  test('should track all status changes', async () => {
    const employee = await createTestEmployee();
    
    // Change status
    await employeeService.updateStatus(employee.empId, 'PROBATION', '2024-02-01');
    await employeeService.updateStatus(employee.empId, 'ACTIVE', '2024-03-01');
    
    const history = await employeeService.getStatusHistory(employee.empId);
    
    expect(history).toHaveLength(2);
    expect(history[0].eshStatusCode).toBe('PROBATION');
    expect(history[1].eshStatusCode).toBe('ACTIVE');
    expect(history[0].eshEffectiveDate).toBe('2024-02-01');
    expect(history[1].eshEffectiveDate).toBe('2024-03-01');
  });
});
```

---

## 4. API Layer Testing

### 4.1 Endpoint Testing

#### CRUD Operations Tests
```typescript
describe('People API', () => {
  test('POST /api/v1/people/persons - create person', async () => {
    const response = await request(app)
      .post('/api/v1/people/persons')
      .send({
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1985-05-15',
        genderCode: 'FEMALE'
      })
      .expect(201);
    
    expect(response.body.perId).toBeDefined();
    expect(response.body.perFirstName).toBe('Jane');
  });

  test('GET /api/v1/people/persons/:id - retrieve person', async () => {
    const person = await createTestPerson();
    
    const response = await request(app)
      .get(`/api/v1/people/persons/${person.perId}`)
      .expect(200);
    
    expect(response.body.perId).toBe(person.perId);
    expect(response.body.perFirstName).toBe(person.perFirstName);
  });

  test('PUT /api/v1/people/persons/:id - update person', async () => {
    const person = await createTestPerson();
    
    const response = await request(app)
      .put(`/api/v1/people/persons/${person.perId}`)
      .send({ firstName: 'Updated Name' })
      .expect(200);
    
    expect(response.body.perFirstName).toBe('Updated Name');
  });
});
```

#### Multi-Tenancy API Tests
```typescript
describe('Multi-Tenancy API Security', () => {
  test('should enforce tenant isolation', async () => {
    // Create employee in Tenant A
    const employeeA = await createEmployeeInTenant('EMP001', tenantA);
    // Create employee in Tenant B
    const employeeB = await createEmployeeInTenant('EMP001', tenantB);
    
    // Query as Tenant A user
    const responseA = await request(app)
      .get('/api/v1/people/employees')
      .set('X-Tenant-ID', tenantA)
      .expect(200);
    
    expect(responseA.data).toHaveLength(1);
    expect(responseA.data[0].empId).toBe(employeeA.empId);
    
    // Query as Tenant B user
    const responseB = await request(app)
      .get('/api/v1/people/employees')
      .set('X-Tenant-ID', tenantB)
      .expect(200);
    
    expect(responseB.data).toHaveLength(1);
    expect(responseB.data[0].empId).toBe(employeeB.empId);
  });
});
```

### 4.2 Integration Test Scenarios

#### Critical Flow Tests
```typescript
describe('Critical Business Flows', () => {
  test('Employee Onboarding Flow', async () => {
    // 1. Create person
    const person = await personService.create({
      firstName: 'New',
      lastName: 'Employee',
      dateOfBirth: '1990-01-01'
    });
    
    // 2. Create employee record
    const employee = await employeeService.create({
      personId: person.perId,
      tenantId: testTenantId,
      employeeNumber: 'NEW001',
      hireDate: '2024-01-01'
    });
    
    // 3. Create employment contract
    const contract = await contractService.create({
      employeeId: employee.empId,
      tenantId: testTenantId,
      contractType: 'PERMANENT',
      startDate: '2024-01-01'
    });
    
    // 4. Add contact information
    const contact = await contactService.create({
      personId: person.perId,
      contactType: 'EMAIL',
      contactValue: 'new.employee@company.com',
      isPrimary: true
    });
    
    // 5. Verify complete employee record
    const fullRecord = await employeeService.getFullEmployeeRecord(employee.empId);
    
    expect(fullRecord.person.perFirstName).toBe('New');
    expect(fullRecord.employee.empEmployeeNumber).toBe('NEW001');
    expect(fullRecord.contract.ctrContractType).toBe('PERMANENT');
    expect(fullRecord.contacts).toHaveLength(1);
    expect(fullRecord.contacts[0].pcoContactValue).toBe('new.employee@company.com');
  });
});
```

---

## 5. Performance Testing

### 5.1 Database Performance Tests

#### Query Performance Tests
```typescript
describe('Database Performance', () => {
  test('should handle large dataset queries efficiently', async () => {
    // Create 10,000 employees
    await createLargeDataset(10000);
    
    const startTime = Date.now();
    
    // Test common queries
    await employeeService.getByTenant(testTenantId);
    await personService.searchByName('John');
    await employeeService.getStatusHistory(employeeIds[0]);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // All queries should complete within 100ms
    expect(duration).toBeLessThan(100);
  });
});
```

#### Index Effectiveness Tests
```sql
-- Test: Query execution plans use correct indexes
EXPLAIN ANALYZE 
SELECT * FROM pid_employee 
WHERE emp_tenant_id = 1 
AND emp_current_status_code = 'ACTIVE';
-- Should use index on emp_tenant_id, emp_current_status_code
```

### 5.2 API Performance Tests

#### Load Testing
```typescript
describe('API Load Testing', () => {
  test('should handle concurrent requests', async () => {
    const concurrentRequests = 100;
    const requests = [];
    
    for (let i = 0; i < concurrentRequests; i++) {
      requests.push(
        request(app).get('/api/v1/people/persons')
      );
    }
    
    const results = await Promise.all(requests);
    
    // All requests should succeed
    results.forEach(response => {
      expect(response.status).toBe(200);
    });
    
    // Response times should be reasonable
    const responseTimes = results.map(r => r.responseTime);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
    expect(avgResponseTime).toBeLessThan(200);
  });
});
```

---

## 6. Security Testing

### 6.1 Data Access Tests

#### Tenant Isolation Security Tests
```typescript
describe('Security - Tenant Isolation', () => {
  test('should prevent cross-tenant data access', async () => {
    const tenantAUser = await createUser(tenantA);
    const tenantBUser = await createUser(tenantB);
    
    // Tenant A user trying to access Tenant B data
    const response = await request(app)
      .get(`/api/v1/people/employees/${tenantBEmployee.empId}`)
      .set('Authorization', `Bearer ${tenantAUser.token}`)
      .set('X-Tenant-ID', tenantA)
      .expect(403);
    
    expect(response.body.error).toContain('Access denied');
  });
});
```

#### SQL Injection Tests
```typescript
describe('Security - SQL Injection', () => {
  test('should prevent SQL injection attacks', async () => {
    const maliciousInput = "'; DROP TABLE pid_person; --";
    
    const response = await request(app)
      .get(`/api/v1/people/persons/search?name=${maliciousInput}`)
      .expect(400);
    
    // Table should still exist
    const tableExists = await checkTableExists('pid_person');
    expect(tableExists).toBe(true);
  });
});
```

---

## 7. Data Migration Testing

### 7.1 Migration Safety Tests

#### Rollback Tests
```sql
-- Test: Migration can be rolled back safely
BEGIN;
-- Run migration
-- Verify data integrity
ROLLBACK;
-- Verify original state is restored
```

#### Data Validation Tests
```typescript
describe('Data Migration', () => {
  test('should preserve data integrity during migration', async () => {
    // Create test data with current schema
    const originalData = await createTestData();
    
    // Run migration
    await runMigration('add_new_column');
    
    // Verify data is still valid
    const migratedData = await getTestData();
    expect(migratedData).toEqual(originalData);
    
    // Verify new column has correct default values
    expect(migratedData.every(row => row.newColumn !== null)).toBe(true);
  });
});
```

---

## 8. Test Data Management

### 8.1 Test Data Strategy

#### Test Data Factories
```typescript
// Person Factory
export class PersonFactory {
  static create(overrides = {}) {
    return {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      dateOfBirth: faker.date.past(),
      genderCode: faker.random.arrayElement(['MALE', 'FEMALE']),
      nationalityCode: 'KE',
      ...overrides
    };
  }
}

// Employee Factory
export class EmployeeFactory {
  static create(personId, tenantId, overrides = {}) {
    return {
      personId,
      tenantId,
      employeeNumber: `EMP${faker.random.number({ min: 1000, max: 9999 })}`,
      hireDate: faker.date.past(),
      employmentTypeCode: 'PERMANENT',
      currentStatusCode: 'ACTIVE',
      ...overrides
    };
  }
}
```

#### Test Database Setup
```typescript
// Test database configuration
export const testDbConfig = {
  host: process.env.TEST_DB_HOST,
  port: process.env.TEST_DB_PORT,
  database: process.env.TEST_DB_NAME,
  username: process.env.TEST_DB_USER,
  password: process.env.TEST_DB_PASSWORD
};

// Test database cleanup
beforeEach(async () => {
  await truncateAllTables();
});

afterEach(async () => {
  await truncateAllTables();
});
```

---

## 9. Test Automation & CI/CD

### 9.1 Automated Test Pipeline

#### Test Categories in CI
```yaml
# GitHub Actions workflow
name: People Core Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run unit tests
        run: npm run test:unit
  
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v2
      - name: Run integration tests
        run: npm run test:integration
  
  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run performance tests
        run: npm run test:performance
```

### 9.2 Test Reporting

#### Coverage Reports
```typescript
// Jest configuration for coverage
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

---

## 10. Test Execution Plan

### 10.1 Phase 1: Database Layer Validation (Week 1)
1. **Schema Validation**: All tables, columns, constraints exist
2. **Data Integrity**: Multi-tenancy, audit trails, soft deletes
3. **Performance**: Query optimization, indexing
4. **Migration Safety**: Rollback procedures, data preservation

### 10.2 Phase 2: Business Logic Testing (Week 2)
1. **Entity Management**: Person, employee, contract workflows
2. **Business Rules**: Status transitions, validation rules
3. **Integration Points**: Cross-domain relationships
4. **Error Handling**: Edge cases, failure scenarios

### 10.3 Phase 3: API Layer Testing (Week 3)
1. **Endpoint Validation**: CRUD operations, response formats
2. **Security**: Authentication, authorization, tenant isolation
3. **Performance**: Load testing, concurrent requests
4. **Documentation**: API contract validation

### 10.4 Phase 4: End-to-End Testing (Week 4)
1. **Critical Flows**: Employee onboarding, status changes
2. **User Scenarios**: Real-world usage patterns
3. **Cross-Module Integration**: Future module compatibility
4. **Production Readiness**: Deployment validation

---

## 11. Success Criteria

### 11.1 Stability Metrics
- **Zero critical bugs** in production
- **99.9% uptime** for database operations
- **< 100ms response time** for 95% of API calls
- **100% tenant isolation** (no cross-tenant data access)

### 11.2 Quality Metrics
- **90%+ test coverage** for business logic
- **100% critical flow coverage** in integration tests
- **Zero security vulnerabilities** in penetration tests
- **Complete audit trail** for all data changes

### 11.3 Readiness Indicators
- All tests pass consistently in CI/CD
- Performance benchmarks established and met
- Security audit passed
- Data migration procedures validated
- Documentation complete and accurate

---

## 12. Risk Mitigation

### 12.1 Testing Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Incomplete test coverage | High | Coverage requirements, code review |
| Test data inconsistency | Medium | Automated factories, cleanup procedures |
| Performance regressions | Medium | Baseline benchmarks, automated alerts |
| Security gaps | High | Regular security testing, penetration tests |

### 12.2 Quality Gates
- **No deployment** if any critical test fails
- **Performance regression** blocks deployment
- **Security vulnerability** blocks deployment
- **Coverage below threshold** blocks deployment

---

This comprehensive testing strategy ensures People Core is thoroughly validated from the database layer through the API layer, establishing a stable foundation for future development.
