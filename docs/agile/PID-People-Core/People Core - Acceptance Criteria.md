# Bolt 0: People Core Hardening + CI Baseline - Acceptance Criteria

**Document Version**: 1.0  
**Created**: 2025-12-25  
**Authors**: Product Manager, Lead Developer, QA Engineer, DevOps Engineer  
**Status**: Draft  
**AI-DLC Bolt**: 0 (Retrofit/Hardening)  

---

## 1. AI-DLC Context

### 1.1 Bolt 0 Acceptance Focus
This document defines acceptance criteria for **Bolt 0** - the "People Core hardening + CI baseline" retrofit. The focus is on establishing a reliable delivery system rather than building new features.

### 1.2 AI-DLC Success Definition
Bolt 0 succeeds when the team has a **predictable delivery system** with:
- Reliable CI pipeline
- Automated integration test harness
- Safe deployment practices
- Consistent development environment
- Complete documentation

### 1.3 Critical Flow Definition
The 2–3 critical flows that must be automated:
1. **Employee Creation Flow**: Create employee → fetch detail with related tables
2. **Tenant Isolation Flow**: Verify tenant data isolation
3. **Auth Safety Flow**: Ensure SKIP_AUTH cannot be deployed accidentally

---

## 2. Bolt 0 CI/CD Acceptance Criteria

### 2.1 CI Pipeline Implementation

**AC-CI-001: Complete CI Pipeline**
- **Given**: Code repository with People Core module
- **When**: Developer pushes code or creates pull request
- **Then**: CI pipeline executes all stages: lint → typecheck → unit tests → migration check
- **Pass Criteria**: All stages pass consistently with proper error reporting
- **Test Approach**: Pipeline execution test + failure scenario validation

**AC-CI-002: Automated Test Execution**
- **Given**: CI pipeline running
- **When**: Tests are executed
- **Then**: Unit tests achieve 90%+ coverage, all critical paths tested
- **Pass Criteria**: Test coverage report generated, coverage targets met
- **Test Approach**: Coverage analysis + test quality review

**AC-CI-003: Migration Safety Check**
- **Given**: Database schema changes
- **When**: Migration scripts are run in CI
- **Then**: Migrations are validated for safety and reversibility
- **Pass Criteria**: Migration dry-run passes, rollback scripts validated
- **Test Approach**: Migration testing + rollback verification

### 2.2 Integration Test Harness

**AC-ITH-001: Critical Flow Automation**
- **Given**: Integration test harness setup
- **When**: Critical flows are executed
- **Then**: Employee creation → fetch detail flow works end-to-end
- **Pass Criteria**: Automated test passes with realistic data
- **Test Approach**: Integration test execution + data validation

**AC-ITH-002: Tenant Isolation Verification**
- **Given**: Multi-tenant environment
- **When**: Tenant isolation test runs
- **Then**: No cross-tenant data leakage detected
- **Pass Criteria**: Tenant boundaries enforced at all levels
- **Test Approach**: Multi-tenant security test + data leak verification

**AC-ITH-003: Test Environment Consistency**
- **Given**: Development and test environments
- **When**: Tests run in different environments
- **Then**: Results are consistent across environments
- **Pass Criteria**: Environment parity achieved
- **Test Approach**: Cross-environment test validation

### 2.3 Auth Safety Implementation

**AC-AUTH-001: SKIP_AUTH Guard Implementation**
- **Given**: Application configuration
- **When**: SKIP_AUTH=true is attempted in production
- **Then**: Build or deployment fails with clear error message
- **Pass Criteria**: Production deployment impossible with SKIP_AUTH enabled
- **Test Approach**: Build guard test + deployment failure simulation

**AC-AUTH-002: Environment-Based Auth Control**
- **Given**: Different deployment environments
- **When**: Auth settings are configured
- **Then**: Auth is enforced in production, optional in development
- **Pass Criteria**: Environment-specific auth behavior working
- **Test Approach**: Environment configuration test + auth behavior verification

## 3. Demo Seed Data Acceptance Criteria

### 3.1 Seed Data Implementation

**AC-SEED-001: Complete Demo Environment**
- **Given**: Fresh database instance
- **When**: `db:seed:demo` command is executed
- **Then**: Complete tenant with sample org and people is created
- **Pass Criteria**: Demo environment ready for development and testing
- **Test Approach**: Seed execution test + data validation

