# Bolt 1: ORG Work Lattice — Intent

**AI-DLC Bolt**: 1 (ORG slice connecting to People Core)

---

## 1) Purpose

Build the foundational ORG (Work Lattice) module that connects to People Core, enabling employees to be assigned to positions and providing visibility into organizational structure and reporting relationships.

This bolt is intentionally focused on the minimum viable slice: org units tree, positions, and assignments. It establishes the foundation for future Work Lattice features (job roles, requirements, advanced reporting) while delivering immediate value through position assignments.

---

## 2) Scope (Bolt 1)

### 2.1 In scope

- **Org Units**: Create and manage organizational units (companies, departments, teams) with hierarchical parent-child relationships
- **Positions**: Create positions within org units, linked to job roles (basic job role support)
- **Position Assignments**: Assign employees to positions (primary assignments)
- **Basic Reporting**: View "who reports to who" through position reporting relationships
- **Backend APIs**:
  - `GET/POST /api/v1/org/org-units` (list, create, update org units)
  - `GET/POST /api/v1/org/positions` (list, create, update positions)
  - `POST /api/v1/org/assignments` (assign employee to position)
  - `GET /api/v1/org/employee-assignments` (get employee's position assignments)
- **Integration**: Connect to People Core (PID_EMPLOYEE) for employee references
- **Multi-tenancy**: All entities tenant-scoped with proper isolation
- **Database**: Schema implementation following P14 SQL (ORG_UNIT, ORG_POSITION, ORG_POSITION_ASSIGNMENT)

### 2.2 Out of scope

- Job role management (ORG_JOB_ROLE) — basic support only, full CRUD deferred
- Job requirements (ORG_JOB_REQUIREMENT) — deferred to future bolt
- Secondary position assignments — only primary assignments in MVP
- Advanced org chart visualization — basic tree structure only
- Position history/audit beyond basic audit columns
- Frontend UI beyond basic verification — focus on backend APIs
- Complex reporting relationships (matrix orgs, dotted lines beyond basic secondary)

---

## 3) Success criteria (Bolt 1)

Bolt 1 is successful when:

- Org units can be created in a hierarchical tree structure (parent-child)
- Positions can be created within org units
- Employees can be assigned to positions (primary assignment)
- Employee detail view shows current position assignment
- Basic org chart can be queried (who reports to who)
- All operations are tenant-isolated
- Integration test: create unit → create position → assign employee → fetch employee detail shows assignment (tenant isolation included)
- API endpoints are documented and follow REST conventions
- Database schema matches P14 SQL definitions

---

## 4) Timeline and working mode

- Mob elaboration: 60–90 minutes
- Mob construction: 2–4 hour blocks (estimate 2–3 blocks)
- Verification: 30–60 minutes

Target timeline: **2–3 days** total.

---

## 5) Roles and responsibilities (Bolt 1)

- **Product/PM**:
  - confirm scope boundaries (org units + positions + assignments)
  - validate integration with People Core requirements
  - confirm "minimum viable org structure" definition
- **Lead dev**:
  - implement backend routes, services, repositories for ORG entities
  - ensure database schema matches P14 SQL
  - implement tenant isolation and audit logging
  - connect to People Core (PID_EMPLOYEE) for assignments
- **QA**:
  - define integration test: create unit → position → assignment → fetch employee detail
  - validate tenant isolation in org structure
  - ensure position assignment appears in employee detail
- **DevOps / Ops**:
  - ensure database migrations are safe and reversible
  - validate multi-tenant performance (org tree queries)

---

## 6) Integration with People Core

This bolt connects ORG module to People Core:

- **Employee Reference**: ORG_POSITION_ASSIGNMENT references PID_EMPLOYEE (cross-domain FK)
- **Employee Detail Enhancement**: When fetching employee detail, include current position assignment
- **Position Assignment**: When assigning employee to position, validate employee exists and is in same tenant

---

## 7) Database entities (from P14)

- **ORG_UNIT**: Organizational units with hierarchy (UNT_PARENT_UNT_ID)
- **ORG_POSITION**: Positions within org units, linked to job roles
- **ORG_POSITION_ASSIGNMENT**: Employee-to-position assignments (cross-domain to PID_EMPLOYEE)

Note: ORG_JOB_ROLE is referenced but basic support only (no full CRUD in this bolt).

---

## 8) Critical flow (integration test)

**Flow**: Create org unit → Create position → Assign employee → Fetch employee detail shows assignment

This flow validates:
- Org structure creation
- Position creation within org unit
- Employee assignment to position
- Cross-domain integration (ORG ↔ PID)
- Tenant isolation throughout

---

**Document History**
- v1.0 (2025-01-XX): Initial draft - Team collaboration session
