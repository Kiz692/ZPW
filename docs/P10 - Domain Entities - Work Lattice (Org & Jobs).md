## 1. Entities, Purpose & Attributes

### 1. ORG_UNIT

**Purpose**

* Represent the organisational structure of a tenant (companies, departments, teams, cost centres).
* Support multi-level hierarchy (parent–child).
* Support multi-company/group structures via multiple top-level units.

**Key attributes (business-level)**

* Tenant context

  * Tenant id (links to SYS_TENANT)
* Identity & naming

  * Org unit code (unique per tenant)
  * Org unit name
  * Org unit type (e.g. Company, Department, Team, Cost Centre) – likely a code + label
* Hierarchy & structure

  * Parent Org Unit reference (nullable for top-level)
  * Optional “root company” reference if you want to distinguish company vs sub-units later (can also be implied)
* Lifecycle

  * Effective from date
  * Effective to date (nullable, open-ended = active)
  * Status (Active / Inactive) – optional, can be derived from dates

**Multi-tenant?** Yes – scoped per tenant.

---

### 2. ORG_JOB_ROLE

**Purpose**

* Represent abstract job roles (e.g. “Software Engineer”, “HR Business Partner”) independent of specific seats.
* Serve as the canonical “role” used across positions, performance templates, and L&D planning.

**Key attributes**

* Tenant context

  * Tenant id
* Identity & naming

  * Role code (unique per tenant)
  * Role name/title
* Classification

  * Job family (text/code; e.g. Engineering, Sales, HR)
  * Level/band (text/code; e.g. L1/L2, Junior/Mid/Senior)
* Description

  * Role summary / key responsibilities (rich text/long text)
* Lifecycle

  * Active flag or effective from/to dates

**Multi-tenant?** Yes.

---

### 3. ORG_JOB_REQUIREMENT

**Purpose**

* Attach high-level requirements to a Job Role, without building a full ATS.
* Serve as context for performance & development conversations.

**Key attributes**

* Tenant context

  * Tenant id
* Relationship

  * Linked Job Role id (FK to ORG_JOB_ROLE)
* Requirements content

  * Minimum qualification level (e.g. Degree, Diploma – can be text or code)
  * Desired years of experience (numeric)
  * Key skills tags (could be stored as:

    * simple delimited string; or
    * separate child table for skills per role if you want more normalization)
* Lifecycle

  * Effective from/to (optional) if you want to evolve requirements over time.

**Multi-tenant?** Yes (inherited via JobRole + own tenant id).

> Note: You could model this either as **one row per role** (wide row) or **multiple rows per role** (e.g. one row per requirement type). MVP can keep it simple: one row per role, encapsulating all three requirement categories.

---

### 4. ORG_POSITION

**Purpose**

* Represent a concrete “seat” in the organisation (e.g. “Software Engineer – Team A”, “Finance Manager – Kenya”).
* Link Org Unit and Job Role.
* Store reporting lines (primary and optional secondary).

**Key attributes**

* Tenant context

  * Tenant id
* Identity & naming

  * Position code (unique per tenant)
  * Position title (can default from Job Role but overridable)
* Relationships

  * Org Unit id (FK to ORG_UNIT)
  * Job Role id (FK to ORG_JOB_ROLE)
  * Primary reports-to Position id (FK to ORG_POSITION; not null for non-top positions)
  * Secondary reports-to Position id (FK to ORG_POSITION; nullable)
* Attributes

  * FTE / capacity (optional numeric; useful if you later model multi-incumbent positions)
  * Location (optional; may also be implied by Org Unit)
* Lifecycle

  * Effective from/to (dates)
  * Status (Active / Frozen / Closed) – can be optional in MVP

**Multi-tenant?** Yes.

---

### 5. ORG_POSITION_ASSIGNMENT

**Purpose**

* Capture which Employee occupies which Position, with full history.
* Distinguish primary vs secondary assignments (for matrix/shared services).

**Key attributes**

* Tenant context

  * Tenant id
