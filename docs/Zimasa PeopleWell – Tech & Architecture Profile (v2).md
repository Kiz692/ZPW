Here’s the updated profile with **audit logging**, **rate limiting**, and **health checks** baked in.

You can drop this straight into your docs or as a `.cursorrules`-style file for Cursor.

---

# Zimasa PeopleWell – Tech & Architecture Profile (v0.1)

**Product:** Zimasa PeopleWell (ZPW)
**Role in platform:** Multi-tenant HRMS built to **embed wellness & health engagement into everyday employee journeys**.

---

## 1. Product & Scope

### 1.1 Mission

Zimasa PeopleWell is:

* An **HRMS optimized for wellness, productivity and health engagement**, not a generic HR ERP.
* Targeted at **SMEs**, single-country, industry-agnostic.
* Delivered as **multi-tenant SaaS** with optional **dedicated instances**.

### 1.2 MVP functional scope

MVP focuses on modules that touch wellness & productivity:

* **CoreHR / People & Identity** (PID)
* **Work Lattice (Org & Jobs)** (ORG)
* **Leave & Absence** including **leave planning/rosters** (LEA)
* **Performance Management** aligned to current appraisal process (PRF)
* **Growth-level Gamification** (GAM) – Recovery Index, points, simple challenges
* Light **AI** (Phase 2 features) integrated early in data model but not full-blown in v1 UI

Payroll and broader HR ERP features are added later (Growth / Enterprise tiers).

---

## 2. Platform Context

ZPW sits alongside other Zimasa components:

* **Core Business Systems**

  * `ZimasaMedicalAPI` – existing Java/Spring Boot medical & claims engine (SQL Server / Oracle).
  * `Zimasa PeopleWell API` – new HRMS backend (Node/TS + Fastify + Postgres).

* **AI & Automation Layer**

  * `Email / Pre-Auth Orchestrator` – Node/TS + Fastify + LangGraph + Postgres + pgvector.
  * Future services:

    * PeopleWell Employee Copilot.
    * Manager Wellbeing Copilot.
    * HR Inbox / Request Orchestrator.

* **Web Frontends**

  * `Zimasa Medical Frontend` – existing React app with multiple UI libs (legacy stack).
  * `Zimasa PeopleWell Web` – **new, clean React/Vite/Tailwind/shadcn app** (preferred pattern for new work).

Integration patterns:

* ZPW shares **person/employee identity** concepts with other Zimasa systems (via PID_* tables).
* ZPW may read **aggregated health engagement** data from ZHEP/ZimasaMedicalAPI via APIs, not by DB peeking.
* AI services consume ZPW APIs and schemas as data sources.

---

## 3. Tech Stack Overview (PeopleWell)

### 3.1 Frontend – ZPW Web

**Preferred stack for PeopleWell (all new code):**

* **Framework:** React + TypeScript
* **Build tool:** Vite
* **Routing:** React Router
* **Styling:** TailwindCSS
* **UI primitives:** Radix UI + shadcn/ui
* **Icons:** Lucide React
* **Server state:** TanStack React Query (primary)
* **Global app state:** Redux Toolkit *only where truly needed* (auth, tenant, global filters); otherwise avoid.
* **Forms:** React Hook Form (+ Zod for schema-based validation)
* **Charts:** Recharts
* **i18n:** i18next / react-i18next (align with platform languages: en, kis, fr, etc.)
* **Accessibility:** Aim for **WCAG 2.1 AA**.

**UI / tables:**

* One main table pattern (e.g. TanStack Table-based component or internal wrapper).
* No “table zoo” (no mixing MUI Table, Handsontable, etc. in ZPW).

**Explicitly *avoid* for new ZPW frontend work:**

* New use of MUI, Bootstrap, Flowbite, styled-components for styling.
* Adding more table libraries beyond the chosen standard.
* Additional icon packs beyond Lucide unless justified and agreed.

---

### 3.2 Backend – ZPW Core API

**Preferred stack (aligned with Email Orchestrator):**

* **Language & runtime:** Node.js 20+ with TypeScript.
* **Web framework:** Fastify.

  * Security: `@fastify/helmet`, `@fastify/cors`.
  * **Rate limiting:** `@fastify/rate-limit` backed by Redis.
  * Auth: `@fastify/jwt`.
  * Docs: `@fastify/swagger` + `@fastify/swagger-ui` (OpenAPI).
* **Validation:** Zod (and/or Fastify JSON schema) for request/response schemas.

**Database & data access:**

* **Database:** PostgreSQL (per-environment shared DB; no SQL Server/Oracle for ZPW).
* **Schema:** Defined in **P14 SQL schemas** (source of truth). P14 overrides DBML when in conflict.
* **ORM / query layer:** Drizzle ORM.

  * Migrations via Drizzle Kit or SQL in `/db/migrations`.
* **Vector search:** pgvector extension enabled where AI/RAG is needed.

**Caching & coordination:**

