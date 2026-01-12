# Critique: People Core Agile Documents & QA Testing Strategy

**Date**: 2025-12-25  
**Reviewer**: QA & AI-DLC Methodology Analysis  
**Focus**: Alignment with AI-DLC Bolt 0, Practicality, Gaps

---

## Executive Summary

The agile documents demonstrate **strong collaborative thinking** but have **critical misalignment** with AI-DLC Bolt 0 scope. The documents appear to be planning **full People Core development** (8 weeks, comprehensive features) rather than **Bolt 0 hardening** (2-4 hour mob construction blocks, CI baseline).

**Key Finding**: The documents are **excellent templates for future bolts** but need **significant scope reduction** for Bolt 0.

---

## 1. QA Testing Strategy Analysis

### ✅ Strengths

1. **Comprehensive Testing Pyramid**: Well-structured approach from database → business logic → API → E2E
2. **Multi-Tenancy Focus**: Strong emphasis on tenant isolation testing (critical for ZPW)
3. **Realistic Test Scenarios**: Practical examples with TypeScript/Playwright code
4. **Performance Baseline**: Establishes benchmarks (< 100ms queries, < 200ms API)
5. **Security Testing**: SQL injection, tenant isolation, access control covered
6. **Test Automation**: CI/CD integration with proper test categories

### ⚠️ Critical Issues

#### Issue 1: Scope Mismatch with Bolt 0
**Problem**: QA Testing Strategy is comprehensive (4-week plan) but Bolt 0 should focus on **2-3 critical flows only**.

**AI-DLC Bolt 0 Requirement**:
- Integration test harness for **2-3 critical flows**
- Focus on **stability**, not comprehensive coverage

**Current Document**:
- 4-week phased approach
- Comprehensive test coverage (90%+)
- Full security testing suite
- Performance testing with 10,000+ records

**Recommendation**: 
- **Week 1**: Focus on 2-3 critical flows only
  - Flow 1: Create employee → fetch detail with related tables
  - Flow 2: Tenant isolation verification
  - Flow 3: Auth safety guard
- Defer comprehensive testing to **Bolt 1+**

#### Issue 2: Missing Bolt 0-Specific Criteria
**Missing**:
- CI pipeline test execution (lint → typecheck → unit tests → migration check)
- Demo seed data validation (`db:seed:demo`)
- SKIP_AUTH guard testing
- Smoke test checklist

**Should Add**:
```markdown
## Bolt 0 Specific Tests

### CI Pipeline Tests
- [ ] Lint stage passes
- [ ] Typecheck stage passes  
- [ ] Unit tests execute (coverage report generated)
- [ ] Migration dry-run passes

### Demo Seed Tests
- [ ] `db:seed:demo` creates complete tenant
- [ ] Sample org structure created
- [ ] Sample people/employees created
- [ ] Seed is idempotent (can run multiple times)

### Auth Guard Tests
- [ ] SKIP_AUTH=true fails build in production
- [ ] SKIP_AUTH works in development
- [ ] Environment-based auth enforcement works
```

#### Issue 3: Test Data Management Gaps
**Missing**:
- How to reset test database between runs
- Demo seed data structure specification
- Test data factories for Bolt 0 critical flows

**Should Add**:
- Test database cleanup strategy
- Demo seed data schema/documentation
- Minimal test factories for 2-3 critical flows

### ✅ What Works Well

1. **Database Layer Testing**: Excellent foundation-first approach
2. **Multi-Tenancy Testing**: Critical for ZPW, well-covered
3. **Code Examples**: Practical TypeScript examples help implementation
4. **Performance Baselines**: Establishes measurable targets

---

## 2. Intent Document Critique

### ✅ Strengths

1. **Clear AI-DLC Context**: Section 1 properly explains Bolt 0 purpose
2. **Wellness-First Alignment**: Aligns with ZPW mission
3. **Team Roles**: Clear responsibility definitions
4. **Risk Identification**: Good risk assessment

### ⚠️ Critical Issues

#### Issue 1: Scope Creep
**Problem**: Document mixes "Bolt 0 hardening" with "full People Core development"

**Bolt 0 Should Focus On**:
- CI pipeline establishment
- Integration test harness (2-3 flows)
- Auth guards
- Demo seed data
- Documentation updates

**Current Document Includes**:
- Full People Core vision (Section 2)
- User personas (Section 5)
- Cross-domain dependencies (Section 3.4)
- Future bolt preparation (Section 10.4)

**Recommendation**: Split into two documents:
1. **Bolt 0 Intent** (lightweight, 1-2 pages): Focus on hardening only
2. **People Core Vision** (separate doc): Full module vision for reference

