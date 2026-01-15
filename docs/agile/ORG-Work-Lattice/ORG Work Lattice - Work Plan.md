# ORG Work Lattice Module - Work Plan

**Document Version**: 1.0  
**Created**: 2025-01-XX  
**Authors**: Product Manager, Lead Developer, QA Engineer, DevOps Engineer  
**Status**: Draft  
**AI-DLC Bolt**: 1 (ORG slice connecting to People Core)  
**Timeline**: 2-3 Days (Mob Construction approach)  

---

## 1. AI-DLC Context

### 1.1 Bolt 1 Purpose
This is **Bolt 1** in the AI-DLC methodology - the "ORG Work Lattice slice connecting to People Core". The goal is to establish the foundational organizational structure that enables position assignments and basic reporting relationships, integrated with the existing People Core module.

### 1.2 AI-DLC Operating System
This bolt follows the **Bolt operating system** pattern:
- **Mob elaboration → plan gates → mob construction → verification → operational readiness**
- 2–4 hour mob construction blocks
- Lightweight artifacts committed to repo
- Focus on thin vertical slice that unlocks value

### 1.3 Current State & Target
- **Current**: People Core module is built and hardened (Bolt 0 complete). Employees exist but cannot be assigned to positions. No organizational structure exists.
- **Target**: Org units, positions, and assignments working with integration to People Core. Basic org chart and reporting relationships visible.
- **Success**: Foundation for future Work Lattice features and dependent modules (Leave, Performance).

---

## 2. Sprint Planning

### 2.1 Sprint 1: Database Foundation (Day 1 - Block 1)

**Sprint Goal**: Establish database schema and org units API

#### Sprint Backlog

| Story ID | User Story | Priority | Points | Owner |
|----------|-------------|----------|--------|-------|
| ORG-001 | As HR Admin, I want to create org units so that I can build organizational structure | High | 8 | Lead Dev |
| ORG-002 | As System, I want org units to be tenant-scoped so that data isolation is guaranteed | High | 5 | Lead Dev |
| ORG-003 | As HR Admin, I want org units to have parent-child relationships so that I can model hierarchy | High | 8 | Lead Dev |
| ORG-004 | As DevOps, I want database migrations so that schema changes are versioned | High | 3 | DevOps |

#### Technical Tasks

**Database Implementation**
- Create Drizzle schema definitions for ORG_UNIT, ORG_POSITION, ORG_POSITION_ASSIGNMENT
- Follow P14 SQL as source of truth
- Implement all required columns, constraints, indexes
- Create migration script
- Test migration on clean database

**Org Units API**
- Create `backend/src/modules/org/` directory structure
- Implement org unit repository (`org-unit.repository.ts`)
- Implement org unit service (`org-unit.service.ts`)
- Implement org unit routes (`org-unit.routes.ts`)
- Create Zod validation schemas (`org-unit.schemas.ts`)
- Register routes in `app.ts` under `/api/v1/org`

**Basic Testing**
- Unit tests for repository and service
- API integration tests for org unit endpoints
- Tenant isolation tests

#### Dependencies
- People Core module (for employee references in future)
- Database server access
- P14 SQL schema definitions

#### Acceptance Criteria
- Database schema matches P14 SQL
- Migration runs successfully
- Org units can be created and listed
- Tenant isolation works
- API endpoints are documented

---

### 2.2 Sprint 2: Positions API (Day 1-2 - Block 2)

**Sprint Goal**: Implement positions API and basic reporting relationships

#### Sprint Backlog

| Story ID | User Story | Priority | Points | Owner |
|----------|-------------|----------|--------|-------|
| ORG-005 | As HR Admin, I want to create positions so that I can define roles within org units | High | 8 | Lead Dev |
| ORG-006 | As HR Admin, I want positions to link to org units so that structure is clear | High | 5 | Lead Dev |
| ORG-007 | As HR Admin, I want positions to have reporting relationships so that I can model "who reports to who" | High | 8 | Lead Dev |
| ORG-008 | As QA, I want position API tests so that I can validate functionality | High | 5 | QA |

