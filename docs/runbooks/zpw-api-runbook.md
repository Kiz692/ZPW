# ZPW API Runbook

**Service**: ZPW Core API  
**Version**: 0.1.0  
**Purpose**: Operational procedures for People Core API

---

## Service Overview

**ZPW Core API** is the backend API for Zimasa PeopleWell, providing People Core functionality via REST APIs.

### Key Components
- Fastify web server
- PostgreSQL database
- Redis (for rate limiting and caching)
- Drizzle ORM for database access

### Health Endpoints
- `GET /health` - Liveness check (no dependencies)
- `GET /ready` - Readiness check (verifies DB connectivity)

---

## Deployment

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis (optional for local dev)

### Environment Variables
```bash
NODE_ENV=production|staging|development
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://host:6379
SKIP_AUTH=false  # MUST be false in production/staging
```

### Deployment Steps

1. **Build application**:
   ```bash
   cd backend
   npm ci
   npm run build
   ```

2. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

3. **Start application**:
   ```bash
   npm start
   ```

4. **Verify health**:
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/ready
   ```

---

## Database Operations

### Running Migrations
```bash
# Apply migrations
npm run db:migrate

# Generate new migration (after schema changes)
npm run db:generate

# Push schema changes (dev only)
npm run db:push
```

### Seed Demo Data
```bash
# Create demo tenant with sample data
npm run db:seed:demo
```

### Database Backup
```bash
# Backup database
pg_dump -U zpw_user -d zpw_db > backup_$(date +%Y%m%d).sql

# Restore database
psql -U zpw_user -d zpw_db < backup_YYYYMMDD.sql
```

---

## Monitoring

### Health Checks
- **Liveness**: `GET /health` - Should return 200
- **Readiness**: `GET /ready` - Should return 200 (checks DB)

### Logs
- Application logs: Winston JSON format
- Log level: Set via `LOG_LEVEL` environment variable
- Audit events: Logged with `event: 'audit_event'`

### Metrics
- Prometheus metrics: `GET /metrics` (future implementation)

---

## Troubleshooting

### Application Won't Start

**Symptoms**: Application fails to start

**Checks**:
1. Verify environment variables are set
2. Check database connectivity: `npm run db:migrate`
3. Check port availability
4. Review application logs

**Common Issues**:
- Missing `DATABASE_URL`
- Database not accessible
- Port already in use
- SKIP_AUTH enabled in production (build will fail)

### Database Connection Issues

**Symptoms**: `/ready` endpoint returns 503

**Checks**:
1. Verify database is running
2. Check `DATABASE_URL` is correct
3. Verify network connectivity
4. Check database user permissions

**Resolution**:
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### API Endpoints Not Responding

**Symptoms**: 404 or 500 errors on API calls

**Checks**:
1. Verify routes are registered: Check `/api-docs`
2. Check tenant ID is provided (X-Tenant-ID header)
3. Check user ID is provided (X-User-ID header or JWT)
4. Review application logs for errors

### Tenant Isolation Issues

**Symptoms**: Cross-tenant data access

**Checks**:
1. Verify tenant middleware is applied
2. Check tenant ID is correctly extracted
3. Review repository queries filter by tenant
4. Run tenant isolation tests

---

## Maintenance

### Regular Tasks
- Monitor error rates
- Review audit logs
- Check database performance
- Update dependencies (security patches)

### Database Maintenance
- Vacuum and analyze tables periodically
- Monitor index usage
- Check for slow queries

---

## Emergency Procedures

### Service Down

1. Check health endpoints
2. Review application logs
3. Check database connectivity
4. Verify Redis connectivity (if used)
5. Restart application if needed

### Data Corruption

1. Stop application
2. Restore from backup
3. Verify data integrity
4. Restart application

### Security Incident

1. Immediately disable affected endpoints
2. Review audit logs
3. Identify scope of issue
4. Notify security team
5. Document incident

---

## People Core Specific Procedures

### Creating Demo Environment
```bash
# Run demo seed
npm run db:seed:demo

# Note the tenant ID from output
# Use X-Tenant-ID header in API requests
```

### Verifying People Core Functionality
```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Create person
curl -X POST http://localhost:3000/api/v1/people/persons \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{"perFirstName":"Test","perLastName":"User"}'

# 3. List persons
curl http://localhost:3000/api/v1/people/persons \
  -H "X-Tenant-ID: 1" \
  -H "X-User-ID: 1"
```

---

**Document History**
- v1.0 (2025-01-XX): Initial runbook for People Core Bolt 0
