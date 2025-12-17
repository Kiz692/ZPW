You’re in a good place: **People Core is “built”**. Now AI-DLC is about switching from “build mode” to a repeatable **Bolt operating system**: *mob elaboration → plan gates → mob construction → verification → operational readiness*, with lightweight artifacts committed to the repo.

Below is a concrete way to proceed **from today forward** (without rewriting what you’ve already built).

---

## 1) Do one “AI-DLC retrofit” bolt first (stabilize + make the machine reliable)

**Bolt 0: “People Core hardening + CI baseline”** (do this before ORG/LEA)

### Mob Elaboration (60–90 min)

Participants: PO/PM, lead dev, QA, ops/security rep (even if part-time).

Output files to commit:

* `docs/slices/BOLT-0-people-core-hardening.intent.md`
* `docs/slices/BOLT-0-people-core-hardening.acceptance.md`
* `docs/slices/BOLT-0-people-core-hardening.workplan.md`

Include (explicitly):

* what “pilot-ready People Core” means (auth on/off rules, tenancy rules, audit guarantees)
* minimum automated test coverage targets (not %—focus on critical flows)
* smoke test checklist
* CI gates you’ll enforce

### Mob Construction (2–4 hrs blocks)

Concrete deliverables:

* **CI pipeline** (lint, typecheck, unit tests, migration check)
* **Integration test harness** for 2–3 critical flows (e.g., create employee → fetch detail with related tables; tenant isolation check)
* **Remove/guard “SKIP_AUTH=true”** so it can’t accidentally ship (environment + build-time guard)
* **Demo seed data** (`db:seed:demo`) so every dev can spin a tenant with sample org + people

### Verification (30–60 min)

* run CI locally once
* run demo seed, execute smoke tests
* update `docs/release-checklist.md` and `docs/runbooks/zpw-api-runbook.md`

This bolt turns your repo into a **predictable delivery system**. AI-DLC fails without this.

---

## 2) Introduce AI-DLC guardrails into the repo (lightweight, high leverage)

Add these 4 items now (small but powerful):

1. **Definition of Done**

* `docs/Definition-of-Done.md`
  Include: tests, migration, audit logging, tenancy checks, OpenAPI updated, security notes, runbook delta.

2. **PR template**

* `.github/pull_request_template.md`
  Must include: intent link, what changed, how tested, migration notes, risk/rollback.

3. **Bolt template**

* `docs/slices/_BOLT_TEMPLATE.md`
  Sections: Intent, Scope, Out-of-scope, Acceptance Criteria, Plan, Test Plan, Risks.

4. **Decision log**

* `docs/decision-log.md` (or ADR folder)
  Every non-trivial change gets a short entry.

---

## 3) From here, run work as “Bolts” (AI-DLC cadence)

You already have phased modules (ORG, LEA, PRF, GAM). AI-DLC says: **don’t start “Work Lattice module” as a big chunk.** Start with **thin vertical slices** that unlock value and integrate with what exists.

### Bolt 1: ORG slice that *connects to People Core*

**Goal:** employees can be assigned to positions and you can view “who reports to who” at minimum.

Mob Elaboration outputs:

* “Org Units tree” + “Positions” + “Assignments”
* define tenancy rules and required indexes
* define the simplest manager reporting rule for MVP

Construction deliverables:

* Backend: `GET/POST org_units`, `GET/POST positions`, `POST assignments`, `GET employee assignments`
* Frontend: Org Units tree view + Employee detail shows assignment

Verification:

* integration test: create unit → create position → assign employee → fetch employee detail shows assignment (tenant isolation included)

### Bolt 2: Leave MVP slice

**Goal:** employee submits leave request; manager approves; leave balance updates (basic).

Construction deliverables:

* Backend: `POST leave-requests`, `GET my leave requests`, `POST approve/reject`, `GET balances`
* Frontend: request form + manager approval queue
* Seed: ensure policies/types are applied to balances correctly

Verification:

* integration test: create leave request → approve → balance updated

### Bolt 3: Gamification “signals” (optional early, if it drives your pilot narrative)

Only after Leave works, add:

* points for onboarding complete / leave planned in advance
* a simple “My Points” widget
  Keep it tiny.

---

## 4) How to use Cursor in an AI-DLC way (your new standard prompt pattern)

Right now your prompts often go straight to “implement.” Switch to two-step gating:

### Step A — Plan-only prompt (no code)

> Using `.cursorrules` and the relevant P-docs (P1/P2 + P9 + P14 + domain section in P10), produce:
>
> 1. implementation plan (steps),
> 2. exact files to create/modify,
> 3. DB objects touched + migration impact,
> 4. test plan (unit + integration),
> 5. risks + rollback.
>    Do not write code yet.

### Step B — Implement prompt

> Implement exactly the approved plan.
> Include tests, update OpenAPI, and update `docs/slices/<bolt>.workplan.md` with what changed.

This is the simplest “plan → verify → generate” loop you can enforce with Cursor.

---

## 5) Measurement (AI-DLC insists you track this)

Track per bolt:

* **Decision → PR merged time**
* **PR merged → deploy to staging time**
* **rework count** (how many times you re-open the same issue)
* **escaped defects** (anything found after merge)

Keep it in `PROGRESS_LOG.md` or a simple `docs/metrics.md`.

---

## 6) What not to do next

* Don’t start ORG + LEA + PRF + GAM in parallel. That’s how AI speed turns into chaos.
* Don’t expand endpoints/UI “because it’s easy now.” Lock scope per bolt.

---

If you want a very concrete next action: **start Bolt 0** by creating the three slice files (intent/acceptance/workplan) for “People Core hardening + CI baseline,” then run the Cursor two-step prompt to implement CI + demo seed + 2–3 integration tests. That will align everything you build next with AI-DLC.
