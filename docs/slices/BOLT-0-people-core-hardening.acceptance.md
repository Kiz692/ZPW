# Bolt 0: People Core Hardening + CI Baseline — Acceptance Criteria

**AI-DLC Bolt**: 0 (Retrofit/Hardening)

---

## 1) Acceptance scope (Bolt 0 only)

This bolt is accepted when it produces a **predictable delivery system** for People Core. Acceptance is intentionally limited to:

- CI gates
- 2–3 integration-tested critical flows
- Auth safety guard
- Demo seed consistency
- Smoke checklist + docs updates

---

## 2) Critical flows (must be automated)

- **Flow 1: Employee create → fetch detail**
  - Create an employee in a tenant.
  - Fetch employee detail and validate the expected related data is returned (as implemented today).
- **Flow 2: Tenant isolation**
  - Create data in Tenant A.
  - Verify the same request context for Tenant B cannot read Tenant A data.
- **Flow 3: Auth safety**
  - Verify `SKIP_AUTH` is allowed only in safe local/dev contexts (if supported).
  - Verify production configuration cannot run with `SKIP_AUTH=true`.

---

## 3) CI / delivery system acceptance

**AC-BOLT0-001: CI Pipeline Execution**
- **Given**: a pull request is opened or updated
- **When**: CI runs
- **Then**: the pipeline executes (at minimum): lint → typecheck → unit tests → migration check
- **And**: failures clearly identify the stage and reason

**AC-BOLT0-002: Migration Check Safety**
- **Given**: the codebase includes DB migrations
- **When**: CI runs the migration check
- **Then**: the check fails when migrations are missing or invalid for the current code

---

## 4) Integration test harness acceptance

**AC-BOLT0-003: Integration Test Harness Exists and Runs**
- **Given**: a clean environment (local or CI)
- **When**: the integration tests are executed
- **Then**: the harness provisions dependencies as required (DB, etc.) and runs reliably

**AC-BOLT0-004: Critical Flows Covered**
- **Given**: the integration tests run
- **When**: Flow 1–3 execute
- **Then**: each flow passes consistently and validates the intended safety guarantees

---

## 5) Auth safety acceptance

**AC-BOLT0-005: Auth Guard Enforcement**
- **Given**: a production deployment configuration
- **When**: `SKIP_AUTH=true` is set
- **Then**: the build and/or process fails fast with a clear error message

---

## 6) Demo seed acceptance

**AC-BOLT0-006: Demo Seed Creates a Usable Tenant**
- **Given**: an empty database
- **When**: `db:seed:demo` is run
- **Then**: a tenant is created and contains sample data sufficient to:
  - run the smoke checklist
  - support the integration tests (where applicable)

**AC-BOLT0-007: Demo Seed Is Repeatable**
- **Given**: two developers run the demo seed on fresh DBs
- **When**: they run the same smoke checks
- **Then**: the outcomes are consistent and the seed does not require manual repair

---

## 7) Smoke checklist + docs acceptance

**AC-BOLT0-008: Smoke Checklist Exists and Is Executable**
- **Given**: a developer follows the documented steps
- **When**: they seed demo data and run the critical flows
- **Then**: they can verify People Core stability quickly and consistently

**AC-BOLT0-009: Runbooks and Release Checklist Updated**
- **Given**: Bolt 0 changes are merged
- **When**: the team prepares a release
- **Then**: the release checklist and runbook reflect the new CI gates, seeding, and auth safety rules