* **Redis** (ioredis) for:

  * Rate limit state.
  * Cache for expensive queries / AI calls.
  * Distributed locks (deduplication, idempotency).

**Multi-tenancy strategy:**

* Row-level multi-tenancy in a single Postgres DB.
* Tenant boundary via `SYS_TENANT` (TEN_ID).
* Tenant-scoped tables include `<tbl_prefix>_tenant_id` referencing `SYS_TENANT.TEN_ID`.
* All queries in services **must** be scoped by tenant; RLS may be added later.

---

## 4. Zimasa Modern Service Blueprint

For PeopleWell and all new Zimasa services, the **standard blueprint** is:

### 4.1 Core

* **Runtime:** Node.js 20+, TypeScript.
* **Framework:** Fastify + OpenAPI (Swagger).
* **Database:** PostgreSQL (+ pgvector if AI is involved).
* **ORM:** Drizzle ORM.
* **Cache / coordination:** Redis (ioredis).
* **Secrets:** AWS Secrets Manager (with `.env` only in local/dev).
* **File storage:** AWS S3 where needed.

### 4.2 AI & orchestration

* **LLM orchestration:** LangChain + LangGraph (as per Email Orchestrator).

  * Postgres-based checkpointing (`@langchain/langgraph-checkpoint-postgres`).
  * Multiple LLM providers: OpenAI, Anthropic, Google Gemini.
* **RAG:** pgvector for semantic search over HR policies, wellness content, etc.

### 4.3 Observability & resilience

* **Tracing:** OpenTelemetry (NodeSDK + auto-instrumentations, Fastify & pg instrumentation).
* **Metrics:** Prometheus (`prom-client`) with `/metrics` endpoint.
* **Logging:** Winston (structured JSON logs with service name/version/env).
* **Error monitoring:** Sentry (Node SDK).
* **Resilience:** Cockatiel for:

  * Retry policies (exponential backoff for remote calls).
  * Circuit breakers around LLM APIs / external systems.

### 4.4 Quality gates

* **Tests:** Vitest for unit, integration and (light) e2e.
* **Linting:** ESLint + Prettier.
* **Coverage:** Cover critical domain logic with an agreed baseline (e.g. ~70% lines for new services).

Any new Zimasa service should use this blueprint or document explicit, justified deviations.

---

## 5. ZPW Backend Architecture

### 5.1 Style

* **Modular monolith** in Node/TS:

  * Shared layers: DB, auth, logging, metrics, config, audit.
  * Domain modules:

    * People & Identity (PID).
    * Work Lattice / Org & Jobs (ORG).
    * Leave & Absence (LEA).
    * Performance (PRF).
    * Gamification & Wellness Signals (GAM).
    * AI/Insights & Conversation stubs (AIS).

Each domain maps directly to P14 table families (PID_*, ORG_*, etc.) and has:

* Routes/controllers (`/api/v1/...`).
* Domain services.
* Repositories / data access using Drizzle.

### 5.2 API design

* Base path: `/api/v1/…`.
* Example endpoints:

  * `/api/v1/people/employees`
  * `/api/v1/org/positions`
  * `/api/v1/leave/requests`
  * `/api/v1/performance/appraisals`
  * `/api/v1/gamification/events`

Inputs & outputs:

* JSON, typed via TypeScript and documented in OpenAPI.
* Validated with Zod schemas.

---

## 6. ZPW Frontend Architecture

### 6.1 Structure

Feature/domain-based structure, e.g.:

