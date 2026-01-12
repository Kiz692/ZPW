---
trigger: model_decision
---


# Zimasa PeopleWell (ZPW) - Project Rules

## Project Overview
- **Product**: Zimasa PeopleWell (ZPW) - Wellness-focused HRMS
- **Architecture**: API-first, SaaS multi-tenant, PostgreSQL
- **Repo Root**: This workspace root (where this rules file lives)
- **Documentation**: All functional specs and schemas are in `docs/` (P1-P14)
- **Tech Profile**: See `docs/Zimasa PeopleWell – Tech & Architecture Profile (v2).md` for detailed stack and architecture

## Mission & Scope
- **Mission**: HRMS optimized for wellness, productivity and health engagement (not a generic HR ERP)
- **Target**: SMEs, single-country, industry-agnostic
- **Delivery**: Multi-tenant SaaS with optional dedicated instances
- **MVP Focus**: Modules that touch wellness & productivity (CoreHR, Work Lattice, Leave & Absence, Performance, Gamification, Light AI)

## Documentation Structure
- **P1**: Zimasa PeopleWell MVP Final - Main functional specification
- **P2**: MVP with IDs - Detailed requirements with IDs
- **P3-P4**: C4 Architecture diagrams (System Context, Container View)
- **P5**: Domain concept map
- **P6-P8**: EPICs, User Stories, Jira import
- **P9**: Global Naming & Conventions - **CRITICAL REFERENCE**
- **P10**: Domain Entities (per module)
- **P11**: MermaidER Domain Diagrams
- **P12**: DBML schemas
- **P14**: SQL schemas - **SOURCE OF TRUTH FOR DATABASE**

## TL;DR for AI
- Use Node 20 + TS + Fastify + Postgres + Drizzle + Redis on backend.
- Use React + TS + Vite + Tailwind + shadcn on frontend.
- Follow P14 SQL schemas and P9 naming; enforce tenant isolation and audit logging.
- Do NOT introduce new MUI/Bootstrap/Flowbite or extra table libs for ZPW.

## Database & Schema Rules

### Source of Truth
- **P14 SQL schemas are the authoritative source** for database structure
- P14 files take precedence over P12 DBML files
- Always reference P14 SQL files when working with database schemas

### Naming Conventions (from P9)
- **Engine**: PostgreSQL
- **Case**: Documentation uses `UPPER_SNAKE_CASE`, DDL uses unquoted identifiers (stored as `lower_snake_case`)
- **Table naming**: `DOMAIN_PREFIX` + `'_'` + `ENTITY_NAME` (singular)
  - Examples: `PID_PERSON`, `ORG_UNIT`, `LEA_LEAVE_REQUEST`, `PRF_PERF_APPRAISAL`
- **Column naming**: `<TBL_PREFIX>_<COLUMN_NAME>`
  - Examples: `EMP_ID`, `EMP_TENANT_ID`, `EMP_HIRE_DATE`
- **Primary Keys**: `<TBL_PREFIX>_ID` as `BIGINT` (identity)
- **Foreign Keys**: `<TBL_PREFIX>_<REF_PREFIX>_ID`
  - Example: `EMP_PRM_POS_ID` → `ORG_POSITION.POS_ID`

### Multi-Tenancy
- Tenant table: `SYS_TENANT` with PK `TEN_ID`
- Tenant-scoped tables must have `<TBL_PREFIX>_TENANT_ID BIGINT NOT NULL`
- All queries must filter by tenant ID (enforced via app + RLS)
- Global tables (e.g., `PID_PERSON`) have no tenant column

### Audit Columns
Standard columns on business tables:
- `<TBL_PREFIX>_CREATED_AT TIMESTAMPTZ NOT NULL`
- `<TBL_PREFIX>_CREATED_BY BIGINT NULL` (→ `SYS_USER.USR_ID`)
- `<TBL_PREFIX>_UPDATED_AT TIMESTAMPTZ NULL`
- `<TBL_PREFIX>_UPDATED_BY BIGINT NULL`
- Optional: `<TBL_PREFIX>_DELETED_AT`, `<TBL_PREFIX>_DELETED_BY`

## Domain Prefixes Reference