**AC-SEED-002: Realistic Test Data**
- **Given**: Demo seed data
- **When**: Data is inspected
- **Then**: Realistic employee records, relationships, and business scenarios
- **Pass Criteria**: Test data covers all critical flows and edge cases
- **Test Approach**: Data quality review + scenario coverage analysis

**AC-SEED-003: Seed Data Consistency**
- **Given**: Multiple developers running seed
- **When**: Each developer executes `db:seed:demo`
-Then**: Identical data structure and content across environments
- **Pass Criteria**: Reproducible demo environment
- **Test Approach**: Cross-developer seed consistency test

## 4. Documentation Acceptance Criteria

### 4.1 Release Checklist

**AC-DOC-001: Complete Release Checklist**
- **Given**: Release process documentation
- **When**: Release is being prepared
- **Then**: All checklist items are relevant and actionable
- **Pass Criteria**: Release checklist covers all necessary steps and safety checks
- **Test Approach**: Checklist walkthrough + release simulation

**AC-DOC-002: Runbook Updates**
- **Given**: Operations documentation
- **When**: System changes are deployed
- **Then**: Runbooks reflect current system state and procedures
- **Pass Criteria**: Documentation matches deployed system
- **Test Approach**: Runbook validation + operational procedure testing

### 4.2 API Documentation

**AC-API-001: OpenAPI Specification**
- **Given**: People Core API endpoints
- **When**: API documentation is generated
- **Then**: All endpoints documented with schemas and examples
- **Pass Criteria**: Complete, accurate API documentation
- **Test Approach**: Documentation review + automated schema validation

## 5. Core Entity Stability Acceptance Criteria

### 5.1 Person Management (PID_PERSON)

**AC-PER-001: Global Person Identity Creation**
- **Given**: A new person needs to be created in the system
- **When**: HR Administrator enters person details (first name, last name, date of birth, gender, nationality)
- **Then**: 
  - Person record is created with unique PER_ID
  - Display name is auto-generated from first + last name
  - Audit fields (created_at, created_by) are populated
  - Person appears in global search across tenants
- **Pass Criteria**: Person record persists, is searchable, and has valid audit trail
- **Test Approach**: Unit test + API integration test + UI validation

**AC-PER-002: Person Data Validation**
- **Given**: Person data entry form
- **When**: Invalid data is submitted (missing required fields, invalid dates)
- **Then**: System rejects submission with specific error messages
- **Pass Criteria**: All validation rules enforced with user-friendly error messages
- **Test Approach**: Form validation test suite

**AC-PER-003: Multi-Tenant Person Sharing**
- **Given**: A person exists in Tenant A
- **When**: Same person is hired by Tenant B
- **Then**: New employee record references existing person (no duplicate person created)
- **Pass Criteria**: One person record, multiple employee records across tenants
- **Test Approach**: Multi-tenant integration test

### 5.2 Employee Management (PID_EMPLOYEE)

**AC-EMP-001: Employee Record Creation**
- **Given**: An existing person and active tenant
- **When**: HR Administrator creates employee record
- **Then**:
  - Employee record created with unique EMP_ID and tenant-scoped
  - Employee number is unique within tenant
  - Hire date and employment type are captured
  - Initial status set to "PLANNED" or "ACTIVE"
- **Pass Criteria**: Employee record properly scoped with all required fields
- **Test Approach**: API test + database constraint validation

**AC-EMP-002: Employee Status Transitions**
- **Given**: An active employee
- **When**: Status change is initiated (probation → active, active → suspended)
- **Then**:
  - Status history record created with effective date
  - Previous status recorded in history
  - Reason code captured if required
  - Current employee status updated
- **Pass Criteria**: Complete audit trail of all status changes
- **Test Approach**: State machine test + audit log verification

**AC-EMP-003: Tenant Data Isolation**
- **Given**: Employees in multiple tenants
- **When**: Tenant A user queries employee data
- **Then**: Only Tenant A employees are returned
- **Pass Criteria**: No cross-tenant data leakage
- **Test Approach**: Security penetration test + data isolation verification

### 5.3 Employment Contracts (PID_EMP_CONTRACT)

**AC-CTR-001: Contract Creation and Management**
- **Given**: An active employee
- **When**: HR Administrator creates employment contract
- **Then**:
  - Contract record created with start/end dates
  - Contract type and working hours captured
  - Primary position assignment linked (if available)
  - Contract status set to "DRAFT" or "ACTIVE"
