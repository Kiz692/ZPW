# Bolt 0: People Core Hardening + CI Baseline - Work Plan

**Document Version**: 1.0  
**Created**: 2025-12-25  
**Authors**: Product Manager, Lead Developer, QA Engineer, DevOps Engineer  
**Status**: Draft  
**AI-DLC Bolt**: 0 (Retrofit/Hardening)  
**Timeline**: 2 Weeks (Mob Construction approach)

---

## 1. AI-DLC Context

### 1.1 Bolt 0 Purpose
This is **Bolt 0** in the AI-DLC methodology - the "People Core hardening + CI baseline" retrofit. The goal is to establish a **predictable delivery system** before proceeding with additional modules.

### 1.2 AI-DLC Operating System
This bolt follows the **Bolt operating system** pattern:
- **Mob elaboration → plan gates → mob construction → verification → operational readiness**
- 2–4 hour mob construction blocks
- Lightweight artifacts committed to repo

### 1.3 Current State & Target
- **Current**: People Core is "built" but lacks reliable delivery system
- **Target**: Stable CI pipeline, integration test harness, demo seed data, auth guards
- **Success**: Predictable delivery system for future bolts

---

## 2. Sprint Planning

### 2.1 Sprint 1: Foundation (Weeks 1-2)
**Sprint Goal**: Establish database foundation and core API structure

#### Sprint Backlog
| Story ID | User Story | Priority | Points | Owner |
|----------|-------------|----------|--------|-------|
| PC-001 | As HR Admin, I want to create person records so that I can maintain employee identities | High | 8 | Lead Dev |
| PC-002 | As HR Admin, I want to create employee records so that I can manage tenant-specific employment | High | 8 | Lead Dev |
| PC-003 | As System, I want to enforce multi-tenancy so that data isolation is guaranteed | High | 5 | Lead Dev |
| PC-004 | As QA, I want test environment setup so that I can validate functionality | High | 3 | DevOps |
| PC-005 | As DevOps, I want CI/CD pipeline so that automated builds and deployments work | Medium | 5 | DevOps |

#### Technical Tasks
- Database schema implementation (PID_PERSON, PID_EMPLOYEE)
- Basic CRUD API endpoints
- Multi-tenancy middleware
- Unit test framework setup
- CI/CD pipeline configuration

#### Dependencies
- Database server provisioning
- Development environment setup
- API design finalization

#### Acceptance Criteria
- Database tables created with proper constraints
- Basic API endpoints functional
- Multi-tenancy enforced at database level
- CI/CD pipeline deploying to dev environment

---

### 2.2 Sprint 2: Core Entities (Weeks 3-4)
**Sprint Goal**: Implement core business entities and relationships

#### Sprint Backlog
| Story ID | User Story | Priority | Points | Owner |
|----------|-------------|----------|--------|-------|
| PC-006 | As HR Admin, I want to manage employment contracts so that I can track employee agreements | High | 8 | Lead Dev |
| PC-007 | As HR Admin, I want to record employee status changes so that I have complete employment history | High | 5 | Lead Dev |
| PC-008 | As Employee, I want to manage my contact information so that I can be reached appropriately | Medium | 5 | Lead Dev |
| PC-009 | As HR Admin, I want to store official identifiers so that I can maintain compliance | Medium | 3 | Lead Dev |
| PC-010 | As QA, I want integration test suite so that I can validate cross-entity functionality | High | 5 | QA |

#### Technical Tasks
- Employment contract implementation
- Status history tracking
- Person contact management
- Person identifier management
- Integration test development

#### Dependencies
- Sprint 1 completion
- Cross-domain API contracts (Work Lattice)

#### Acceptance Criteria
- Contract management with status tracking
- Complete employment status history
- Contact information with primary flags
- Identifier validation and storage

---

### 2.3 Sprint 3: Wellness & Extensions (Weeks 5-6)
**Sprint Goal**: Implement wellness profiles and extended person data

#### Sprint Backlog
| Story ID | User Story | Priority | Points | Owner |
|----------|-------------|----------|--------|-------|
| PC-011 | As Employee, I want to manage wellness consent so that I can control my privacy | High | 5 | Lead Dev |
| PC-012 | As HR Admin, I want to manage dependents so that I can track wellness eligibility | Medium | 5 | Lead Dev |
| PC-013 | As Employee, I want to store qualifications so that I can maintain my career history | Medium | 3 | Lead Dev |
| PC-014 | As Employee, I want to record prior employment so that I can provide context | Low | 3 | Lead Dev |
| PC-015 | As QA, I want performance test suite so that I can validate scalability | Medium | 5 | QA |

