# ORG Work Lattice Module - Intent Document

**Document Version**: 1.0  
**Created**: 2025-01-XX  
**Authors**: Product Manager, Lead Developer, QA Engineer, DevOps Engineer  
**Status**: Draft  
**AI-DLC Bolt**: 1 (ORG slice connecting to People Core)  

---

## 1. AI-DLC Context

### 1.1 Bolt Purpose
This is **Bolt 1** in the AI-DLC methodology - the "ORG Work Lattice slice connecting to People Core". The goal is to build the foundational organizational structure module that enables employees to be assigned to positions and provides visibility into organizational hierarchy and reporting relationships.

### 1.2 AI-DLC Operating System
This bolt follows the **Bolt operating system** pattern:
- **Mob elaboration → plan gates → mob construction → verification → operational readiness**
- 2–4 hour mob construction blocks
- Lightweight artifacts committed to repo
- Focus on thin vertical slice that unlocks value

### 1.3 Current State
- People Core module is built and hardened (Bolt 0 complete)
- Employees (PID_EMPLOYEE) exist but cannot be assigned to organizational positions
- No organizational structure or hierarchy exists
- No visibility into reporting relationships

### 1.4 Target State
- Organizational units (companies, departments, teams) can be created in hierarchical structure
- Positions can be created within org units
- Employees can be assigned to positions
- Basic org chart and reporting relationships are visible
- Integration with People Core enables employee detail to show position assignments

---

## 2. Purpose & Vision

### 2.1 Business Problem
SMEs struggle with unclear organizational structure and reporting relationships, leading to:
- Confusion about who reports to whom
- Difficulty understanding organizational hierarchy
- Lack of visibility into position assignments
- Inefficient HR processes for organizational planning
- Challenges in performance management due to unclear reporting lines
- Difficulty in leave approvals and workflow routing without manager relationships

### 2.2 Solution Vision
Create a Work Lattice module that serves as the foundation for organizational structure, enabling:
- Clear organizational hierarchy (org units, departments, teams)
- Position management within organizational units
- Employee-to-position assignments with full history
- Basic reporting relationships ("who reports to who")
- Integration with People Core for complete employee context
- Foundation for future modules (Leave approvals, Performance management, Gamification)

### 2.3 Success Metrics
- **Organizational Clarity**: 100% of employees have position assignments
- **Reporting Visibility**: Manager-employee relationships are clearly defined
- **Integration Success**: Employee detail shows position assignment seamlessly
- **Tenant Isolation**: Zero cross-tenant data leakage
- **API Performance**: 95th percentile response time < 200ms for org queries
- **Test Coverage**: 90%+ code coverage, 100% critical flows covered

### 2.4 Cross-Domain Dependencies
- **People Core**: Employee references (PID_EMPLOYEE) for position assignments
- **System**: Tenant management (SYS_TENANT) for multi-tenancy
- **Future**: Leave module (for manager approvals), Performance module (for role-based templates)

---

## 3. Bolt 1 Scope & Boundaries

### 3.1 In Scope (MVP Focus)

#### 3.1.1 Organizational Units (ORG_UNIT)
- Create and manage organizational units (companies, departments, teams, cost centres)
- Support hierarchical parent-child relationships
- Support multi-level org structure (unlimited depth)
- Tenant-scoped with unique codes per tenant
- Effective dates for lifecycle management
- Basic org unit types (COMPANY, DEPARTMENT, TEAM, COST_CENTER)

#### 3.1.2 Positions (ORG_POSITION)
- Create positions within organizational units
- Link positions to job roles (basic reference, full CRUD deferred)
- Support reporting relationships (primary reports-to)
- Position codes unique per tenant
- Effective dates for position lifecycle
- Link to org unit (each position belongs to one org unit)

#### 3.1.3 Position Assignments (ORG_POSITION_ASSIGNMENT)
- Assign employees to positions (primary assignments)
- Track assignment history (start date, end date, current flag)
- Cross-domain integration with People Core (PID_EMPLOYEE)
- Tenant isolation and validation
- Assignment type (PRIMARY only in MVP)

#### 3.1.4 Backend APIs
- `GET /api/v1/org/org-units` - List org units (with optional filters)
- `POST /api/v1/org/org-units` - Create org unit
- `GET /api/v1/org/org-units/:id` - Get org unit detail
- `PUT /api/v1/org/org-units/:id` - Update org unit
- `GET /api/v1/org/positions` - List positions (with optional filters)
- `POST /api/v1/org/positions` - Create position
- `GET /api/v1/org/positions/:id` - Get position detail
- `PUT /api/v1/org/positions/:id` - Update position
- `POST /api/v1/org/assignments` - Assign employee to position
- `GET /api/v1/org/employee-assignments` - Get employee's assignments
- `GET /api/v1/org/employee-assignments/:employeeId` - Get specific employee's assignments