- **Pass Criteria**: Contract with all required fields and proper relationships
- **Test Approach**: CRUD operations test + relationship validation

**AC-CTR-002: Contract Overlap Prevention**
- **Given**: An employee with active contract
- **When**: New contract with overlapping dates is attempted
- **Then**: System prevents overlap with clear error message
- **Pass Criteria**: Business rule enforced at database and application level
- **Test Approach**: Business rule test + constraint validation

### 5.4 Person Contacts (PID_PERSON_CONTACT)

**AC-PCO-001: Multiple Contact Management**
- **Given**: A person record
- **When**: Multiple contacts are added (email, phone, address)
- **Then**:
  - Each contact has unique type within person
  - Primary flag can be set per contact type
  - Contact validation rules applied (email format, phone format)
- **Pass Criteria**: Proper contact management with validation
- **Test Approach**: Contact management test suite

**AC-PCO-002: Primary Contact Enforcement**
- **Given**: Multiple contacts of same type for a person
- **When**: Setting primary contact
- **Then**: Only one contact can be primary per type per person
- **Pass Criteria**: Primary constraint properly enforced
- **Test Approach**: Constraint validation test

### 5.5 Wellness Profile (PID_WELLNESS_PROFILE)

**AC-WEP-001: Wellness Consent Management**
- **Given**: An employee record
- **When**: Wellness consent is updated
- **Then**:
  - Consent flag is updated
  - Preferred communication channel captured
  - Audit trail records consent change
  - ZHEP integration triggered if consent granted
- **Pass Criteria**: Consent properly managed with audit trail
- **Test Approach**: Consent flow test + integration verification

**AC-WEP-002: Wellness Tag Management**
- **Given**: An employee with wellness profile
- **When**: Wellness tags are synced from ZHEP
- **Then**:
  - Tags are stored with source system and timestamps
  - Duplicate tags within profile are prevented
  - Active/inactive status properly managed
- **Pass Criteria**: Tag synchronization with proper history
- **Test Approach**: Integration test with ZHEP mock

---

## 6. Bolt 0 API Acceptance Criteria

### 6.1 REST API Standards

**AC-API-001: OpenAPI Documentation**
- **Given**: People Core API endpoints
- **When**: API documentation is generated
- **Then**: All endpoints documented with schemas, examples, and error responses
- **Pass Criteria**: Complete, accurate OpenAPI specification
- **Test Approach**: Documentation review + automated schema validation

**AC-API-002: Response Format Consistency**
- **Given**: Any API request
- **When**: Response is returned
- **Then**: Response follows consistent JSON format with proper HTTP status codes
- **Pass Criteria**: All responses conform to API standards
- **Test Approach**: Contract test suite

**AC-API-003: Error Handling**
- **Given**: Invalid API requests
- **When**: Error conditions occur
- **Then**: Proper error codes and messages returned
- **Pass Criteria**: Comprehensive error handling with user-friendly messages
- **Test Approach**: Error scenario testing

### 6.2 Multi-Tenancy API Security

**AC-API-004: Tenant Context Enforcement**
- **Given**: API request with tenant context
- **When**: Data access is attempted
- **Then**: Only tenant-scoped data is accessible
- **Pass Criteria**: No cross-tenant data access via API
- **Test Approach**: Security test suite + tenant isolation verification

---

## 7. Bolt 0 Database Acceptance Criteria

### 7.1 Schema Validation

**AC-DB-001: Naming Convention Compliance**
- **Given**: Database schema
- **When**: Tables and columns are reviewed
- **Then**: All follow PID_ prefix convention and P9 naming standards
- **Pass Criteria**: 100% compliance with naming conventions
- **Test Approach**: Schema linting + manual review

**AC-DB-002: Constraint Enforcement**
- **Given**: Database operations
- **When**: Data integrity violations occur
- **Then**: Database constraints prevent invalid data
- **Pass Criteria**: All foreign keys, unique constraints, and check constraints work
- **Test Approach**: Database constraint testing

### 7.2 Audit Requirements

**AC-DB-003: Audit Trail Completeness**
- **Given**: Any data modification
- **When**: Change is made to business tables
- **Then**: Audit fields (created_at, updated_at, created_by, updated_by) are populated
- **Pass Criteria**: Complete audit trail on all business tables
- **Test Approach**: Audit trail verification test

---

## 8. Bolt 0 Integration Acceptance Criteria

### 8.1 Cross-Domain Integration

