# Decision Log

**Purpose**: Record architectural and significant technical decisions for People Core and future development

---

## Format

Each decision entry should include:
- **Date**: When the decision was made
- **Context**: What problem or situation led to this decision
- **Decision**: What was decided
- **Consequences**: What are the implications (positive and negative)
- **Alternatives Considered**: What other options were evaluated

---

## Decisions

### 2025-01-XX: Base Repository Pattern Implementation

**Context**: Need for consistent CRUD operations across all People Core repositories with tenant isolation and audit field population.

**Decision**: Implement a generic `BaseRepository` class that provides common CRUD operations, tenant filtering, and audit field population. Individual repositories extend or use this pattern.

**Consequences**:
- ✅ Consistent patterns across all repositories
- ✅ Reduced code duplication
- ✅ Easier to maintain and update common logic
- ⚠️ Some complexity in generic type handling with Drizzle ORM

**Alternatives Considered**:
- Individual repository implementations (rejected: too much duplication)
- Mixin pattern (rejected: TypeScript complexity)

---

### 2025-01-XX: Audit Logging Strategy

**Context**: Need to track all security- and business-critical events for compliance and debugging.

**Decision**: Two-layer audit approach:
1. Row-level audit columns (created_at, created_by, updated_at, updated_by) on all business tables
2. Central audit log table (SYS_AUDIT_LOG) for event logging (future implementation)

For Bolt 0, audit events are logged to Winston with structured format. SYS_AUDIT_LOG table will be implemented in future.

**Consequences**:
- ✅ Immediate audit trail via Winston logs
- ✅ Can query logs for debugging
- ⚠️ SYS_AUDIT_LOG table not yet implemented (deferred to future bolt)

**Alternatives Considered**:
- Database-only audit (rejected: need immediate logging)
- Log-only audit (rejected: need database queryability for compliance)

---

### 2025-01-XX: Tenant Isolation Middleware

**Context**: Need to extract and enforce tenant context for all People Core operations.

**Decision**: Implement `tenantMiddleware` that extracts tenant ID from JWT token (future) or X-Tenant-ID header. In development with SKIP_AUTH, defaults to tenant 1. Tenant context added to Fastify request object.

**Consequences**:
- ✅ Consistent tenant extraction
- ✅ Easy to add to routes
- ⚠️ JWT token extraction not yet implemented (deferred to full auth implementation)

**Alternatives Considered**:
- Per-route tenant extraction (rejected: too much duplication)
- Database-level RLS only (rejected: need application-level enforcement too)

---

### 2025-01-XX: Service Layer Business Logic

**Context**: Need to enforce business rules (unique constraints, status transitions, etc.) separate from data access.

**Decision**: Implement service layer that:
- Enforces business rules
- Validates data
- Records audit events
- Coordinates between repositories

Repositories handle data access only. Services handle business logic.

**Consequences**:
- ✅ Clear separation of concerns
- ✅ Business rules in one place
- ✅ Easier to test business logic
- ⚠️ Additional layer of abstraction

**Alternatives Considered**:
- Business logic in repositories (rejected: violates single responsibility)
- Business logic in routes (rejected: too much logic in route handlers)

---

### 2025-01-XX: Zod Schema Validation

**Context**: Need to validate API request/response data with clear error messages.

**Decision**: Use Zod for all API validation. Create separate schemas for create, update, and query operations. Validate at route level before service layer.

**Consequences**:
- ✅ Type-safe validation
- ✅ Clear error messages
- ✅ Can generate OpenAPI schemas from Zod
- ✅ Single source of truth for validation rules

**Alternatives Considered**:
- Fastify JSON schema (rejected: less type safety)
- Manual validation (rejected: error-prone)

---

**Document History**
- v1.0 (2025-01-XX): Initial decision log for People Core Bolt 0