#### Technical Tasks

**Positions Implementation**
- Implement position repository (`position.repository.ts`)
- Implement position service (`position.service.ts`)
- Implement position routes (`position.routes.ts`)
- Create Zod validation schemas (`position.schemas.ts`)
- Implement reporting relationship logic (primary reports-to)
- Add cycle detection for reporting relationships

**Integration with Org Units**
- Ensure position-org unit relationship works
- Validate org unit exists before position creation
- Include org unit details in position responses

**Testing**
- Unit tests for position repository and service
- API integration tests for position endpoints
- Reporting relationship tests
- Cycle detection tests

#### Dependencies
- Sprint 1 completion (org units)
- Job role reference handling (basic support)

#### Acceptance Criteria
- Positions can be created within org units
- Reporting relationships work
- Cycle detection prevents circular reporting
- Tenant isolation works

---

### 2.3 Sprint 3: Position Assignments + Integration (Day 2-3 - Block 3)

**Sprint Goal**: Implement position assignments and integrate with People Core

#### Sprint Backlog

| Story ID | User Story | Priority | Points | Owner |
|----------|-------------|----------|--------|-------|
| ORG-009 | As HR Admin, I want to assign employees to positions so that organizational structure is complete | High | 8 | Lead Dev |
| ORG-010 | As Employee, I want to see my position assignment so that I know my role | High | 5 | Lead Dev |
| ORG-011 | As System, I want position assignments to integrate with People Core so that employee detail is complete | High | 8 | Lead Dev |
| ORG-012 | As QA, I want integration tests so that I can validate end-to-end flows | High | 5 | QA |

#### Technical Tasks

**Position Assignments Implementation**
- Implement assignment repository (`assignment.repository.ts`)
- Implement assignment service (`assignment.service.ts`)
- Implement assignment routes (`assignment.routes.ts`)
- Create Zod validation schemas (`assignment.schemas.ts`)
- Implement current assignment flag management
- Implement assignment history tracking

**People Core Integration**
- Enhance employee detail endpoint to include position assignment
- Query ORG module for employee's current assignment
- Include position and org unit details in employee response
- Validate employee exists before assignment creation
- Ensure tenant consistency (employee and position in same tenant)

**Integration Testing**
- Critical flow test: create unit → position → assignment → fetch employee
- Tenant isolation test
- Cross-domain validation tests
- Assignment history tests

**Documentation**
- Update OpenAPI documentation
- Add integration examples
- Document cross-domain relationships

#### Dependencies
- Sprint 2 completion (positions)
- People Core module (employee endpoints)
- Integration test harness

#### Acceptance Criteria
- Employees can be assigned to positions
- Employee detail shows position assignment
- Integration test passes
- Tenant isolation verified
- Documentation complete

---

## 3. Resource Allocation

### 3.1 Team Roles & Responsibilities

#### Product Manager (40% allocation)
- **Sprint 1**: Requirements validation, scope boundary enforcement
- **Sprint 2**: User story prioritization, stakeholder communication
- **Sprint 3**: Integration validation, UAT preparation
- **Ongoing**: Backlog grooming, progress reporting

#### Lead Developer (100% allocation)
- **Sprint 1**: Database schema, org units API
- **Sprint 2**: Positions API, reporting relationships
- **Sprint 3**: Assignments API, People Core integration
- **Ongoing**: Code review, technical decisions, performance optimization

#### QA Engineer (80% allocation)
- **Sprint 1**: Test planning, org unit API tests
- **Sprint 2**: Position API tests, reporting relationship tests
- **Sprint 3**: Integration tests, critical flow validation
- **Ongoing**: Test stability, bug tracking

#### DevOps Engineer (40% allocation)
- **Sprint 1**: Database migration support, environment setup
- **Sprint 2**: Performance testing support
- **Sprint 3**: Integration testing environment
- **Ongoing**: Infrastructure monitoring, deployment support

### 3.2 Skill Requirements