#### Technical Tasks
- Wellness profile implementation
- Dependent management
- Qualification tracking
- Employment history
- Performance testing setup
- ZHEP integration development

#### Dependencies
- Sprint 2 completion
- ZHEP API specifications
- Performance testing environment

#### Acceptance Criteria
- Wellness consent management
- Dependent tracking for eligibility
- Qualification and history storage
- Performance benchmarks established

---

### 2.4 Sprint 4: Integration & Polish (Weeks 7-8)
**Sprint Goal**: Complete integrations, optimize performance, and prepare for production

#### Sprint Backlog
| Story ID | User Story | Priority | Points | Owner |
|----------|-------------|----------|--------|-------|
| PC-016 | As HR Admin, I want seamless ZHEP integration so that wellness data syncs automatically | High | 8 | Lead Dev |
| PC-017 | As System, I want comprehensive audit logging so that all changes are tracked | High | 5 | Lead Dev |
| PC-018 | As DevOps, I want production deployment so that system is live | High | 5 | DevOps |
| PC-019 | As QA, I want security testing so that data protection is validated | High | 5 | QA |
| PC-020 | As Product Manager, I want user acceptance testing so that requirements are validated | High | 3 | PM |

#### Technical Tasks
- ZHEP integration completion
- Comprehensive audit logging
- Production deployment
- Security testing and hardening
- User acceptance testing
- Documentation completion

#### Dependencies
- Sprint 3 completion
- Security review
- Production environment readiness

#### Acceptance Criteria
- Full ZHEP integration working
- Complete audit trail
- Production deployment successful
- Security audit passed
- UAT completed with sign-off

---

## 3. Resource Allocation

### 3.1 Team Roles & Responsibilities

#### Product Manager (40% allocation)
- **Sprint 1-2**: Requirements refinement, stakeholder management
- **Sprint 3-4**: User acceptance testing, pilot coordination
- **Ongoing**: Backlog grooming, sprint planning, progress reporting

#### Lead Developer (100% allocation)
- **Sprint 1**: Database design, core API development
- **Sprint 2**: Business logic implementation
- **Sprint 3**: Wellness features, integrations
- **Sprint 4**: Performance optimization, production readiness

#### QA Engineer (80% allocation)
- **Sprint 1**: Test framework setup, test planning
- **Sprint 2**: Integration testing, validation
- **Sprint 3**: Performance testing, security testing
- **Sprint 4**: UAT coordination, regression testing

#### DevOps Engineer (60% allocation)
- **Sprint 1**: Infrastructure setup, CI/CD pipeline
- **Sprint 2**: Environment management, monitoring setup
- **Sprint 3**: Performance optimization, scaling preparation
- **Sprint 4**: Production deployment, monitoring enhancement

### 3.2 Skill Requirements
| Role | Technical Skills | Business Skills |
|------|------------------|-----------------|
| Lead Dev | Node.js, TypeScript, PostgreSQL, Fastify, Drizzle ORM | Domain modeling, API design |
| QA | Testing frameworks, API testing, performance testing | User perspective, business validation |
| DevOps | AWS, Docker, Kubernetes, monitoring, CI/CD | Infrastructure planning, scalability |
| PM | Agile methodologies, stakeholder management | HR domain knowledge, user research |

---

## 4. Technical Architecture Plan

### 4.1 Database Implementation Strategy
```
Week 1: Schema creation and constraints
Week 2: Indexing and performance optimization
Week 3: Data migration scripts
Week 4: Backup and recovery procedures
```

### 4.2 API Development Strategy
```
Week 1: Core CRUD operations
Week 2: Business logic endpoints
Week 3: Integration endpoints
Week 4: Performance optimization and documentation
```

### 4.3 Infrastructure Strategy
```
Week 1: Development environment setup
Week 2: Staging environment configuration
Week 3: Monitoring and alerting setup
Week 4: Production deployment preparation
```

---

## 5. Risk Management

