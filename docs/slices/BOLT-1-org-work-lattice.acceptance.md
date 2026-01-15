# Bolt 1: ORG Work Lattice — Acceptance Criteria

**AI-DLC Bolt**: 1 (ORG slice connecting to People Core)

---

## 1) Acceptance scope (Bolt 1 only)

This bolt is accepted when it delivers a **working ORG module foundation** that connects to People Core. Acceptance is intentionally limited to:

- Org units tree (hierarchical structure)
- Positions within org units
- Employee-to-position assignments (primary)
- Basic reporting relationships (who reports to who)
- Integration with People Core
- Tenant isolation

---

## 2) Critical flow (must be automated)

**Flow: Create org unit → Create position → Assign employee → Fetch employee detail shows assignment**

- Create an org unit in a tenant (e.g., "Engineering Department")
- Create a position within that org unit (e.g., "Senior Software Engineer")
- Assign an existing employee to that position
- Fetch employee detail and validate the position assignment is returned
- Verify tenant isolation: Tenant B cannot see Tenant A's org structure

---

## 3) Org Units acceptance

**AC-ORG-001: Org Unit Creation**
- **Given**: a tenant context
- **When**: POST `/api/v1/org/org-units` is called with valid data
- **Then**: org unit is created with unique code per tenant, parent relationship (if provided), and audit fields populated
- **And**: tenant isolation is enforced (org unit belongs to request tenant)

**AC-ORG-002: Org Unit Hierarchy**
- **Given**: an existing org unit (parent)
- **When**: a child org unit is created with parent reference
- **Then**: parent-child relationship is established and queryable
- **And**: org unit tree can be traversed (parent → children)

**AC-ORG-003: Org Unit Listing**
- **Given**: multiple org units in a tenant
- **When**: GET `/api/v1/org/org-units` is called
- **Then**: only tenant's org units are returned, optionally filtered by parent or type

**AC-ORG-004: Tenant Isolation for Org Units**
- **Given**: org units in Tenant A and Tenant B
- **When**: Tenant A requests org units
- **Then**: only Tenant A's org units are returned

---

## 4) Positions acceptance

**AC-POS-001: Position Creation**
- **Given**: an existing org unit and job role reference
- **When**: POST `/api/v1/org/positions` is called with valid data
- **Then**: position is created within the org unit, linked to job role, with audit fields populated
- **And**: tenant isolation is enforced

**AC-POS-002: Position in Org Unit**
- **Given**: an org unit with positions
- **When**: positions are queried for that org unit
- **Then**: all positions within that org unit are returned
- **And**: positions can be filtered by org unit

**AC-POS-003: Reporting Relationships**
- **Given**: positions with reporting relationships
- **When**: a position's reporting structure is queried
- **Then**: primary reports-to relationship is accessible
- **And**: "who reports to who" can be determined

**AC-POS-004: Tenant Isolation for Positions**
- **Given**: positions in Tenant A and Tenant B
- **When**: Tenant A requests positions
- **Then**: only Tenant A's positions are returned

---

## 5) Position Assignments acceptance

**AC-ASG-001: Employee Assignment to Position**
- **Given**: an existing employee (PID_EMPLOYEE) and position (ORG_POSITION) in same tenant
- **When**: POST `/api/v1/org/assignments` is called
- **Then**: assignment is created linking employee to position
- **And**: assignment type is "PRIMARY"
- **And**: start date is captured, end date is nullable (for active assignments)
- **And**: current flag (PAS_IS_CURRENT) is set appropriately

**AC-ASG-002: Employee Assignment Validation**
- **Given**: an assignment attempt
- **When**: employee or position does not exist, or they belong to different tenants
- **Then**: assignment is rejected with clear error message

**AC-ASG-003: Employee Assignments Query**
- **Given**: an employee with position assignments
- **When**: GET `/api/v1/org/employee-assignments?employeeId=X` is called
- **Then**: all assignments for that employee are returned
- **And**: current assignment is clearly identified

**AC-ASG-004: Employee Detail Integration**
- **Given**: an employee with a position assignment
- **When**: employee detail is fetched from People Core API
- **Then**: current position assignment is included in the response
- **And**: position details (title, org unit) are included