| Domain | Prefix | Examples |
|--------|--------|----------|
| System/Shared | `SYS_` | `SYS_TENANT`, `SYS_USER`, `SYS_ROLE` |
| People & Identity | `PID_` | `PID_PERSON`, `PID_EMPLOYEE`, `PID_WELLNESS_PROFILE` |
| Org & Jobs | `ORG_` | `ORG_UNIT`, `ORG_POSITION`, `ORG_JOB_ROLE` |
| Leave & Absence | `LEA_` | `LEA_LEAVE_REQUEST`, `LEA_LEAVE_BALANCE`, `LEA_RECOVERY_INDEX` |
| Performance | `PRF_` | `PRF_PERF_APPRAISAL`, `PRF_CHECKIN`, `PRF_PERF_CYCLE` |
| Gamification | `GAM_` | `GAM_PROFILE`, `GAM_POINTS_TXN`, `GAM_BADGE` |
| AI/Conversation | `AIS_` | `AIS_CONVERSATION`, `AIS_MESSAGE`, `AIS_HR_REQUEST` |
| System/Audit | `SYS_` (table), `AUD` (column prefix) | `SYS_AUDIT_LOG` (table), `AUD_ID`, `AUD_TENANT_ID`, ... |

- For SYS_AUDIT_LOG, the table is in the SYS_ domain, but columns use AUD_ as the prefix.

## Tech Stack (Zimasa Modern Service Blueprint)

### Backend Stack (ZPW Core API)
- **Runtime**: Node.js 20+ with TypeScript
- **Web Framework**: Fastify
  - Security: `@fastify/helmet`, `@fastify/cors`
  - Rate limiting: `@fastify/rate-limit` backed by Redis
  - Auth: `@fastify/jwt`
  - Docs: `@fastify/swagger` + `@fastify/swagger-ui` (OpenAPI)
- **Validation**: Zod (and/or Fastify JSON schema)
- **Database**: PostgreSQL (+ pgvector extension for AI/RAG)
- **ORM**: Drizzle ORM (migrations via Drizzle Kit or SQL in `/db/migrations`)
- **Caching & Coordination**: Redis (ioredis) for:
  - Rate limit state
  - Cache for expensive queries / AI calls
  - Distributed locks (deduplication, idempotency)
- **AI & Orchestration** (Phase 2):
  - LLM: LangChain + LangGraph
  - Postgres-based checkpointing (`@langchain/langgraph-checkpoint-postgres`)
  - Multiple LLM providers: OpenAI, Anthropic, Google Gemini
  - RAG: pgvector for semantic search
- **Observability**:
  - Tracing: OpenTelemetry (NodeSDK + auto-instrumentations)
  - Metrics: Prometheus (`prom-client`) with `/metrics` endpoint
  - Logging: Winston (structured JSON logs)
  - Error monitoring: Sentry (Node SDK)
- **Resilience**: Cockatiel for retry policies and circuit breakers
- **Secrets**: AWS Secrets Manager (`.env` only in local/dev)
- **File Storage**: AWS S3 where needed
- **Testing**: Vitest for unit, integration and (light) e2e
- **Linting**: ESLint + Prettier

### Frontend Stack (ZPW Web)
- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **Styling**: TailwindCSS
- **UI Primitives**: Radix UI + shadcn/ui
- **Icons**: Lucide React (only icon pack for new ZPW code)
- **Server State**: TanStack React Query (primary)
- **Global App State**: Redux Toolkit *only where truly needed* (auth, tenant, global filters); otherwise avoid
- **Forms**: React Hook Form (+ Zod for schema-based validation)
- **Charts**: Recharts
- **i18n**: i18next / react-i18next (align with platform languages: en, kis, fr, etc.)
- **Accessibility**: Aim for **WCAG 2.1 AA**
- **Tables**: One main table pattern (TanStack Table-based component or internal wrapper)
- **Explicitly AVOID for new ZPW frontend**:
  - New use of MUI, Bootstrap, Flowbite, styled-components
  - Adding more table libraries beyond the chosen standard
  - Additional icon packs beyond Lucide unless justified