* Relationships

  * Employee id (FK to PID_EMPLOYEE – cross-domain)
  * Position id (FK to ORG_POSITION)
* Assignment details

  * Assignment type: Primary / Secondary (code)
  * Start date
  * End date (nullable for active)
* Lifecycle & flags

  * Current flag (Y/N) – optional but convenient for fast queries
  * Reason (e.g. New Hire, Promotion, Transfer, Secondment) – optional code/label

**Multi-tenant?** Yes.

> Cross-domain note: Employee lives in **People & Identity** domain (`PID_EMPLOYEE`), but this entity is firmly in Work Lattice. FK is cross-domain.

---

### 6. (Optional) ORG_ORG_UNIT_TYPE (if you want a dedicated lookup)

**Purpose**

* Standardise Org Unit types across tenants or per tenant (depending on design).

**Key attributes (if you choose to create it)**

* Global vs tenant-scoped decision:

  * Could be **global** (same types for all tenants) OR **per-tenant** if you foresee per-tenant customisation.
* Fields:

  * Code (DEPARTMENT, TEAM, COMPANY, COST_CENTER, etc.)
  * Name/label
  * Description

**Multi-tenant?**

* If global: No (no tenant id).
* If tenant customisable: Yes.

For MVP you could **avoid this table** and just use a constrained code column on ORG_UNIT. I’ll flag it below.

---

### 7. (Optional) ORG_JOB_FAMILY / ORG_JOB_LEVEL (if wanted as lookups)

**Purpose**

* Provide controlled vocabularies for role families & levels.

Given your SME target + MVP, they can start as:

* Simple code/text columns on ORG_JOB_ROLE, or
* Later extracted into lookup tables if needed.

For now, I’d keep them **as fields on ORG_JOB_ROLE**, not separate entities.

---

## 2. Relationships

Core relationships within the Work Lattice domain:

1. **Org Unit hierarchy**

   * `ORG_UNIT (parent)` 1 ──── * `ORG_UNIT (child)`
   * A unit may have 0..1 parent; a parent unit can have many children.

2. **Org Unit to Position**

   * `ORG_UNIT` 1 ──── * `ORG_POSITION`
   * Each Position belongs to exactly one Org Unit.

3. **Job Role to Position**

   * `ORG_JOB_ROLE` 1 ──── * `ORG_POSITION`
   * A Role can be instantiated as multiple Positions.

4. **Job Role to Job Requirement**

   * `ORG_JOB_ROLE` 1 ──── 0..1 `ORG_JOB_REQUIREMENT` (in the “one row per role” design)
   * Or 1 ──── * if you later split into multiple requirement rows.

5. **Position to Position (reporting lines)**

   * `ORG_POSITION` 1 ──── * `ORG_POSITION` as primary “reports-to” (via POS_PRIMARY_REPORTS_TO_ID).
   * Optionally another 1 ──── * via POS_SECONDARY_REPORTS_TO_ID (secondary reporting line).

6. **Employee to PositionAssignment (cross-domain)**

   * `PID_EMPLOYEE` 1 ──── * `ORG_POSITION_ASSIGNMENT`
   * An Employee can have multiple assignments (history, concurrent secondary roles).

7. **Position to PositionAssignment**

   * `ORG_POSITION` 1 ──── * `ORG_POSITION_ASSIGNMENT`
   * A Position may be empty (no current assignment), single-occupant, or (if you allow) multiple incumbents.

8. **Tenant scoping**

   * All ORG_* tables (UNIT, JOB_ROLE, JOB_REQUIREMENT, POSITION, POSITION_ASSIGNMENT) reference `SYS_TENANT`.

---

## 3. Entities that Might Belong Elsewhere / Overlap

**Belongs in other domains**

* `PID_EMPLOYEE` – clearly **People & Identity** domain. Only referenced here.
* Lookups like org unit type, job family, job level:

  * Could be:

    * simple enums / constrained codes in ORG_ tables, or
    * centralised **System/Shared lookup** domain if you want cross-domain reuse.

**Potential overlaps / merge candidates**