**AC-ASG-005: Tenant Isolation for Assignments**
- **Given**: assignments in Tenant A and Tenant B
- **When**: Tenant A requests assignments
- **Then**: only Tenant A's assignments are returned
- **And**: cross-tenant employee/position references are prevented

---

## 6) Integration with People Core acceptance

**AC-INT-001: Cross-Domain Employee Reference**
- **Given**: ORG_POSITION_ASSIGNMENT entity
- **When**: assignment references PID_EMPLOYEE
- **Then**: foreign key relationship is properly established
- **And**: employee validation occurs before assignment creation

**AC-INT-002: Employee Detail Enhancement**
- **Given**: employee detail endpoint in People Core
- **When**: employee has position assignment
- **Then**: position assignment data is included in employee detail response
- **And**: position and org unit details are included (via join or separate query)

**AC-INT-003: Tenant Consistency**
- **Given**: employee and position in different tenants
- **When**: assignment is attempted
- **Then**: assignment is rejected with tenant mismatch error

---

## 7) Database schema acceptance

**AC-DB-001: Schema Compliance**
- **Given**: database schema implementation
- **When**: tables are reviewed
- **Then**: all follow ORG_ prefix convention and P9 naming standards
- **And**: schema matches P14 SQL definitions

**AC-DB-002: Required Tables**
- **Given**: database implementation
- **When**: schema is verified
- **Then**: ORG_UNIT, ORG_POSITION, ORG_POSITION_ASSIGNMENT tables exist
- **And**: all required columns, constraints, and indexes are present

**AC-DB-003: Foreign Key Relationships**
- **Given**: database operations
- **When**: foreign key constraints are tested
- **Then**: ORG_UNIT parent-child relationship works
- **And**: ORG_POSITION → ORG_UNIT relationship works
- **And**: ORG_POSITION_ASSIGNMENT → PID_EMPLOYEE relationship works
- **And**: ORG_POSITION_ASSIGNMENT → ORG_POSITION relationship works

**AC-DB-004: Tenant Isolation at DB Level**
- **Given**: database queries
- **When**: tenant-scoped queries are executed
- **Then**: all ORG tables filter by tenant ID
- **And**: cross-tenant data access is prevented by constraints

**AC-DB-005: Audit Fields**
- **Given**: any ORG entity creation or update
- **When**: audit fields are checked
- **Then**: created_at, created_by, updated_at, updated_by are populated
- **And**: audit trail is complete

---

## 8) API acceptance

**AC-API-001: REST Endpoints Exist**
- **Given**: ORG module implementation
- **When**: API routes are registered
- **Then**: all required endpoints are available:
  - GET/POST `/api/v1/org/org-units`
  - GET/POST `/api/v1/org/positions`
  - POST `/api/v1/org/assignments`
  - GET `/api/v1/org/employee-assignments`

**AC-API-002: OpenAPI Documentation**
- **Given**: ORG API endpoints
- **When**: API documentation is generated
- **Then**: all endpoints are documented with schemas, examples, and error responses

**AC-API-003: Request Validation**
- **Given**: API requests
- **When**: invalid data is submitted
- **Then**: requests are rejected with clear validation errors
- **And**: Zod schemas validate all inputs

**AC-API-004: Response Format**
- **Given**: API responses
- **When**: endpoints return data
- **Then**: responses follow consistent JSON format
- **And**: proper HTTP status codes are used

---

## 9) Integration test acceptance

**AC-TEST-001: Critical Flow Test**
- **Given**: integration test harness
- **When**: critical flow test runs (create unit → position → assignment → fetch employee)
- **Then**: test passes consistently
- **And**: all steps complete successfully

**AC-TEST-002: Tenant Isolation Test**
- **Given**: multi-tenant test data
- **When**: tenant isolation test runs
- **Then**: no cross-tenant data leakage detected
- **And**: tenant boundaries are enforced

**AC-TEST-003: Test Stability**
- **Given**: integration tests
- **When**: tests run multiple times
- **Then**: tests are not flaky and pass consistently

---

## 10) Definition of done

Bolt 1 is done when:

- All acceptance criteria above are met and verified
- Integration test passes (critical flow + tenant isolation)
- Database schema matches P14 SQL
- API endpoints are documented in OpenAPI
- Code review completed
- Tenant isolation verified
- Employee detail integration working

---

**Document History**
- v1.0 (2025-01-XX): Initial draft - Team collaboration session