#### Issue 2: Missing Bolt 0 Success Definition
**Current**: Generic success metrics
**Should Have**: Bolt 0-specific success criteria:
- CI pipeline runs successfully on every PR
- 2-3 integration tests pass consistently
- Demo seed works for all developers
- SKIP_AUTH cannot be deployed to production
- Release checklist updated

#### Issue 3: Timeline Mismatch
**Current**: References "Week 1-2" planning
**AI-DLC**: Bolt 0 should be **2-4 hour mob construction blocks**, not weeks

**Recommendation**: 
- Remove sprint planning references
- Focus on **mob construction sessions** (2-4 hours each)
- Total Bolt 0 timeline: **1-2 days**, not weeks

### ✅ What Works Well

1. **AI-DLC Context**: Section 1 properly explains methodology
2. **Team Alignment**: Clear role definitions
3. **Risk Mitigation**: Good risk identification

---

## 3. Acceptance Criteria Document Critique

### ✅ Strengths

1. **Detailed Test Scenarios**: Comprehensive Given/When/Then format
2. **Entity Coverage**: All PID_ entities covered
3. **Multi-Tenancy Focus**: Strong tenant isolation criteria
4. **Measurable Outcomes**: Clear pass/fail criteria

### ⚠️ Critical Issues

#### Issue 1: Too Comprehensive for Bolt 0
**Problem**: Document covers **full People Core** acceptance criteria, not just Bolt 0 hardening

**Bolt 0 Should Only Include**:
- CI/CD acceptance criteria (Section 2) ✅
- Integration test harness criteria (Section 2.2) ✅
- Auth safety criteria (Section 2.3) ✅
- Demo seed criteria (Section 3) ✅

**Should Defer to Future Bolts**:
- Core entity stability (Section 5) - This is for full People Core, not Bolt 0
- API acceptance criteria (Section 6) - Too comprehensive
- Performance criteria (Section 9) - Not Bolt 0 scope
- Security criteria (Section 10) - Basic only for Bolt 0

**Recommendation**: 
- Keep Sections 1-4 (Bolt 0 specific)
- Move Sections 5-12 to **"People Core - Full Acceptance Criteria"** document
- Reference full criteria document from Bolt 0

#### Issue 2: Missing Critical Bolt 0 Criteria
**Missing**:
- CI pipeline execution criteria (lint, typecheck, unit tests, migration check)
- Smoke test checklist
- Demo seed data structure validation
- Release checklist completion

**Should Add**:
```markdown
## AC-BOLT0-001: CI Pipeline Execution
- **Given**: Code repository with People Core
- **When**: Developer pushes code or creates PR
- **Then**: CI executes: lint → typecheck → unit tests → migration check
- **Pass Criteria**: All stages pass, failure reporting clear

## AC-BOLT0-002: Smoke Test Checklist
- [ ] Demo seed executes successfully
- [ ] Critical flow 1 passes (create employee → fetch detail)
- [ ] Critical flow 2 passes (tenant isolation)
- [ ] Critical flow 3 passes (auth guard)
- [ ] All tests pass in CI
```

#### Issue 3: Test Coverage Targets Too High
**Current**: 90%+ coverage requirement
**AI-DLC**: Focus on **critical flows**, not percentage coverage

**Recommendation**: 
- Remove percentage targets for Bolt 0
- Focus on: "2-3 critical flows have integration tests"
- Percentage coverage can be goal for future bolts

### ✅ What Works Well

1. **Format**: Excellent Given/When/Then structure
2. **Testability**: All criteria are measurable
3. **CI/CD Focus**: Strong emphasis on automation

---

## 4. Work Plan Document Critique

### ⚠️ Critical Issues

#### Issue 1: Timeline Mismatch (CRITICAL)
**Current**: 8-week sprint plan (4 sprints × 2 weeks)
**AI-DLC Bolt 0**: Should be **2-4 hour mob construction blocks**, total **1-2 days**

**AI-DLC Requirement**:
- Mob Elaboration: 60-90 minutes
- Mob Construction: 2-4 hour blocks
- Verification: 30-60 minutes
- **Total**: 1-2 days maximum

**Current Document**:
- Sprint 1: Weeks 1-2 (Foundation)
- Sprint 2: Weeks 3-4 (Core Entities)
- Sprint 3: Weeks 5-6 (Wellness & Extensions)
- Sprint 4: Weeks 7-8 (Integration & Polish)

**This is NOT Bolt 0!** This is **full People Core development plan**.

