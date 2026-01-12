# Bolt 0: People Core Hardening + CI Baseline — Work Plan

**AI-DLC Bolt**: 0 (Retrofit/Hardening)

---

## 1) Timeline (1–2 days)

- Day 1: Mob elaboration + construction block 1
- Day 2: Construction block 2 + verification

---

## 2) Mob elaboration (60–90 minutes)

**Attendees**
- Product/PM
- Lead dev
- QA
- DevOps / ops / security rep

**Outputs (commit these files)**
- `docs/slices/BOLT-0-people-core-hardening.intent.md`
- `docs/slices/BOLT-0-people-core-hardening.acceptance.md`
- `docs/slices/BOLT-0-people-core-hardening.workplan.md`

**Decisions to lock**
- the exact 2–3 critical flows
- what “demo seed complete” means (minimum dataset)
- CI gate stages and failure policy
- what constitutes “production” for auth guard enforcement

---

## 3) Mob construction — Block 1 (2–4 hours) — CI baseline + test harness skeleton

**Deliverables**
- CI pipeline that runs on every PR (lint → typecheck → unit tests → migration check)
- integration test harness skeleton wired into CI

**Acceptance checkpoints**
- CI runs on PRs and fails on lint/type errors
- unit tests run in CI
- migration check runs in CI

---

## 4) Mob construction — Block 2 (2–4 hours) — Critical flows + auth guard + demo seed

**Deliverables**
- 2–3 integration tests that cover the agreed critical flows
- auth safety guard: `SKIP_AUTH=true` cannot run in production
- demo seed: `db:seed:demo` creates a tenant + sample org + sample people

**Acceptance checkpoints**
- critical flow tests pass consistently (locally + CI)
- auth guard fails fast with clear message in production conditions
- demo seed runs from scratch and produces a usable environment

---

## 5) Verification (30–60 minutes)

**Run locally once**
- run the CI-equivalent checks locally
- run demo seed
- execute smoke checklist / critical flows

**Docs updates**
- update release checklist
- update API runbook

---

## 6) Result

At the end of Bolt 0 the repo should function as a **predictable delivery system**:

- CI gates enforced
- critical flows protected by integration tests
- auth bypass cannot ship
- demo environments are repeatable
- docs reflect operational reality
