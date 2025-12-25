# Bolt 0: People Core Hardening + CI Baseline — Intent

**AI-DLC Bolt**: 0 (Retrofit/Hardening)

---

## 1) Purpose

Stabilize the existing People Core implementation by turning the repo into a **predictable delivery system**.

This bolt is intentionally small and execution-focused. It exists to ensure the team can make changes safely and repeatedly (with CI, critical-flow integration tests, safe auth configuration, and consistent demo data), before starting additional bolts (ORG / LEA / PRF / GAM).

---

## 2) Scope (Bolt 0)

### 2.1 In scope

- CI pipeline that runs on every PR:
  - lint
  - typecheck
  - unit tests
  - migration check
- Integration test harness with **2–3 critical flows**:
  - Flow 1: create employee → fetch employee detail including related data
  - Flow 2: tenant isolation verification (no cross-tenant data access)
  - Flow 3: auth safety verification (SKIP_AUTH behavior guarded)
- Auth safety hardening:
  - ensure `SKIP_AUTH=true` cannot deploy to production
- Demo seed data:
  - `db:seed:demo` creates a tenant + sample org + sample people for consistent dev/demo
- Docs hardening:
  - update release checklist
  - update API runbook

### 2.2 Out of scope

- Building new People Core features/entities
- Expanding ORG / LEA / PRF / GAM
- Broad performance/security programs beyond what is required to support the Bolt 0 deliverables

---

## 3) Success criteria (Bolt 0)

Bolt 0 is successful when:

- CI pipeline runs on every PR and is consistently green when changes are correct
- 2–3 integration tests pass consistently and validate the critical flows
- Demo seed works for every developer (repeatable and documented)
- `SKIP_AUTH` cannot ship to production (fails fast with a clear error)
- Release checklist and runbooks are updated to reflect current operational reality

---

## 4) Timeline and working mode

- Mob elaboration: 60–90 minutes
- Mob construction: 2–4 hour blocks
- Verification: 30–60 minutes

Target timeline: **1–2 days** total.

---

## 5) Roles and responsibilities (Bolt 0)

- Product/PM:
  - confirm “pilot-ready People Core” definition for this bolt
  - confirm scope boundaries and acceptance gates
- Lead dev:
  - implement CI, test harness, auth guard, seed plumbing
  - ensure tenant isolation is tested and enforced in the critical flows
- QA:
  - define and review the 2–3 critical flows and smoke checklist
  - validate that tests are stable (not flaky) and meaningful
- DevOps / Ops / Security rep:
  - ensure CI and environment rules prevent unsafe deployments
  - ensure docs/runbooks are sufficient for basic operations