### Frontend Structure
```
frontend/
  src/
    app/               # Shell, layout, routing
    features/
      people/
      org/
      leave/
      performance/
      gamification/
      ai/
    shared/
      components/
      hooks/
      lib/
      ui/              # shadcn/ui components
    assets/
    i18n/
```

## Code Generation Guidelines

### Backend Structure (Recommended)

backend/
  src/
    core/
      config/
      db/
      logger/
      auth/
      metrics/
      audit/
    modules/
      people/        # PID_*
      org/           # ORG_*
      leave/         # LEA_*
      performance/   # PRF_*
      gamification/  # GAM_*
      ai/            # AIS_*
    app.ts           # Fastify bootstrap
    routes.ts        # Registers all module routes


### Backend Code
- Always align with P1-P14 documentation
- Use P14 SQL schemas as database reference
- Follow P9 naming conventions strictly
- Respect domain prefixes in all code (models, DTOs, services)
- Enforce tenant isolation in all queries and operations
- Implement RBAC (Employee, Manager, HR, Admin, Exec roles)
- Include audit fields (created_at, created_by, updated_at, updated_by)
- **Modular monolith** structure:
  - Shared layers: DB, auth, logging, metrics, config, audit
  - Domain modules: PID, ORG, LEA, PRF, GAM, AIS
  - Each domain has: Routes/controllers (`/api/v1/...`), Domain services, Repositories using Drizzle
- Place new domain logic in backend/src/modules/<domain>/ following the module structure above.
- Place shared infra (DB, logging, auth, audit) in backend/src/core/.

### Frontend Code
- Align with functional specs in P1
- Follow domain entity structure from P10
- Use consistent naming that maps to backend domain prefixes
- Implement role-based UI visibility and permissions
- Feature/domain-based structure (see Frontend Structure above)
- Clean, wellness-oriented UI with consistent visual language
- Components built from shadcn/ui + Tailwind + Radix primitives

### API Design
- Base path: `/api/v1/...`
- Example endpoints:
  - `/api/v1/people/employees`
  - `/api/v1/org/positions`
  - `/api/v1/leave/requests`
  - `/api/v1/performance/appraisals`
  - `/api/v1/gamification/events`
- JSON, typed via TypeScript and documented in OpenAPI
- Validated with Zod schemas
- Tenant context must be included in all requests
- Include event/webhook mechanisms for key events

## Module Structure
1. **People Core** - Person, Employee, Contracts, Wellness Profile
2. **Work Lattice** - Org Units, Job Roles, Positions, Assignments
3. **Rhythms** - Leave & Absence, Balances, Recovery Index
4. **Growth Signals** - Performance Cycles, Appraisals, Check-ins
5. **Gamification Layer** - Points, Levels, Challenges, Badges
6. **AI Layer** - Copilots, Appraisal Summarizer, HR Request Routing
7. **ESS & MSS** - Employee/Manager Self-Service Portals
8. **Integrations & NFR** - ZHEP Integration, Security, Multi-tenancy

## Key Principles
- **Wellness-first**: Encourage healthy, sustainable work patterns
- **No overwork rewards**: Gamification avoids rewarding unhealthy "hustle"
- **Human-in-the-loop**: AI is assistive, never autonomous for critical decisions
- **Tenant isolation**: Strict data boundaries, no cross-tenant access
- **API-first**: All operations accessible via REST APIs
- **Simple workflows**: No heavy BPM engine for MVP

## When Working on This Project
1. Always check P14 SQL files first for database structure
2. Reference P9 for naming conventions
3. Consult P1 for functional requirements
4. Use domain prefixes consistently
5. Ensure tenant isolation in all code
6. Follow audit column patterns
7. Align with module structure from P1

## Security & Auth

### User Authentication
- OIDC-compatible IdP (e.g. Keycloak/Auth0) issues JWTs
- ZPW API validates JWTs via `@fastify/jwt`

### Service-to-Service Auth
- API keys + JWT pattern (reused from Email Orchestrator)
- `x-api-key` header, hashed keys in DB

### Multi-Tenancy Enforcement
- Tenant ID derived from token / API key context
- All service methods must filter by `<tbl_prefix>_tenant_id`

## Audit Logging & Compliance

Two layers:

