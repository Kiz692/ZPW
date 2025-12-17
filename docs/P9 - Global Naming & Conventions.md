## 1. Zimasa PeopleWell – Database Naming Conventions (PostgreSQL)

### 1.1 General

* **Engine:** PostgreSQL.
* **Case:** In documentation we show `UPPER_SNAKE_CASE` for tables/columns. In DDL we will **not** quote identifiers, so Postgres will store them as `lower_snake_case`.
* **Table naming:**
  `DOMAIN_PREFIX` + `'_'` + `ENTITY_NAME` (singular), e.g. `PID_PERSON`, `ORG_UNIT`, `LEA_LEAVE_REQUEST`.
* **Column naming:**
  `TBL_PREFIX` + `'_'` + `COLUMN_NAME`, e.g. `EMP_ID`, `EMP_TENANT_ID`, `EMP_HIRE_DATE`.
* **ID data types:**

  * Primary keys: `BIGINT` (using `GENERATED ALWAYS BY DEFAULT AS IDENTITY` or `BIGSERIAL`).
  * Foreign keys: `BIGINT` referencing the corresponding PK.

### 1.2 Multi-tenancy

* **Tenant table:** `SYS_TENANT` with PK `TEN_ID`.
* **Tenant-scoped tables:**

  * Must have `<TBL_PREFIX>_TENANT_ID BIGINT NOT NULL` referencing `SYS_TENANT(TEN_ID)`.
  * All queries must filter by `<TBL_PREFIX>_TENANT_ID` (enforced via app + RLS if used).
* **Global tables (platform-level):**

  * No tenant column (e.g. `PID_PERSON` if shared across platforms).
  * Tenant-scoped tables reference them via FK (`EMP_PERSON_ID` → `PID_PERSON.PER_ID`).

### 1.3 Primary & Foreign Keys

* **Primary key (every table):**

  * Name: `<TBL_PREFIX>_ID`
  * Type: `BIGINT` identity.
* **Tenant FK (tenant tables):**

  * Name: `<TBL_PREFIX>_TENANT_ID` → `SYS_TENANT(TEN_ID)`.
* **Other FKs:**

  * Pattern: `<TBL_PREFIX>_<REF_PREFIX>_ID`

    * Example: `EMP_PRM_POS_ID` referencing `ORG_POSITION.POS_ID`.
  * For many-to-many or join tables, use composite FKs with the same pattern.

### 1.4 Audit & Lifecycle Columns

Recommended standard columns on most business tables:

* `<TBL_PREFIX>_CREATED_AT TIMESTAMPTZ NOT NULL`
* `<TBL_PREFIX>_CREATED_BY BIGINT NULL` (→ `SYS_USER.USR_ID`)
* `<TBL_PREFIX>_UPDATED_AT TIMESTAMPTZ NULL`
* `<TBL_PREFIX>_UPDATED_BY BIGINT NULL`
* Optional soft delete:

  * `<TBL_PREFIX>_DELETED_AT TIMESTAMPTZ NULL`
  * `<TBL_PREFIX>_DELETED_BY BIGINT NULL`

### 1.5 Status & Enumerations

* Status-like fields use short codes with check constraints or lookup tables:

  * Example: `EMP_STATUS` (`'PLANNED' | 'ACTIVE' | 'PROBATION' | 'SUSPENDED' | 'EXITED'`).
* Where reuse across domains is high, consider small lookup tables (e.g. `SYS_LOOKUP`/per-domain lookup tables) instead of hard-coded enums.

---

## 2. Main Tables & Prefixes

> This is a **starter map** of the main entities per domain, with proposed 3-letter table prefixes for columns.