```text
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

### 6.2 Patterns

* **Design:** clean, wellness-oriented UI; consistent visual language.
* **Components:** built from shadcn/ui + Tailwind + Radix primitives.
* **Tables:** one consistent table abstraction (internally built on TanStack Table if needed).
* **Forms:** React Hook Form + Zod.
* **Data fetching:** React Query for all server calls.
* **Auth & tenant context:** global state (small Redux slice or React context) for auth/tenant.

---

## 7. AI & Integration

### 7.1 AI with PeopleWell (Phase 2)

AI services are **separate** from the core API but use the same Modern Service Blueprint:

* `peoplewell-ai-gateway` (example):

  * Employee copilot:

    * Answers “How much leave do I have?”, “What’s the wellness benefit?” using ZPW APIs + policy docs.
  * Manager copilot:

    * Team Recovery Index insights.
    * Summaries from performance check-ins.

* `hr-inbox-orchestrator`:

  * Similar to Email Orchestrator but focused on HR requests (classification, routing, summarisation).

ZPW exposes **clean APIs** for:

* Employee master data.
* Org structure and reporting lines.
* Leave balances and history.
* Performance outcomes and action plans.
* Gamification scores and Recovery Index.

### 7.2 Integration with ZimasaMedicalAPI & ZHEP

* ZPW does not query medical DBs directly.
* Any medical/wellness utilisation insights come via:

  * ZHEP or ZimasaMedicalAPI APIs (aggregated, privacy-safe), or
  * ZHEP event streams (later phase).

---

## 8. Non-Functional & Engineering Practices

### 8.1 Security & Auth

* **User auth:**

  * OIDC-compatible IdP (e.g. Keycloak/Auth0) issues JWTs.
  * ZPW API validates JWTs via `@fastify/jwt`.
* **Service-to-service auth:**

  * API keys + JWT:

    * Pattern reused from Email Orchestrator (`x-api-key` header, hashed keys in DB).
* **Multi-tenancy enforcement:**

  * Tenant ID derived from token / API key context.
  * All service methods must filter by `<tbl_prefix>_tenant_id`.

### 8.2 Audit logging & compliance

Two layers:

1. **Row-level audit columns** in business tables:

   * `*_created_at`, `*_created_by`, `*_updated_at`, `*_updated_by`, `*_deleted_at`, `*_deleted_by`.

2. **Central audit log table** (e.g. `SYS_AUDIT_LOG` with prefix `AUD`), containing:

   * `aud_id` (PK)
   * `aud_tenant_id`
   * `aud_actor_id` (user or service)
   * `aud_actor_type` (EMPLOYEE | SERVICE | SYSTEM | …)
   * `aud_action` (e.g. EMP_CREATED, LEAVE_APPROVED, PERF_SUBMITTED)
   * `aud_entity_type` (EMPLOYEE, LEAVE_REQUEST, APPRAISAL, POLICY, etc.)
   * `aud_entity_id`
   * `aud_metadata` (JSON payload – diff, relevant context)
   * `aud_timestamp`

**Pattern:**

* Use a small `recordAuditEvent(...)` helper in each service.
* Call it on security- and business-critical events:

  * User/role changes, leave approvals, performance finalisation, config changes, etc.
* Mirror audit events as structured Winston logs with consistent `event: 'audit_event'`.

### 8.3 Rate limiting

* All external-facing APIs must use `@fastify/rate-limit` with Redis-backed state.
* Default policy:

  * e.g. 100 requests per minute per key/IP (tune per endpoint).
* Stricter rate limits around:

  * AI/LLM endpoints.
  * High-cost operations (report generation, bulk imports).

### 8.4 Health checks

Every ZPW service must expose:

* `GET /health` – **liveness**:

  * Lightweight, no dependencies; “can this process answer HTTP?”.
* `GET /ready` – **readiness**:

  * Verifies DB connectivity (Postgres), Redis, and any other critical downstream services.

Usage:

* Kubernetes / load balancers use `/health` for basic liveness and `/ready` to decide if an instance should receive traffic.
* These endpoints must:

  * Be cheap to call.
  * Not require auth.
  * Not leak sensitive data.

### 8.5 Performance & Scalability

* Horizontally scalable Fastify instances behind a load balancer.
* Postgres sized & tuned for multi-tenant workloads; consider read replicas later.
* Redis cluster for:

  * Rate limiting.
  * Hot data caching.
  * Locks/idempotency for workflows.

### 8.6 Observability & Operations

* Tracing:

  * OTEL instrumentation for HTTP and DB.
* Metrics:

  * Prometheus `prom-client` default metrics + custom domain metrics (e.g. `zpw_leave_requests_total`, `zpw_performance_appraisals_finalised_total`, etc.).
* Logs:

  * Winston JSON logs shipped to CloudWatch/ELK/Datadog.
* Errors:

  * Sentry for exceptions and performance alerts.

### 8.7 CI/CD

* CI runs:

  * Type-checking.
  * ESLint + Prettier.
  * Tests (unit + integration).
  * Migrations dry-run.
* CD:

  * Automated deploys to DEV/UAT/PROD via Pipelines (Jenkins/Bitbucket/GitHub Actions), including:

    * Apply migrations.
    * Rollout containers.
    * Health-check before switching traffic.

---

## 9. “Allowed vs Legacy” (PeopleWell)

To keep training and complexity under control:

### Allowed / Preferred (ZPW)

* **Backend:**
  Node 20+, TS, Fastify, PostgreSQL, Drizzle ORM, Redis, OTEL, Prometheus, Sentry, Winston, Cockatiel, pgvector, LangChain/LangGraph, AWS S3, AWS Secrets Manager.

* **Frontend:**
  React + TS, Vite, Tailwind, Radix/shadcn, Lucide, React Query, React Hook Form, i18next.

* **DB governance:**
  P14 SQL schemas are authoritative; all schema changes go through them.

### Legacy / Not for new ZPW code

* Java/Spring Boot + SQL Server/Oracle (kept for ZimasaMedicalAPI and other legacy systems).
* New usage of MUI, Bootstrap, Flowbite, multiple table libraries, styled-components in PeopleWell.
* Additional backend stacks for ZPW unless explicitly justified.

---

This v0.1 profile gives you:

* A **clear tech stack** for ZPW.
* A consistent **Modern Service Blueprint** reused from the Email Orchestrator.
* Explicit coverage for **audit logging**, **rate limiting**, and **health checks**, which you can now embed into requirements and checklists for the team.