1. **Row-level audit columns** in business tables:
   - `*_created_at`, `*_created_by`, `*_updated_at`, `*_updated_by`, `*_deleted_at`, `*_deleted_by`

2. **Central audit log table** (`SYS_AUDIT_LOG` with prefix `AUD`):
   - `aud_id` (PK)
   - `aud_tenant_id`
   - `aud_actor_id` (user or service)
   - `aud_actor_type` (EMPLOYEE | SERVICE | SYSTEM | …)
   - `aud_action` (e.g. EMP_CREATED, LEAVE_APPROVED, PERF_SUBMITTED)
   - `aud_entity_type` (EMPLOYEE, LEAVE_REQUEST, APPRAISAL, POLICY, etc.)
   - `aud_entity_id`
   - `aud_metadata` (JSON payload – diff, relevant context)
   - `aud_timestamp`

**Pattern**: Use `recordAuditEvent(...)` helper in each service for security- and business-critical events. Mirror audit events as structured Winston logs with `event: 'audit_event'`.

## Rate Limiting

- All external-facing APIs must use `@fastify/rate-limit` with Redis-backed state
- Default policy: e.g. 100 requests per minute per key/IP (tune per endpoint)
- Stricter rate limits around:
  - AI/LLM endpoints
  - High-cost operations (report generation, bulk imports)

## Health Checks

Every ZPW service must expose:

- `GET /health` – **liveness**: Lightweight, no dependencies; "can this process answer HTTP?"
- `GET /ready` – **readiness**: Verifies DB connectivity (Postgres), Redis, and any other critical downstream services

**Requirements**:
- Must be cheap to call
- Must not require auth
- Must not leak sensitive data
- Used by Kubernetes / load balancers for liveness and traffic routing

## Observability & Operations

- **Tracing**: OpenTelemetry instrumentation for HTTP and DB
- **Metrics**: Prometheus `prom-client` default metrics + custom domain metrics (e.g. `zpw_leave_requests_total`, `zpw_performance_appraisals_finalised_total`)
- **Logs**: Winston JSON logs shipped to CloudWatch/ELK/Datadog
- **Errors**: Sentry for exceptions and performance alerts

## Performance & Scalability

- Horizontally scalable Fastify instances behind a load balancer
- Postgres sized & tuned for multi-tenant workloads; consider read replicas later
- Redis cluster for rate limiting, hot data caching, locks/idempotency

## CI/CD

- **CI runs**:
  - Type-checking
  - ESLint + Prettier
  - Tests (unit + integration)
  - Migrations dry-run
- **CD**: Automated deploys to DEV/UAT/PROD via Pipelines (Jenkins/Bitbucket/GitHub Actions), including:
  - Apply migrations
  - Rollout containers
  - Health-check before switching traffic

## Allowed vs Legacy Technologies

### Allowed / Preferred (ZPW)
- **Backend**: Node 20+, TS, Fastify, PostgreSQL, Drizzle ORM, Redis, OTEL, Prometheus, Sentry, Winston, Cockatiel, pgvector, LangChain/LangGraph, AWS S3, AWS Secrets Manager
- **Frontend**: React + TS, Vite, Tailwind, Radix/shadcn, Lucide, React Query, React Hook Form, i18next
- **DB governance**: P14 SQL schemas are authoritative; all schema changes go through them

### Legacy / Not for new ZPW code
- Java/Spring Boot + SQL Server/Oracle (kept for ZimasaMedicalAPI and other legacy systems)
- New usage of MUI, Bootstrap, Flowbite, multiple table libraries, styled-components in PeopleWell
- Additional backend stacks for ZPW unless explicitly justified

## Integration Patterns

- ZPW shares **person/employee identity** concepts with other Zimasa systems (via PID_* tables)
- ZPW may read **aggregated health engagement** data from ZHEP/ZimasaMedicalAPI via APIs, not by DB peeking
- AI services consume ZPW APIs and schemas as data sources
- ZPW does not query medical DBs directly

## Out of Scope for MVP
- Full payroll engine
- Complex benefits administration
- Detailed recruitment/ATS features
- Complex working patterns (rotating shifts, multi-calendar)
- Advanced DEI/fairness analytics
- Public/competitive leaderboards
- Autonomous AI decision-making
- Invasive monitoring


