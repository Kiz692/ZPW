# Bolt 1: ORG Work Lattice — Work Plan

**AI-DLC Bolt**: 1 (ORG slice connecting to People Core)

---

## 1) Timeline (2–3 days)

- Day 1: Mob elaboration + construction block 1 (database + basic APIs)
- Day 2: Construction block 2 (assignments + integration)
- Day 3: Construction block 3 (polish + verification)

---

## 2) Mob elaboration (60–90 minutes)

**Attendees**
- Product/PM
- Lead dev
- QA
- DevOps / ops rep

**Outputs (commit these files)**
- `docs/slices/BOLT-1-org-work-lattice.intent.md`
- `docs/slices/BOLT-1-org-work-lattice.acceptance.md`
- `docs/slices/BOLT-1-org-work-lattice.workplan.md`

**Decisions to lock**
- exact API endpoint paths and request/response formats
- job role handling (basic reference vs full CRUD)
- position assignment rules (can employee have multiple active assignments?)
- org unit hierarchy depth limits (if any)
- integration approach with People Core (join vs separate query)

---

## 3) Mob construction — Block 1 (2–4 hours) — Database + Org Units API

**Deliverables**
- Database schema implementation (ORG_UNIT, ORG_POSITION, ORG_POSITION_ASSIGNMENT)
  - Follow P14 SQL definitions
  - Include all required columns, constraints, indexes
  - Tenant isolation at DB level
- Migration script for schema creation
- Org Units API:
  - GET `/api/v1/org/org-units` (list, optionally filter by parent)
  - POST `/api/v1/org/org-units` (create)
  - Basic repository and service for ORG_UNIT

**Acceptance checkpoints**
- Database schema matches P14 SQL
- Migration runs successfully
- Org units can be created and listed
- Tenant isolation works (test: create in Tenant A, verify Tenant B can't see it)

---

## 4) Mob construction — Block 2 (2–4 hours) — Positions API + Assignments

**Deliverables**
- Positions API:
  - GET `/api/v1/org/positions` (list, optionally filter by org unit)
  - POST `/api/v1/org/positions` (create)
  - Repository and service for ORG_POSITION
- Position Assignments API:
  - POST `/api/v1/org/assignments` (assign employee to position)
  - GET `/api/v1/org/employee-assignments` (get employee's assignments)
  - Repository and service for ORG_POSITION_ASSIGNMENT
- Cross-domain integration:
  - Validate employee exists (PID_EMPLOYEE) before assignment
  - Ensure tenant consistency (employee and position in same tenant)

**Acceptance checkpoints**
- Positions can be created within org units
- Employees can be assigned to positions
- Assignment validation works (employee exists, tenant match)
- Employee assignments can be queried

---

## 5) Mob construction — Block 3 (2–4 hours) — Integration + Tests + Polish

**Deliverables**
- Integration with People Core:
  - Enhance employee detail endpoint to include position assignment
  - Ensure position/org unit details are included
- Integration test:
  - Critical flow: create unit → position → assignment → fetch employee detail
  - Tenant isolation test
- API documentation:
  - OpenAPI schemas for all endpoints
  - Request/response examples
- Code review and cleanup:
  - Follow backend structure patterns (routes, services, repositories)
  - Ensure consistent error handling
  - Add audit logging where appropriate

**Acceptance checkpoints**
- Integration test passes consistently
- Employee detail shows position assignment
- All APIs documented in OpenAPI
- Code follows project patterns

---

## 6) Verification (30–60 minutes)

**Run locally once**
- Run database migrations
- Create test org structure (unit → position → assignment)
- Execute integration test
- Verify tenant isolation
- Test employee detail includes assignment

**Docs updates**
- Update API documentation if needed
- Verify all acceptance criteria met

---

## 7) Result

At the end of Bolt 1 the ORG module foundation is complete:

- Org units can be created in hierarchical structure
- Positions can be created within org units
- Employees can be assigned to positions
- Employee detail shows position assignment
- All operations are tenant-isolated
- Integration test validates critical flow
- Ready for future bolts (job roles, requirements, advanced features)

---

## 8) Technical implementation notes

### Database
- Use Drizzle ORM for schema definition
- Follow P14 SQL as source of truth
- Ensure all indexes from P14 are created
- Tenant ID on all tables (UNT_TENANT_ID, POS_TENANT_ID, PAS_TENANT_ID)

### Backend structure
- Follow `backend/src/modules/people/` pattern
- Create `backend/src/modules/org/` with:
  - `routes/` (org-unit.routes.ts, position.routes.ts, assignment.routes.ts)
  - `services/` (org-unit.service.ts, position.service.ts, assignment.service.ts)
  - `repositories/` (org-unit.repository.ts, position.repository.ts, assignment.repository.ts)
  - `schemas/` (Zod validation schemas)
- Register routes in `app.ts` under `/api/v1/org`

### Integration with People Core
- Option 1: Join in employee detail query (include position assignment)
- Option 2: Separate query to ORG module, merge in service layer
- Validate employee exists before assignment (query PID_EMPLOYEE)

### Job Role handling
- For Bolt 1: Basic reference only (JBR_ID as FK, no full CRUD)
- Can create positions with job role ID if it exists
- Full job role management deferred to future bolt

---

**Document History**
- v1.0 (2025-01-XX): Initial draft - Team collaboration session