**Recommendation**: 
- Replace with **Bolt 0 Work Plan** (1-2 days):
  - **Day 1 Morning**: Mob Elaboration (60-90 min)
  - **Day 1 Afternoon**: Mob Construction Block 1 (2-4 hours)
    - CI pipeline setup
    - Integration test harness setup
  - **Day 2 Morning**: Mob Construction Block 2 (2-4 hours)
    - Auth guards implementation
    - Demo seed data creation
  - **Day 2 Afternoon**: Verification (30-60 min)
    - Run CI locally
    - Execute smoke tests
    - Update documentation

#### Issue 2: Scope Mismatch
**Current**: Full People Core development (entities, wellness, integrations)
**Bolt 0**: Hardening only (CI, tests, auth guards, seed data)

**Should Remove**:
- All sprint planning (Sections 2.1-2.4)
- Resource allocation for full development (Section 3)
- Technical architecture for full module (Section 4)
- Full module deliverables (Section 8)

**Should Keep/Add**:
- Bolt 0 mob construction blocks
- CI pipeline tasks
- Integration test harness tasks
- Auth guard tasks
- Demo seed tasks
- Verification checklist

#### Issue 3: Missing Bolt 0 Deliverables
**Missing**:
- CI pipeline configuration files
- Integration test harness code
- Auth guard implementation
- Demo seed data script
- Updated release checklist
- Updated runbooks

**Should Add**:
```markdown
## Bolt 0 Deliverables

### Code Deliverables
- [ ] `.github/workflows/ci.yml` - CI pipeline
- [ ] `tests/integration/critical-flows.test.ts` - 2-3 integration tests
- [ ] `src/core/auth/guard.ts` - Auth guard implementation
- [ ] `db/seed/demo.ts` - Demo seed script

### Documentation Deliverables
- [ ] `docs/release-checklist.md` - Updated release checklist
- [ ] `docs/runbooks/zpw-api-runbook.md` - Updated runbook
- [ ] `docs/slices/BOLT-0-people-core-hardening.workplan.md` - This document updated
```

### ✅ What Works Well

1. **Risk Management**: Good risk identification (Section 5)
2. **Quality Assurance**: Strong QA planning (Section 6)
3. **Communication**: Good communication plan (Section 7)

**But**: These are for **full development**, not Bolt 0 hardening.

---

## 5. Team Collaboration Process Critique

### ✅ Strengths

1. **Clear Role Definitions**: Excellent role clarity
2. **Collaboration Patterns**: Good communication structure
3. **Conflict Resolution**: Practical resolution framework
4. **Document Integration**: Shows how documents work together

### ⚠️ Issues

#### Issue 1: Timeline Mismatch
**Current**: 6-day process (Day 1-2 Intent, Day 3-4 Acceptance, Day 5-6 Work Plan)
**AI-DLC**: Mob Elaboration should be **60-90 minutes**, not days

**Recommendation**: 
- Update to reflect **AI-DLC mob elaboration** (60-90 min session)
- All three documents created in **single session**
- Focus on **lightweight artifacts**, not comprehensive documents

#### Issue 2: Process Too Heavy
**Current**: Multiple sessions, extensive collaboration
**AI-DLC**: Lightweight, focused, fast

**Recommendation**: 
- Single mob elaboration session (60-90 min)
- Create all three documents together
- Focus on **Bolt 0 scope only**
- Defer comprehensive planning to future bolts

### ✅ What Works Well

1. **Role Clarity**: Excellent for future bolts
2. **Decision Framework**: Good for complex decisions
3. **Document Integration**: Shows document relationships

---

## 6. AI-DLC Next Steps Critique

### ✅ Strengths

1. **Clear Methodology**: Well-defined Bolt operating system
2. **Concrete Actions**: Specific deliverables and timelines
3. **Two-Step Cursor Pattern**: Practical AI-assisted development approach
4. **Measurement Focus**: Tracks key metrics

### ⚠️ Minor Issues

#### Issue 1: File Naming Convention
**AI-DLC Specifies**: `docs/slices/BOLT-0-people-core-hardening.*.md`
**Current Documents**: `docs/agile/People Core - *.md`

**Recommendation**: 
- Move to `docs/slices/` directory
- Rename to match AI-DLC convention:
  - `BOLT-0-people-core-hardening.intent.md`
  - `BOLT-0-people-core-hardening.acceptance.md`
  - `BOLT-0-people-core-hardening.workplan.md`

#### Issue 2: Missing Bolt Template
**AI-DLC Requires**: `docs/slices/_BOLT_TEMPLATE.md`
**Current**: Not created

**Recommendation**: Create bolt template based on these documents (but lighter)

---