| Domain            | Table Name                      | Table Prefix | Description                                                                       |
| ----------------- | ------------------------------- | ------------ | --------------------------------------------------------------------------------- |
| System / Shared   | `SYS_TENANT`                    | `TEN`        | Tenants/customers of PeopleWell (row-level multi-tenancy boundary).               |
| System / Shared   | `SYS_USER`                      | `USR`        | Application user accounts (login identity, can belong to one or more tenants).    |
| System / Shared   | `SYS_ROLE`                      | `ROL`        | Roles (Employee, Manager, HR, Admin, Exec, etc.).                                 |
| System / Shared   | `SYS_USER_ROLE`                 | `URL`        | Join table between users and roles per tenant.                                    |
| People & Identity | `PID_PERSON`                    | `PER`        | Global person identity (name, DOB, IDs, contacts) shared across Zimasa products.  |
| People & Identity | `PID_EMPLOYEE`                  | `EMP`        | Employee record per tenant, linked to `PID_PERSON`.                               |
| People & Identity | `PID_DEPENDENT`                 | `DEP`        | Employee dependents (spouse/children/other) for wellness eligibility.             |
| People & Identity | `PID_QUALIFICATION`             | `QLF`        | Education / professional qualifications associated with a Person.                 |
| People & Identity | `PID_EMPLOYMENT_HISTORY`        | `PEH`        | Prior employment summaries for a Person (employer, role, dates).                  |
| People & Identity | `PID_EMP_CONTRACT`              | `CTR`        | Employment contract records per Employee (type, dates, status).                   |
| People & Identity | `PID_WELLNESS_PROFILE`          | `WEP`        | Wellness engagement profile per Employee (consent, channels, tags).               |
| Org & Jobs        | `ORG_UNIT`                      | `UNT`        | Organisational units (company, department, team, cost centre).                    |
| Org & Jobs        | `ORG_JOB_ROLE`                  | `JBR`        | Abstract job roles (title, family, level, responsibilities).                      |
| Org & Jobs        | `ORG_JOB_REQUIREMENT`           | `JRE`        | Simple job requirements per Job Role (skills, qualifications, experience).        |
| Org & Jobs        | `ORG_POSITION`                  | `POS`        | Concrete positions/seats in the org, linked to Org Unit & Job Role.               |
| Org & Jobs        | `ORG_POSITION_ASSIGNMENT`       | `PAS`        | Employee–Position assignments with history (primary/secondary).                   |
| Leave & Absence   | `LEA_LEAVE_TYPE`                | `LTP`        | Configurable leave types (annual, sick, wellness, etc.).                          |
| Leave & Absence   | `LEA_LEAVE_POLICY`              | `LPL`        | Simple accrual & entitlement policies per tenant and leave type.                  |
| Leave & Absence   | `LEA_LEAVE_PERIOD`              | `LPD`        | Active leave period (calendar/fiscal year) per tenant.                            |
| Leave & Absence   | `LEA_LEAVE_BALANCE`             | `LBA`        | Per-employee, per-type, per-period leave balances.                                |
| Leave & Absence   | `LEA_LEAVE_REQUEST`             | `LRQ`        | Leave requests submitted by employees (type, dates, status).                      |
| Leave & Absence   | `LEA_ROSTER_RULE`               | `LRR`        | Simple staffing/capacity rules per Org Unit (min staff, max concurrent leave).    |
| Leave & Absence   | `LEA_RECOVERY_INDEX`            | `RIX`        | Computed Recovery Index snapshots per employee and period.                        |
| Performance       | `PRF_PERF_CYCLE`                | `PCL`        | Performance cycles (H1, H2, etc.) with start/end, status.                         |
| Performance       | `PRF_PERF_TEMPLATE`             | `PTM`        | Performance templates (sections, weights) per role/family.                        |
| Performance       | `PRF_PERF_SECTION`              | `PSC`        | Sections within a performance template (KPIs, OKRs, Values, etc.).                |
| Performance       | `PRF_PERF_QUESTION`             | `PQS`        | Questions for narrative/behavioural sections in templates.                        |
| Performance       | `PRF_PERF_APPRAISAL`            | `PAP`        | Appraisal instance per employee per cycle, referencing a template.                |
| Performance       | `PRF_PERF_ANSWER`               | `PAN`        | Answers/ratings/comments for each appraisal question (self/manager/final).        |
| Performance       | `PRF_PERF_KPI`                  | `PKP`        | KPI items per appraisal section.                                                  |
| Performance       | `PRF_PERF_OKR`                  | `POK`        | OKR/initiative items per appraisal section.                                       |
| Performance       | `PRF_PERF_ACTION`               | `PAC`        | Growth and wellness actions agreed at appraisal finalisation.                     |
| Performance       | `PRF_CHECKIN`                   | `CHK`        | 1:1 check-in records with energy/workload/stress indicators.                      |
| Gamification      | `GAM_PROFILE`                   | `GPR`        | Gamification profile per employee (current points, level).                        |
| Gamification      | `GAM_POINTS_TXN`                | `GPT`        | Points transactions (earn events) linked to behaviours/actions.                   |
| Gamification      | `GAM_LEVEL_DEF`                 | `GLD`        | Level definitions and thresholds (Getting Started, Steady, Thriving).             |
| Gamification      | `GAM_CHALLENGE_DEF`             | `GCD`        | Team challenge definitions (Quarter of Recovery, etc.).                           |
| Gamification      | `GAM_CHALLENGE_PARTICIPATION`   | `GCP`        | Team/employee participation and completion state for challenges.                  |
| Gamification      | `GAM_MANAGER_SCORECARD`         | `GMS`        | Manager health stewardship scorecard aggregates per period.                       |
| Gamification      | `GAM_BADGE`                     | `GBD`        | Badge definitions (Recovery Planner, Reflection Champion, etc.).                  |
| Gamification      | `GAM_BADGE_AWARD`               | `GBA`        | Awarded badges per employee and event.                                            |
| AI / Conversation | `AIS_CONVERSATION`              | `ACV`        | Conversation sessions with copilots (Employee/Manager).                           |
| AI / Conversation | `AIS_MESSAGE`                   | `AMS`        | Individual messages/turns within a conversation (user vs AI).                     |
| AI / Conversation | `AIS_HR_REQUEST`                | `AHR`        | Generic HR requests submitted by employees/managers.                              |
| AI / Conversation | `AIS_HR_REQUEST_CLASSIFICATION` | `AHC`        | AI classification results for HR requests (type, confidence, suggested assignee). |
| AI / Conversation | `AIS_AI_FEEDBACK`               | `AFB`        | User feedback on AI outputs (helpful/not helpful, corrections).                   |

If you’re happy with these conventions and prefixes, next step is to pick a subset (e.g. `PID_EMPLOYEE`, `ORG_POSITION`, `LEA_LEAVE_REQUEST`, `PRF_PERF_APPRAISAL`) and I can generate **DBML skeletons** that follow this scheme.