| Role | Technical Skills | Business Skills |
|------|------------------|-----------------|
| Lead Dev | Node.js, TypeScript, PostgreSQL, Fastify, Drizzle ORM, API design | Domain modeling, organizational structure |
| QA | Testing frameworks, API testing, integration testing | Test strategy, business validation |
| DevOps | Database migrations, monitoring, CI/CD | Infrastructure planning |
| PM | Agile methodologies, stakeholder management | HR domain knowledge, organizational design |

---

## 4. Technical Architecture Plan

### 4.1 Database Implementation Strategy

**Phase 1: Schema Definition**
- Review P14 SQL definitions
- Create Drizzle schema files
- Define all tables, columns, constraints, indexes
- Validate against P14 SQL

**Phase 2: Migration Script**
- Create migration script using Drizzle Kit
- Test migration on clean database
- Validate all constraints and indexes
- Test rollback (if needed)

**Phase 3: Seed Data (Optional)**
- Create demo seed data for org structure
- Include sample org units, positions
- Link to People Core demo data

### 4.2 API Development Strategy

**Phase 1: Org Units API**
- Repository layer (data access)
- Service layer (business logic)
- Route layer (HTTP handlers)
- Validation schemas (Zod)

**Phase 2: Positions API**
- Repository layer
- Service layer with reporting logic
- Route layer
- Validation schemas

**Phase 3: Assignments API**
- Repository layer
- Service layer with assignment management
- Route layer
- Validation schemas
- Integration with People Core

### 4.3 Integration Strategy

**Phase 1: Cross-Domain References**
- Establish foreign key to PID_EMPLOYEE
- Validate employee existence
- Ensure tenant consistency

**Phase 2: Employee Detail Enhancement**
- Modify employee detail endpoint
- Query ORG module for assignments
- Merge position/org unit data
- Handle missing assignments gracefully

**Phase 3: Integration Testing**
- End-to-end flow testing
- Multi-tenant integration testing
- Performance testing

---

## 5. Risk Management

### 5.1 Technical Risks

| Risk | Probability | Impact | Mitigation Strategy | Owner |
|------|-------------|--------|-------------------|-------|
| Cross-domain integration complexity | Medium | High | Early API contract definition, comprehensive integration tests | Lead Dev |
| Org hierarchy performance issues | Medium | Medium | Proper indexing, query optimization, depth limits if needed | Lead Dev |
| Tenant isolation in complex queries | Low | High | Database-level constraints, application filtering, security tests | Lead Dev |
| Position assignment validation errors | Medium | Medium | Comprehensive validation logic, clear error messages | Lead Dev |
| Schema migration issues | Low | High | Follow P14 SQL exactly, test migrations thoroughly | DevOps |

### 5.2 Project Risks

| Risk | Probability | Impact | Mitigation Strategy | Owner |
|------|-------------|--------|-------------------|-------|
| Scope creep (adding job roles, requirements) | Medium | Medium | Strict scope boundaries, defer to future bolts | PM |
| Integration delays with People Core | Low | Medium | Early API contract definition, mock services | Lead Dev |
| Performance issues with large org structures | Low | Medium | Early performance testing, query optimization | Lead Dev |
| Timeline pressure | Low | Low | 2-3 day timeline is realistic for scope | PM |

---

## 6. Quality Assurance Plan

### 6.1 Testing Strategy

**Unit Tests**
- Repository tests (data access logic)
- Service tests (business logic)
- Schema validation tests
- Target: 90%+ code coverage

**Integration Tests**
- API endpoint tests
- Cross-domain integration tests
- Tenant isolation tests
- Critical flow tests

**Performance Tests**
- Org unit query performance
- Position query performance
- Hierarchy traversal performance
- Large dataset testing (1000+ org units, 5000+ positions)

### 6.2 Code Quality Standards

- ESLint + Prettier for code formatting
- TypeScript strict mode
- Code review requirements (2 reviewers)
- Follow backend structure patterns (routes, services, repositories)
- Consistent error handling
- Complete audit logging