#### 3.1.5 Integration with People Core
- Enhance employee detail endpoint to include current position assignment
- Include position details (title, org unit) in employee response
- Validate employee exists before assignment creation
- Ensure tenant consistency (employee and position in same tenant)

#### 3.1.6 Database Implementation
- Schema following P14 SQL definitions
- All required tables: ORG_UNIT, ORG_POSITION, ORG_POSITION_ASSIGNMENT
- Proper indexes for performance (tenant queries, hierarchy traversal)
- Foreign key constraints for data integrity
- Audit columns (created_at, created_by, updated_at, updated_by)

### 3.2 Out of Scope (Bolt 1)

- **Job Role Management**: Full CRUD for ORG_JOB_ROLE (basic reference only)
- **Job Requirements**: ORG_JOB_REQUIREMENT entity (deferred to future bolt)
- **Secondary Assignments**: Only primary assignments in MVP
- **Advanced Org Chart**: Complex visualization, drag-and-drop (basic tree structure only)
- **Position History**: Advanced audit beyond basic audit columns
- **Frontend UI**: Comprehensive UI development (basic verification only)
- **Matrix Organizations**: Complex reporting (dotted lines beyond basic secondary)
- **Multi-Incumbent Positions**: Positions with multiple employees (single assignment per position in MVP)
- **Org Unit Types Lookup**: Separate lookup table (coded field only)
- **Job Family/Level Lookups**: Separate lookup tables (coded fields only)

---

## 4. AI-DLC Bolt Structure

### 4.1 Bolt Template Alignment
This document follows the AI-DLC Bolt template structure:
- **Intent**: Business problem, solution vision, success metrics
- **Scope**: In-scope, out-of-scope, dependencies
- **Acceptance Criteria**: Measurable outcomes (separate document)
- **Work Plan**: Implementation steps (separate document)
- **Test Plan**: Critical flows and coverage targets
- **Risks**: Technical and operational risks

### 4.2 Mob Elaboration Process
- **Participants**: PO/PM, lead dev, QA, ops/security rep
- **Duration**: 60–90 minutes
- **Output**: Three bolt documents (intent, acceptance, workplan)
- **Focus**: "Minimum viable org structure" definition

### 4.3 Plan Gates Enforcement
- **Gate 1**: Database schema review and approval (matches P14 SQL)
- **Gate 2**: API contract validation (REST conventions, OpenAPI)
- **Gate 3**: Integration with People Core verified
- **Gate 4**: Tenant isolation security review

---

## 5. User Personas & Needs

### 5.1 Primary Users

#### 5.1.1 HR Administrator
- **Role**: Manages organizational structure and position assignments
- **Needs**: 
  - Create and maintain organizational units
  - Create positions within org units
  - Assign employees to positions
  - View organizational hierarchy
  - Understand reporting relationships

#### 5.1.2 Manager
- **Role**: Manages team members and needs visibility into reporting structure
- **Needs**:
  - See who reports to them
  - Understand organizational structure
  - View team member positions
  - Navigate up the org chart to see their manager

#### 5.1.3 Employee
- **Role**: Individual contributor who needs to understand their position and reporting structure
- **Needs**:
  - See their current position assignment
  - Understand their place in the organization
  - Know who their manager is
  - View their org unit and department

### 5.2 User Needs Matrix

| Persona | Primary Need | Success Criteria |
|---------|--------------|------------------|
| HR Admin | Create and maintain org structure | Org units and positions can be created and updated easily |
| HR Admin | Assign employees to positions | Assignment process is straightforward with validation |
| Manager | View reporting structure | Can see direct reports and navigate org chart |
| Employee | Understand position | Employee detail shows current position and org unit |
| Manager | Team visibility | Can see all team members' positions and assignments |

---

## 6. Technical Approach

### 6.1 AI-DLC Architecture Decisions
- **Multi-tenant design**: All ORG entities tenant-scoped with proper isolation
- **API-first**: All functionality exposed via REST APIs
- **Domain-driven design**: Clear bounded contexts with ORG_ domain prefix
- **Integration pattern**: Cross-domain references to People Core (PID_EMPLOYEE)
- **Hierarchical structure**: Self-referencing parent-child relationships for org units

### 6.2 Bolt 1 Technical Focus
- **Database Schema**: Follow P14 SQL as source of truth
- **Entity Relationships**: 
  - ORG_UNIT → ORG_UNIT (parent-child hierarchy)
  - ORG_UNIT → ORG_POSITION (positions within units)
  - ORG_POSITION → ORG_POSITION (reporting relationships)
  - ORG_POSITION_ASSIGNMENT → PID_EMPLOYEE (cross-domain)
  - ORG_POSITION_ASSIGNMENT → ORG_POSITION
- **Tenant Isolation**: Enforced at database and application level
- **Audit Trails**: Complete audit fields on all business tables