**AC-INT-001: Work Lattice Integration**
- **Given**: Employment contract creation
- **When**: Primary position assignment is referenced
- **Then**: Proper foreign key relationship to ORG_POSITION_ASSIGNMENT
- **Pass Criteria**: Cross-domain reference works correctly
- **Test Approach**: Integration test with Work Lattice module

**AC-INT-002: ZHEP Wellness Sync**
- **Given**: Employee wellness profile
- **When**: ZHEP sends wellness engagement data
- **Then**: Tags are properly synced and stored with source attribution
- **Pass Criteria**: Two-way sync between PeopleWell and ZHEP
- **Test Approach**: Integration test with ZHEP endpoints

### 8.2 System Integration

**AC-INT-003: Authentication Integration**
- **Given**: User login via OIDC
- **When**: User accesses People Core data
- **Then**: Proper user-to-employee mapping and authorization
- **Pass Criteria**: Seamless integration with authentication system
- **Test Approach**: Authentication flow testing

---

## 9. Bolt 0 Performance Acceptance Criteria

### 9.1 Response Time Requirements

**AC-PERF-001: API Response Times**
- **Given**: Standard load conditions
- **When**: API endpoints are called
- **Then**: 95th percentile response time < 200ms for read operations
- **Pass Criteria**: Performance benchmarks met
- **Test Approach**: Load testing + performance monitoring

**AC-PERF-002: Database Query Performance**
- **Given**: Large dataset (10,000+ employees)
- **When**: Common queries are executed
- **Then**: Query times < 100ms for indexed operations
- **Pass Criteria**: Efficient database queries with proper indexing
- **Test Approach**: Database performance testing

### 9.2 Database Query Performance
- **Given**: Large dataset (10,000+ employees)
- **When**: Common queries are executed
- **Then**: Query times < 100ms for indexed operations
- **Pass Criteria**: Efficient database queries with proper indexing
- **Test Approach**: Database performance testing

---

## 10. Bolt 0 Security Acceptance Criteria

### 10.1 Data Protection

**AC-SEC-001: Data Encryption**
- **Given**: Sensitive personal data
- **When**: Data is stored or transmitted
- **Then**: PII data is encrypted at rest and in transit
- **Pass Criteria**: Encryption standards compliance
- **Test Approach**: Security audit + penetration testing

### 10.2 Access Control
- **Given**: User roles and permissions
- **When**: Data access is attempted
- **Then**: Role-based access control enforced
- **Pass Criteria**: No unauthorized data access
- **Test Approach**: Access control testing

---

## 11. Bolt 0 Non-Functional Acceptance Criteria

### 11.1 Scalability

**AC-NFR-001: Horizontal Scalability**
- **Given**: Increased user load
- **When**: Application instances are scaled
- **Then**: Performance remains consistent across instances
- **Pass Criteria**: Linear scalability with load balancer
- **Test Approach**: Scalability testing

### 11.2 Reliability

**AC-NFR-002: High Availability**
- **Given**: System component failures
- **When**: Database or service failures occur
- **Then**: Graceful degradation and recovery
- **Pass Criteria**: 99.9% uptime SLA
- **Test Approach**: Failure scenario testing

---

## 12. Bolt 0 Testing Strategy

### 12.1 Bolt 0 Test Coverage Requirements

| Test Type | Coverage Target | Responsibility |
|-----------|-----------------|----------------|
| Unit Tests | 90%+ code coverage | Lead Developer |
| Integration Tests | 100% API endpoints | QA Engineer |
| Security Tests | 100% authentication flows | DevOps Engineer |
| Performance Tests | 100% critical paths | Lead Developer |
| UAT | 100% user stories | Product Manager |

### 12.2 Bolt 0 Test Environments

- **Development**: Local development with unit tests
- **Integration**: Staging environment with full stack
- **Performance**: Load testing environment
- **UAT**: Pilot customer environment

---

## 13. Bolt 0 Sign-off Criteria

### 13.1 Bolt 0 Definition of Ready
- All acceptance criteria defined and approved
- Test cases written and reviewed
- Environment provisioned and configured
- Team trained on requirements

### 13.2 Bolt 0 Definition of Done
- All acceptance criteria met and verified
- Test coverage targets achieved
- Security audit passed
- Performance benchmarks met
- Documentation complete
- Stakeholder sign-off received

---

**Document History**
- v1.0 (2025-12-25): Initial draft - Team collaboration session