* **ORG_JOB_ROLE & ORG_JOB_REQUIREMENT**

  * You *could* merge them into a single ORG_JOB_ROLE with extra fields for requirements (min qualification, years, skills tags).
  * Keeping ORG_JOB_REQUIREMENT separate makes sense if you foresee:

    * Multiple requirement versions over time;
    * Separate UIs for requirements vs role description.
  * For MVP I’d choose:

    * **Keep them separate** but with a strict 1:1 relation (one requirement row per role), to keep options open without complicating queries.

* **ORG_UNIT_TYPE and JobFamily/Level lookups**

  * These don’t need separate entities in MVP.
  * You can start with `UNT_TYPE_CODE`, `JBR_FAMILY`, `JBR_LEVEL_BAND` as coded fields on the main tables.
  * If/when tenants want to customise vocabularies deeply, promote them to lookup tables.

---

## 4. Mermaid Class Diagram (Domain View)

Here’s a Mermaid `classDiagram` capturing the core domain (with a stub for Employee):

```mermaid
classDiagram
    class SYS_TENANT {
      +TEN_ID
      +TEN_NAME
    }

    class PID_EMPLOYEE {
      +EMP_ID
      +EMP_TENANT_ID
      ... // from People domain
    }

    class ORG_UNIT {
      +UNT_ID
      +UNT_TENANT_ID
      +UNT_CODE
      +UNT_NAME
      +UNT_TYPE_CODE
      +UNT_PARENT_UNT_ID
      +UNT_EFFECTIVE_FROM
      +UNT_EFFECTIVE_TO
    }

    class ORG_JOB_ROLE {
      +JBR_ID
      +JBR_TENANT_ID
      +JBR_CODE
      +JBR_NAME
      +JBR_FAMILY
      +JBR_LEVEL_BAND
      +JBR_SUMMARY
    }

    class ORG_JOB_REQUIREMENT {
      +JRE_ID
      +JRE_TENANT_ID
      +JRE_JBR_ID
      +JRE_MIN_QUAL_LEVEL
      +JRE_DESIRED_YEARS_EXP
      +JRE_SKILLS_TAGS
    }

    class ORG_POSITION {
      +POS_ID
      +POS_TENANT_ID
      +POS_CODE
      +POS_TITLE
      +POS_UNT_ID
      +POS_JBR_ID
      +POS_PRIMARY_POS_ID
      +POS_SECONDARY_POS_ID
      +POS_EFFECTIVE_FROM
      +POS_EFFECTIVE_TO
    }

    class ORG_POSITION_ASSIGNMENT {
      +PAS_ID
      +PAS_TENANT_ID
      +PAS_EMP_ID
      +PAS_POS_ID
      +PAS_ASSIGNMENT_TYPE
      +PAS_START_DATE
      +PAS_END_DATE
      +PAS_IS_CURRENT
    }

    SYS_TENANT "1" <-- "many" ORG_UNIT : tenant
    SYS_TENANT "1" <-- "many" ORG_JOB_ROLE : tenant
    SYS_TENANT "1" <-- "many" ORG_JOB_REQUIREMENT : tenant
    SYS_TENANT "1" <-- "many" ORG_POSITION : tenant
    SYS_TENANT "1" <-- "many" ORG_POSITION_ASSIGNMENT : tenant

    ORG_UNIT "1" <-- "many" ORG_UNIT : parent-child
    ORG_UNIT "1" <-- "many" ORG_POSITION : positions

    ORG_JOB_ROLE "1" <-- "many" ORG_POSITION : has positions
    ORG_JOB_ROLE "1" <-- "1" ORG_JOB_REQUIREMENT : has requirements

    ORG_POSITION "1" <-- "many" ORG_POSITION : primary reports-to
    ORG_POSITION "1" <-- "many" ORG_POSITION : secondary reports-to

    PID_EMPLOYEE "1" <-- "many" ORG_POSITION_ASSIGNMENT : employee assignments
    ORG_POSITION "1" <-- "many" ORG_POSITION_ASSIGNMENT : position assignments