### 6.3 Integration Points

#### 6.3.1 People Core Integration
- **Employee Reference**: ORG_POSITION_ASSIGNMENT.PAS_EMP_ID → PID_EMPLOYEE.EMP_ID
- **Employee Detail Enhancement**: Include position assignment in employee detail response
- **Validation**: Ensure employee exists and tenant matches before assignment

#### 6.3.2 System Integration
- **Tenant Context**: All entities reference SYS_TENANT
- **User Context**: Audit fields reference SYS_USER

#### 6.3.3 Future Integration Points
- **Leave Module**: Manager relationships for leave approvals
- **Performance Module**: Role-based templates and position context
- **Gamification**: Org unit-based challenges and team competitions

---

## 7. Risk & Mitigation

### 7.1 Bolt 1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cross-domain integration complexity | High | Early API contract definition, comprehensive integration tests |
| Org hierarchy performance | Medium | Proper indexing, query optimization, depth limits if needed |
| Tenant isolation in complex queries | High | Database-level constraints, application filtering, security tests |
| Position assignment validation | Medium | Comprehensive validation logic, clear error messages |
| Schema migration complexity | Medium | Follow P14 SQL exactly, test migrations thoroughly |

### 7.2 AI-DLC Process Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep (adding job roles, requirements) | Medium | Strict scope boundaries, defer to future bolts |
| Integration delays with People Core | Medium | Early API contract definition, mock services for testing |
| Performance issues with large org structures | Medium | Early performance testing, query optimization |
| User adoption resistance | Low | Clear documentation, user-friendly APIs |

---

## 8. AI-DLC Success Definition

### 8.1 Bolt 1 Definition of Done
- Database schema implemented matching P14 SQL
- All API endpoints functional and documented
- Integration with People Core working (employee detail shows assignment)
- Integration test passes (create unit → position → assignment → fetch employee)
- Tenant isolation verified and tested
- Code review completed
- OpenAPI documentation complete
- All acceptance criteria met

### 8.2 AI-DLC Acceptance Gates
- **Gate 1**: Database schema review and approval (matches P14 SQL)
- **Gate 2**: API contract validation (REST conventions, OpenAPI)
- **Gate 3**: Integration with People Core verified
- **Gate 4**: Tenant isolation security review
- **Gate 5**: Integration test passing consistently

---

## 9. AI-DLC Team Alignment

### 9.1 Product Manager Responsibilities
- Business requirements validation
- Scope boundary enforcement
- User story prioritization
- Stakeholder communication
- Success metric tracking

### 9.2 Lead Developer Responsibilities
- Technical architecture validation
- Database schema implementation
- API design and implementation
- Integration with People Core
- Code review standards
- Performance optimization

### 9.3 QA Engineer Responsibilities
- Test strategy definition
- Integration test development
- Multi-tenancy test scenarios
- Data validation criteria
- Security testing requirements
- Test stability validation

### 9.4 DevOps Engineer Responsibilities
- Database migration safety
- Infrastructure provisioning
- Monitoring and alerting
- Performance testing support
- Security review

---

## 10. AI-DLC Next Steps

### 10.1 Immediate (Bolt 1)
- Create bolt documents and commit to `docs/slices/`
- Implement database schema (ORG_UNIT, ORG_POSITION, ORG_POSITION_ASSIGNMENT)
- Develop backend APIs (routes, services, repositories)
- Create integration with People Core
- Develop integration tests

### 10.2 Short-term (Post-Bolt 1)
- User acceptance testing
- Performance optimization
- Documentation completion
- Prepare for Bolt 2 (Leave MVP slice)

### 10.3 Future Bolt Preparation
- Bolt 2: Leave MVP slice (depends on org structure for manager approvals)
- Future: Job role management (full CRUD)
- Future: Job requirements
- Future: Advanced org chart visualization
- Future: Secondary assignments and matrix orgs

---

## 11. Key Entities Overview

### 11.1 ORG_UNIT
- **Purpose**: Represent organizational structure (companies, departments, teams)
- **Key Attributes**: Code, name, type, parent reference, effective dates
- **Relationships**: Self-referencing (parent-child), one-to-many with positions

### 11.2 ORG_POSITION
- **Purpose**: Represent concrete positions within org units
- **Key Attributes**: Code, title, org unit reference, job role reference, reporting relationships
- **Relationships**: Belongs to org unit, linked to job role, self-referencing (reports-to)

### 11.3 ORG_POSITION_ASSIGNMENT
- **Purpose**: Link employees to positions with history
- **Key Attributes**: Employee reference, position reference, assignment type, dates, current flag
- **Relationships**: Cross-domain to PID_EMPLOYEE, belongs to ORG_POSITION

---

**Document History**
- v1.0 (2025-01-XX): Initial draft - Team collaboration session
