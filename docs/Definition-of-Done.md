# Definition of Done

**Document Version**: 1.0  
**Created**: 2025-01-XX  
**Purpose**: Defines what "done" means for People Core and future bolts

---

## General Criteria

All work items must meet these criteria before being considered "done":

### 1. Code Quality
- [ ] Code follows project conventions (P9 naming, domain prefixes)
- [ ] TypeScript strict mode compliance
- [ ] ESLint and Prettier checks pass
- [ ] No console.log statements (use logger)
- [ ] Code reviewed and approved (if applicable)

### 2. Testing
- [ ] Unit tests written with 90%+ coverage for business logic
- [ ] Integration tests for critical flows
- [ ] All tests passing locally
- [ ] Tests pass in CI pipeline
- [ ] Edge cases and error scenarios covered

### 3. Database & Migrations
- [ ] Database schema aligns with P14 SQL schemas
- [ ] Migrations tested and validated
- [ ] Rollback scripts available (if applicable)
- [ ] Migration dry-run passes in CI
- [ ] Indexes and constraints verified

### 4. Audit Logging
- [ ] Audit events recorded for security-critical operations
- [ ] Audit fields populated (created_at, created_by, updated_at, updated_by)
- [ ] Audit events logged to Winston with structured format

### 5. Tenant Isolation
- [ ] All tenant-scoped queries filter by tenant ID
- [ ] Tenant isolation tests passing
- [ ] No cross-tenant data access possible
- [ ] Tenant context middleware applied

### 6. API Documentation
- [ ] OpenAPI/Swagger documentation updated
- [ ] Request/response examples included
- [ ] Error responses documented
- [ ] API accessible via `/api-docs` endpoint

### 7. Security
- [ ] No hardcoded secrets or credentials
- [ ] SKIP_AUTH guard prevents production deployment
- [ ] Input validation with Zod schemas
- [ ] SQL injection prevention (parameterized queries)
- [ ] Security review completed (for sensitive features)

### 8. Runbook Updates
- [ ] Operational procedures documented
- [ ] Deployment steps updated
- [ ] Troubleshooting guides updated (if applicable)
- [ ] Health check endpoints verified

---

## People Core Specific Criteria

### Database Layer
- [ ] All 11 PID_ tables exist with correct structure
- [ ] All indexes created
- [ ] All constraints (FK, unique) working
- [ ] Audit columns populated on all operations
- [ ] Soft deletes working

### Repository Layer
- [ ] All 11 repositories implemented
- [ ] Tenant isolation enforced
- [ ] Audit fields populated
- [ ] Soft deletes supported
- [ ] 90%+ test coverage

### Service Layer
- [ ] All 11 services implemented
- [ ] Business rules enforced
- [ ] Validation working
- [ ] Audit events recorded
- [ ] 90%+ test coverage

### API Layer
- [ ] All 11 route sets implemented
- [ ] All CRUD operations working
- [ ] OpenAPI documentation complete
- [ ] Error handling comprehensive
- [ ] 100% endpoint test coverage

### Testing
- [ ] Unit tests: 90%+ coverage
- [ ] Integration tests: 3 critical flows automated
- [ ] Database constraint tests passing
- [ ] Tenant isolation tests passing

### CI/CD
- [ ] Pipeline runs on every push
- [ ] All stages pass consistently
- [ ] Test coverage reports generated
- [ ] Migration safety checks working

### Demo & Safety
- [ ] Demo seed script working (`db:seed:demo`)
- [ ] SKIP_AUTH guard prevents production deployment
- [ ] Environment-based auth working

---

## Bolt 0 Specific Criteria

### CI Pipeline
- [ ] Lint stage passes
- [ ] Type check stage passes
- [ ] Unit tests stage passes
- [ ] Integration tests stage passes
- [ ] Migration check stage passes
- [ ] Auth guard check stage passes

### Integration Test Harness
- [ ] Employee creation flow automated
- [ ] Tenant isolation flow automated
- [ ] Status history flow automated (optional third)

### Demo Seed Data
- [ ] `db:seed:demo` creates complete tenant
- [ ] Sample org structure created (stub)
- [ ] Sample people and employees created
- [ ] Data accessible via API

### Auth Guards
- [ ] SKIP_AUTH guard prevents production build
- [ ] Environment-based auth working
- [ ] Auth middleware implemented (stub acceptable)

---

## Future Bolts

For future bolts (Bolt 1: ORG, Bolt 2: LEA, etc.), use this template and add bolt-specific criteria.

---

**Document History**
- v1.0 (2025-01-XX): Initial definition for People Core Bolt 0