### 6.3 Release Criteria

- All acceptance criteria met
- Integration test passes consistently
- Database schema matches P14 SQL
- API documentation complete
- Code review approved
- Tenant isolation verified
- Performance benchmarks met (if applicable)

---

## 7. Communication Plan

### 7.1 Internal Communication

- **Daily Standups**: 15 minutes, progress updates, blockers
- **Mob Elaboration**: 60-90 minutes at start
- **Mob Construction Blocks**: 2-4 hours focused work sessions
- **Verification**: 30-60 minutes at end
- **Code Reviews**: As PRs are created

### 7.2 External Communication

- **Stakeholder Updates**: Progress updates as needed
- **Documentation**: Living documents updated continuously
- **API Documentation**: OpenAPI specs updated with each endpoint

---

## 8. Deliverables Timeline

### 8.1 Day 1 Deliverables

**Morning (Mob Elaboration)**
- Bolt documents created and committed
- Scope and decisions locked

**Afternoon (Block 1)**
- Database schema implemented
- Migration script created
- Org units API (GET, POST)
- Basic tests

### 8.2 Day 2 Deliverables

**Morning (Block 2)**
- Positions API (GET, POST)
- Reporting relationships
- Position tests

**Afternoon (Block 3 Start)**
- Position assignments API (POST)
- Assignment queries (GET)
- Assignment tests

### 8.3 Day 3 Deliverables

**Morning (Block 3 Continue)**
- People Core integration
- Employee detail enhancement
- Integration tests

**Afternoon (Verification)**
- Critical flow test execution
- Tenant isolation verification
- Documentation completion
- Code review

### 8.4 Final Deliverables

- Complete ORG module foundation
- Database schema matching P14 SQL
- All API endpoints functional
- Integration with People Core working
- Integration tests passing
- OpenAPI documentation complete
- Ready for future bolts

---

## 9. Success Metrics & KPIs

### 9.1 Development Metrics

- **Timeline Adherence**: Complete within 2-3 days
- **Code Coverage**: 90%+ unit test coverage
- **Integration Test Pass Rate**: 100% critical flows
- **Code Review Time**: < 24 hours turnaround

### 9.2 Quality Metrics

- **Defect Count**: < 3 bugs found in testing
- **API Response Time**: 95th percentile < 200ms
- **Test Stability**: No flaky tests
- **Schema Compliance**: 100% match with P14 SQL

### 9.3 Business Metrics

- **Feature Completeness**: 100% of Bolt 1 scope delivered
- **Integration Success**: Employee detail shows position assignment
- **Tenant Isolation**: Zero cross-tenant data leakage
- **Foundation Readiness**: Ready for Bolt 2 (Leave module)

---

## 10. Contingency Planning

### 10.1 Scope Flexibility

- MVP features prioritized (org units, positions, assignments)
- Nice-to-have features can be deferred (job role CRUD, advanced org chart)
- Critical path items protected (integration with People Core)
- Optional items flexible (demo seed data, advanced queries)

### 10.2 Timeline Adjustments

- 2-3 day timeline is realistic for scope
- If delays occur, prioritize: database → org units → positions → assignments → integration
- Integration with People Core is critical path
- Can defer non-critical features if needed

### 10.3 Quality Gates

- Database schema must match P14 SQL (non-negotiable)
- Integration test must pass (critical)
- Tenant isolation must be verified (security requirement)
- Code review required before merge

---

## 11. Technical Implementation Details

### 11.1 Backend Structure

```
backend/src/modules/org/
├── index.ts                    # Module exports
├── repositories/
│   ├── org-unit.repository.ts
│   ├── position.repository.ts
│   ├── assignment.repository.ts
│   └── index.ts
├── services/
│   ├── org-unit.service.ts
│   ├── position.service.ts
│   ├── assignment.service.ts
│   └── index.ts
├── routes/
│   ├── org-unit.routes.ts
│   ├── position.routes.ts
│   ├── assignment.routes.ts
│   └── index.ts
└── schemas/
    ├── org-unit.schemas.ts
    ├── position.schemas.ts
    ├── assignment.schemas.ts
    └── index.ts
```

