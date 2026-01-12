# Release Checklist

**Purpose**: Ensure safe and complete deployment of People Core and future releases

---

## Pre-Release

### Code Quality
- [ ] All tests passing locally
- [ ] CI pipeline passing (all stages green)
- [ ] Code review completed and approved
- [ ] No critical security vulnerabilities
- [ ] Linter and formatter checks pass

### Database
- [ ] Migrations tested in staging environment
- [ ] Migration rollback scripts verified
- [ ] Database backup taken (if production)
- [ ] Migration dry-run passes
- [ ] All indexes and constraints verified

### Testing
- [ ] Unit tests: 90%+ coverage
- [ ] Integration tests: All critical flows passing
- [ ] Database constraint tests passing
- [ ] Tenant isolation tests passing
- [ ] Smoke tests passing

### Documentation
- [ ] API documentation updated (OpenAPI)
- [ ] Runbook updated with new procedures
- [ ] Release notes prepared
- [ ] Breaking changes documented

### Security
- [ ] SKIP_AUTH guard verified (cannot deploy with auth disabled)
- [ ] No hardcoded secrets
- [ ] Environment variables documented
- [ ] Security review completed (if applicable)

---

## Release Steps

### 1. Pre-Deployment
- [ ] Notify team of deployment
- [ ] Verify target environment is ready
- [ ] Check database connectivity
- [ ] Verify Redis connectivity (if applicable)
- [ ] Check environment variables

### 2. Database Migration
- [ ] Run migrations in order
- [ ] Verify migration success
- [ ] Check for errors in logs
- [ ] Verify data integrity

### 3. Application Deployment
- [ ] Deploy application code
- [ ] Verify health endpoints (`/health`, `/ready`)
- [ ] Check application logs for errors
- [ ] Verify API endpoints responding

### 4. Post-Deployment Verification
- [ ] Run smoke tests
- [ ] Verify critical flows work
- [ ] Check tenant isolation
- [ ] Verify audit logging
- [ ] Monitor error rates

### 5. Rollback Plan
- [ ] Rollback script prepared
- [ ] Database rollback steps documented
- [ ] Application rollback steps documented
- [ ] Rollback tested in staging

---

## People Core Specific Checklist

### Database Tables
- [ ] All 11 PID_ tables exist
- [ ] All indexes created
- [ ] All constraints working
- [ ] Demo seed data works (if applicable)

### API Endpoints
- [ ] All 11 entity endpoints responding
- [ ] OpenAPI docs accessible at `/api-docs`
- [ ] Error handling working
- [ ] Tenant isolation verified

### Critical Flows
- [ ] Employee creation flow works
- [ ] Tenant isolation verified
- [ ] Status history flow works

---

## Post-Release

### Monitoring
- [ ] Monitor error rates for 24 hours
- [ ] Check performance metrics
- [ ] Verify audit logs are being written
- [ ] Monitor database performance

### Communication
- [ ] Notify team of successful deployment
- [ ] Update release notes
- [ ] Document any issues encountered
- [ ] Update PROGRESS_LOG.md

---

## Rollback Procedure

If issues are detected:

1. **Stop traffic** to new deployment
2. **Rollback application** to previous version
3. **Rollback database** (if migrations were applied):
   ```bash
   # Run rollback migration if available
   npm run db:rollback
   ```
4. **Verify** previous version is working
5. **Investigate** root cause
6. **Document** issue and resolution

---

**Document History**
- v1.0 (2025-01-XX): Initial release checklist for People Core Bolt 0
