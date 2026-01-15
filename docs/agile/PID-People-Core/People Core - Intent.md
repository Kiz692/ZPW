# Bolt 0: People Core Hardening + CI Baseline - Intent Document

**Document Version**: 1.0  
**Created**: 2025-12-25  
**Authors**: Product Manager, Lead Developer, QA Engineer, DevOps Engineer  
**Status**: Draft  
**AI-DLC Bolt**: 0 (Retrofit/Hardening)  

---

## 1. AI-DLC Context

### 1.1 Bolt Purpose
This is **Bolt 0** in the AI-DLC methodology - the "People Core hardening + CI baseline" retrofit bolt. The goal is to stabilize the existing People Core module and establish a reliable, repeatable delivery system before proceeding with additional modules (ORG, LEA, PRF, GAM).

### 1.2 AI-DLC Operating System
This bolt establishes the **Bolt operating system** pattern:
- **Mob elaboration → plan gates → mob construction → verification → operational readiness**
- Lightweight artifacts committed to repo
- Repeatable process for future bolts

### 1.3 Current State
- People Core is "built" but needs hardening
- CI baseline needs establishment
- Demo seed data required for development consistency
- Integration test harness needed for critical flows

## 2. Purpose & Vision

### 2.1 Business Problem
SMEs struggle with fragmented employee data across multiple systems, leading to:
- Inconsistent employee records and wellness tracking
- Manual data entry and duplication errors
- Poor visibility into employee lifecycle events
- Inefficient HR processes affecting employee experience

### 2.2 Solution Vision
Create a unified People Core module that serves as the single source of truth for employee identity, employment records, and wellness engagement across the Zimasa PeopleWell ecosystem.

### 2.3 Success Metrics
- **CI Reliability**: 95%+ successful pipeline runs
- **Test Coverage**: Critical flows 100% covered
- **Demo Seed**: All developers can spin up consistent environment
- **Auth Safety**: No accidental SKIP_AUTH deployments
- **Integration Tests**: 2–3 critical flows automated
- **Documentation**: Release checklist and runbooks updated

### 3.4 Cross-Domain Dependencies
- **Work Lattice**: Position assignments and org structure
- **System**: Tenant management and user authentication
- **Wellness**: ZHEP integration for engagement data

---

## 3. Bolt 0 Scope & Boundaries

### 3.1 In Scope (Hardening Focus)
- **CI Pipeline**: lint, typecheck, unit tests, migration check
- **Integration Test Harness**: 2–3 critical flows (create employee → fetch detail; tenant isolation)
- **Auth Guards**: Remove/guard "SKIP_AUTH=true" with environment + build-time guards
- **Demo Seed Data**: `db:seed:demo` for tenant with sample org + people
- **Documentation**: Update release checklist and runbooks
- **People Core Stabilization**: Ensure existing functionality is production-ready

### 3.2 Out of Scope (Bolt 0)
- New module development (ORG, LEA, PRF, GAM)
- Major feature additions to People Core
- Frontend development beyond basic verification
- Advanced performance optimizations

### 3.3 AI-DLC Success Metrics

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
- **Focus**: "Pilot-ready People Core" definition

### 4.3 Plan Gates Enforcement
- **Gate 1**: CI pipeline functional and automated
- **Gate 2**: Integration test harness operational
- **Gate 3**: Demo seed data working
- **Gate 4**: Auth guards implemented

## 5. User Personas & Needs

### 5.1 Primary Users
- **HR Administrator**: Manages employee data, contracts, and wellness consent
- **Employee**: Views and updates personal information, wellness preferences
- **Manager**: Accesses team member information for performance context

### 5.2 User Needs
| Persona | Primary Need | Success Criteria |
|----------|--------------|------------------|
| HR Admin | Single source of truth for employee data | Complete, accurate employee records |
| Employee | Control over personal data and wellness preferences | Easy self-service, privacy controls |
| Manager | Context for team management decisions | Access to relevant employee information |

---

## 6. Technical Approach

### 6.1 AI-DLC Architecture Decisions
- **Multi-tenant design**: Tenant-scoped employee data with global person identity
- **API-first**: All functionality exposed via REST APIs
- **Domain-driven design**: Clear bounded contexts with PID_ domain prefix
- **Wellness-first**: Built-in consent management and engagement tracking

### 6.2 Bolt 0 Technical Focus
- Global person identity (PID_PERSON) shared across tenants
- Tenant-scoped employee records (PID_EMPLOYEE)
- Audit trails on all business tables
- Soft delete for data retention
- Multi-tenancy enforced at database level

### 6.3 Integration Points
- **ZHEP**: Wellness engagement data sync
- **Work Lattice**: Position assignment references
- **Authentication**: User-to-person mapping

---

## 7. Risk & Mitigation

### 7.1 Bolt 0 Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Multi-tenant data isolation | High | Database-level constraints + application filtering |
| Cross-domain synchronization | Medium | Event-driven architecture with retry logic |
| Data migration complexity | Medium | Phased migration with validation scripts |

### 7.2 AI-DLC Process Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| User adoption resistance | Medium | User-centric design with training materials |
| Data privacy concerns | High | GDPR-compliant design with consent management |
| Integration delays | Medium | Early API contracts with integration partners |

---

## 8. AI-DLC Success Definition

### 8.1 Bolt 0 Definition of Done
- CI pipeline with lint, typecheck, unit tests, migration check
- Integration test harness for 2–3 critical flows
- Auth guards preventing SKIP_AUTH in production
- Demo seed data (`db:seed:demo`) functional
- Release checklist and runbooks updated
- All tests passing locally and in CI

### 8.2 AI-DLC Acceptance Gates
- **Gate 1**: Database schema review and approval
- **Gate 2**: API contract validation
- **Gate 3**: Multi-tenancy security review
- **Gate 4**: User acceptance testing with pilot customers

---

## 9. AI-DLC Team Alignment

### 9.1 Product Manager Responsibilities
- Business requirements validation
- User story prioritization
- Stakeholder communication
- Success metric tracking

### 9.2 Lead Developer Responsibilities
- Technical architecture validation
- Code review standards
- Integration design
- Performance optimization

### 9.3 QA Engineer Responsibilities
- Test strategy definition
- Multi-tenancy test scenarios
- Data validation criteria
- Security testing requirements

### 9.4 DevOps Engineer Responsibilities
- Infrastructure provisioning
- CI/CD pipeline setup
- Monitoring and alerting
- Backup and recovery procedures

---

## 10. AI-DLC Next Steps

### 10.1 Immediate (Week 1)
- Create bolt documents and commit to `docs/slices/`
- Implement CI pipeline with all gates
- Develop integration test harness
- Create demo seed data

### 10.2 Short-term (Week 2)
- Implement auth guards and safety checks
- Update release checklist and runbooks
- Verify all critical flows
- Prepare for Bolt 1 (ORG slice)

### 10.3 AI-DLC Process Establishment
- Follow two-step Cursor prompt pattern (plan → implement)
- Track metrics: decision→PR merged, PR merged→deploy, rework count, escaped defects
- Establish mob construction rhythm (2–4 hour blocks)
- Prepare Bolt template for future use

### 10.4 Future Bolt Preparation
- Bolt 1: ORG slice connecting to People Core
- Bolt 2: Leave MVP slice
- Bolt 3: Gamification signals (optional)

---

**Document History**
- v1.0 (2025-12-25): Initial draft - Team collaboration session