### 11.2 Database Schema Files

```
backend/src/core/db/schema/
└── org.ts                      # Drizzle schema for ORG_* tables
```

### 11.3 API Endpoints

**Org Units**
- `GET /api/v1/org/org-units` - List org units
- `POST /api/v1/org/org-units` - Create org unit
- `GET /api/v1/org/org-units/:id` - Get org unit detail
- `PUT /api/v1/org/org-units/:id` - Update org unit

**Positions**
- `GET /api/v1/org/positions` - List positions
- `POST /api/v1/org/positions` - Create position
- `GET /api/v1/org/positions/:id` - Get position detail
- `PUT /api/v1/org/positions/:id` - Update position

**Assignments**
- `POST /api/v1/org/assignments` - Assign employee to position
- `GET /api/v1/org/employee-assignments` - List employee assignments
- `GET /api/v1/org/employee-assignments/:employeeId` - Get employee's assignments

### 11.4 Integration Points

**People Core Integration**
- Modify `backend/src/modules/people/routes/employee.routes.ts`
- Enhance employee detail endpoint to include position assignment
- Query ORG module service for assignment data

**Database Integration**
- Foreign key: `ORG_POSITION_ASSIGNMENT.PAS_EMP_ID → PID_EMPLOYEE.EMP_ID`
- Cross-domain relationship with proper validation

---

## 12. Mob Construction Blocks

### 12.1 Block 1: Database + Org Units (2-4 hours)

**Tasks**
1. Create Drizzle schema for ORG_UNIT
2. Create migration script
3. Test migration
4. Implement org unit repository
5. Implement org unit service
6. Implement org unit routes
7. Create Zod schemas
8. Register routes in app.ts
9. Write basic tests

**Checkpoints**
- Migration runs successfully
- Org units can be created via API
- Tenant isolation works

### 12.2 Block 2: Positions (2-4 hours)

**Tasks**
1. Create Drizzle schema for ORG_POSITION
2. Update migration script
3. Implement position repository
4. Implement position service (with reporting logic)
5. Implement position routes
6. Create Zod schemas
7. Add cycle detection logic
8. Write tests

**Checkpoints**
- Positions can be created
- Reporting relationships work
- Cycle detection prevents circular reporting

### 12.3 Block 3: Assignments + Integration (2-4 hours)

**Tasks**
1. Create Drizzle schema for ORG_POSITION_ASSIGNMENT
2. Update migration script
3. Implement assignment repository
4. Implement assignment service
5. Implement assignment routes
6. Create Zod schemas
7. Integrate with People Core (enhance employee detail)
8. Write integration tests
9. Update documentation

**Checkpoints**
- Assignments can be created
- Employee detail shows assignment
- Integration test passes

---

## 13. Verification Checklist

### 13.1 Database Verification
- [ ] Schema matches P14 SQL exactly
- [ ] All tables created with correct columns
- [ ] All constraints and indexes present
- [ ] Migration runs successfully
- [ ] Rollback works (if tested)

### 13.2 API Verification
- [ ] All endpoints accessible
- [ ] Request validation works
- [ ] Response format is consistent
- [ ] Error handling is comprehensive
- [ ] OpenAPI documentation complete

### 13.3 Integration Verification
- [ ] Employee detail includes position assignment
- [ ] Cross-domain validation works
- [ ] Tenant consistency enforced
- [ ] Integration test passes

### 13.4 Security Verification
- [ ] Tenant isolation works
- [ ] No cross-tenant data leakage
- [ ] Authorization checks in place
- [ ] Security tests pass

### 13.5 Performance Verification
- [ ] API response times acceptable
- [ ] Database queries optimized
- [ ] Indexes support common queries
- [ ] Performance tests pass (if run)

---

**Document History**
- v1.0 (2025-01-XX): Initial draft - Team collaboration session