### 5.1 Technical Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
|------|-------------|--------|-------------------|-------|
| Database performance issues | Medium | High | Early performance testing, indexing strategy | Lead Dev |
| Integration delays with ZHEP | Medium | Medium | Early API contract definition, mock services | Lead Dev |
| Multi-tenancy complexity | Low | High | Database-level constraints, comprehensive testing | Lead Dev |
| Security vulnerabilities | Low | High | Security review, penetration testing | DevOps |

### 5.2 Project Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
|------|-------------|--------|-------------------|-------|
| Resource availability | Low | Medium | Cross-training, documentation | PM |
| Requirement changes | Medium | Medium | Agile methodology, sprint flexibility | PM |
| Stakeholder alignment | Medium | High | Regular communication, demos | PM |
| Timeline pressure | Medium | Medium | Scope management, priority clarification | PM |

---

## 6. Quality Assurance Plan

### 6.1 Testing Strategy
- **Unit Tests**: 90%+ code coverage, automated in CI/CD
- **Integration Tests**: API endpoint validation, cross-entity testing
- **Performance Tests**: Load testing, scalability validation
- **Security Tests**: Penetration testing, vulnerability scanning
- **UAT**: Pilot user testing, feedback collection

### 6.2 Code Quality Standards
- ESLint + Prettier for code formatting
- TypeScript strict mode
- Code review requirements (2 reviewers)
- Automated security scanning
- Documentation requirements

### 6.3 Release Criteria
- All acceptance criteria met
- Test coverage targets achieved
- Security audit passed
- Performance benchmarks met
- Documentation complete
- Stakeholder sign-off received

---

## 7. Communication Plan

### 7.1 Internal Communication
- **Daily Standups**: 15 minutes, progress updates, blockers
- **Sprint Planning**:INGER**:  Eagle planning sessions, greening
sharpening
-reviews
-reviews-reviews who-reviews-reviews-re'The planning sessions: 2-hour sprint planning and review
- **Retrospectives**: 1-hour sprint retrospectives
- **Stakeholder Demos**: Bi-weekly progress demonstrations

### 7.2 External Communication
- **Stakeholder Updates**: Weekly email summaries
- **Pilot Customer Communication**: Regular progress updates
- **Documentation**: Living documents updated continuously

---

## 8. Deliverables Timeline

### 8.1 Sprint Deliverables

#### Sprint 1 (Week 2)
- Database schema implementation
- Core API endpoints
- CI/CD pipeline
- Development environment

#### Sprint 2 (Week 4)
- Complete entity management
- Integration test suite
- Business logic implementation
- Staging environment

#### Sprint 3 (Week 6)
- Wellness features
- ZHEP integration
- Performance testing
- Security testing framework

#### Sprint 4 (Week 8)
- Production deployment
- Complete documentation
- UAT results
- Go-live readiness

### 8.2 Final Deliverables
- Production-ready People Core module
- Complete API documentation
- User training materials
- Operations documentation
- Performance and security reports

---

## 9. Success Metrics & KPIs

### 9.1 Development Metrics
- Sprint velocity: Target 25-30 story points per sprint
- Bug count: Target < 5 bugs per sprint
- Test coverage: Target 90%+ coverage
- Code review time: Target < 24 hours turnaround

### 9.2 Quality Metrics
- Defect density: Target < 1 defect per 1000 lines of code
- Performance: Target < 200ms API response time
- Security: Zero critical vulnerabilities
- UAT satisfaction: Target 85%+ satisfaction score

### 9.3 Business Metrics
- Feature completeness: 100% of MVP features delivered
- Timeline adherence: On-time delivery
- Budget adherence: Within allocated resources
- User adoption: Successful pilot with 3+ customers

---

## 10. Contingency Planning

### 10.1 Scope Flexibility
- MVP features prioritized, nice-to-have features can be deferred
- Sprint scope can be adjusted based on velocity
- Critical path items protected, optional items flexible

### 10.2 Timeline Adjustments
- 1-week buffer available for critical path delays
- Scope reduction options identified
- Resource reallocation strategies planned

### 10.3 Quality Gates
- Sprint reviews must pass quality gates
- Production deployment requires sign-off
- Security issues must be resolved before go-live

---

**Document History**
- v1.0 (2025-12-25): Initial draft - Team collaboration session