## 7. Overall Assessment

### ✅ What's Excellent

1. **Collaborative Thinking**: Documents show strong team collaboration
2. **Comprehensive Coverage**: Excellent for **full People Core development**
3. **QA Focus**: Strong testing strategy
4. **Multi-Tenancy**: Proper emphasis on tenant isolation
5. **Wellness Alignment**: Aligns with ZPW mission

### ⚠️ Critical Gaps

1. **Scope Mismatch**: Documents plan **full development**, not **Bolt 0 hardening**
2. **Timeline Mismatch**: 8 weeks vs. 1-2 days
3. **Missing Bolt 0 Specifics**: CI pipeline, demo seed, auth guards not detailed enough
4. **File Location**: Should be in `docs/slices/` not `docs/agile/`

### 📋 Recommendations

#### Immediate Actions (Bolt 0)

1. **Create Lightweight Bolt 0 Documents**:
   - Focus on: CI pipeline, integration tests (2-3 flows), auth guards, demo seed
   - Timeline: 1-2 days, not weeks
   - Location: `docs/slices/BOLT-0-people-core-hardening.*.md`

2. **Move Current Documents**:
   - Rename to "People Core - Full Development" documents
   - Keep as reference for **Bolt 1+** (full People Core features)
   - Move to `docs/slices/` directory

3. **Update QA Testing Strategy**:
   - Create **Bolt 0 QA Strategy** (2-3 critical flows only)
   - Keep current document as **Full People Core QA Strategy**
   - Reference full strategy for future bolts

#### Future Bolts

1. **Use Current Documents as Templates**:
   - These documents are **excellent templates** for Bolt 1+ (ORG, LEA, PRF, GAM)
   - Adapt scope and timeline per bolt
   - Follow AI-DLC lightweight approach

2. **Create Bolt Template**:
   - Extract common structure from these documents
   - Create `docs/slices/_BOLT_TEMPLATE.md`
   - Use for all future bolts

---

## 8. How QA Testing Scenario Would Turn Out

### Realistic Bolt 0 QA Execution

**Week 1 (Actually Day 1-2)**:

#### Day 1 Morning: Setup
- QA reviews Bolt 0 intent/acceptance/workplan
- Sets up test environment
- Prepares test data factories for 2-3 critical flows

#### Day 1 Afternoon: CI Pipeline Testing
- Validates CI pipeline executes correctly
- Tests lint → typecheck → unit tests → migration check
- Verifies failure scenarios work
- Documents CI pipeline behavior

#### Day 2 Morning: Integration Test Harness
- Implements 2-3 critical flow tests:
  1. Create employee → fetch detail with related tables
  2. Tenant isolation verification
  3. Auth guard testing
- Validates tests pass consistently
- Documents test execution

#### Day 2 Afternoon: Demo Seed & Verification
- Tests `db:seed:demo` execution
- Validates seed creates complete tenant
- Executes smoke test checklist
- Updates release checklist and runbooks

### Success Criteria (Bolt 0)

✅ **CI Pipeline**: Runs successfully on every PR  
✅ **Integration Tests**: 2-3 critical flows pass consistently  
✅ **Demo Seed**: Works for all developers  
✅ **Auth Guards**: SKIP_AUTH cannot deploy to production  
✅ **Documentation**: Release checklist and runbooks updated  

### What Gets Deferred

❌ Comprehensive test coverage (90%+) → **Bolt 1+**  
❌ Full security testing suite → **Bolt 1+**  
❌ Performance testing with large datasets → **Bolt 1+**  
❌ All entity CRUD testing → **Bolt 1+**  

---

## 9. Final Verdict

### Documents Quality: ⭐⭐⭐⭐ (4/5)
**Excellent templates** for full development, but **misaligned** with Bolt 0 scope.

### AI-DLC Alignment: ⭐⭐ (2/5)
**Needs significant scope reduction** to match Bolt 0 requirements.

### Practicality: ⭐⭐⭐ (3/5)
**Too comprehensive** for Bolt 0, but **perfect** for future bolts.

### Recommendation

1. **Keep these documents** as reference/templates
2. **Create lightweight Bolt 0 versions** focused on hardening only
3. **Use current documents** as templates for Bolt 1+ (ORG, LEA, PRF, GAM)
4. **Follow AI-DLC methodology** strictly for Bolt 0 (1-2 days, not weeks)

---

**Conclusion**: These documents demonstrate **excellent collaborative thinking** and would be **perfect templates** for full People Core development (Bolt 1+). However, for **Bolt 0 hardening**, they need **significant scope reduction** to align with AI-DLC's lightweight, focused approach.

