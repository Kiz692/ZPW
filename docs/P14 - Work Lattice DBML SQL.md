Here’s a PostgreSQL SQL script for the **Work Lattice (Org & Jobs)** domain, based on the final DBML.

Assumptions:

* **PostgreSQL** (9.5+).
* **Idempotent-ish** for initial creation:

  * Uses `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`.
  * Does **not** handle schema migrations (changes to existing tables).
* Includes **stubs** for `sys_tenant` and `pid_employee`. In a full system, these should be owned by the System / People Core domains and this script run **after** those, or the stubs removed.

---

```sql
-- =========================================================
-- Domain: Work Lattice (Org & Jobs)
-- =========================================================

-- =========================================================
-- System / Shared stubs (for FK references)
-- In a full deployment, these should be defined in the
-- System / People Core domains and these CREATEs can be
-- removed or left as IF NOT EXISTS no-ops.
-- =========================================================

CREATE TABLE IF NOT EXISTS sys_tenant (
    ten_id   BIGSERIAL PRIMARY KEY,
    ten_name VARCHAR(200) NOT NULL
);

COMMENT ON TABLE sys_tenant IS 'Tenant table (stub; full definition lives in System / Shared domain).';
COMMENT ON COLUMN sys_tenant.ten_id IS 'Primary key for tenant.';
COMMENT ON COLUMN sys_tenant.ten_name IS 'Display name of the tenant.';

CREATE TABLE IF NOT EXISTS pid_employee (
    emp_id        BIGSERIAL PRIMARY KEY,
    emp_tenant_id BIGINT NOT NULL REFERENCES sys_tenant(ten_id)
);

COMMENT ON TABLE pid_employee IS 'Employee table (stub; full definition lives in People & Identity domain).';
COMMENT ON COLUMN pid_employee.emp_id IS 'Primary key for employee.';
COMMENT ON COLUMN pid_employee.emp_tenant_id IS 'Tenant owning this employee record.';

-- =========================================================
-- Org & Jobs – Work Lattice tables
-- =========================================================

-- ---------------------------------------------------------
-- org_unit: Organisational units (company, department, team, cost centre)
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS org_unit (
    unt_id             BIGSERIAL PRIMARY KEY,
    unt_tenant_id      BIGINT      NOT NULL REFERENCES sys_tenant(ten_id),

    unt_code           VARCHAR(50)  NOT NULL,
    unt_name           VARCHAR(200) NOT NULL,
    unt_display_name   VARCHAR(255),
    unt_type_code      VARCHAR(50)  NOT NULL, -- COMPANY, DEPARTMENT, TEAM, COST_CENTER, etc.
    unt_parent_unt_id  BIGINT       REFERENCES org_unit(unt_id),
    unt_effective_from DATE         NOT NULL,
    unt_effective_to   DATE,

    unt_created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    unt_created_by     BIGINT,
    unt_updated_at     TIMESTAMPTZ,
    unt_updated_by     BIGINT,
    unt_deleted_at     TIMESTAMPTZ,
    unt_deleted_by     BIGINT
);

COMMENT ON TABLE org_unit IS 'Organisational units forming a tenant-scoped hierarchy via unt_parent_unt_id.';
COMMENT ON COLUMN org_unit.unt_tenant_id IS 'Tenant to which this org unit belongs.';
COMMENT ON COLUMN org_unit.unt_code IS 'Tenant-unique org unit code.';
COMMENT ON COLUMN org_unit.unt_name IS 'Org unit name (e.g. Finance, Sales).';
COMMENT ON COLUMN org_unit.unt_display_name IS 'Optional denormalised display/path name for reporting.';
COMMENT ON COLUMN org_unit.unt_type_code IS 'Org unit type (COMPANY, DEPARTMENT, TEAM, COST_CENTER, etc).';
COMMENT ON COLUMN org_unit.unt_parent_unt_id IS 'Parent org unit for hierarchy.';
COMMENT ON COLUMN org_unit.unt_effective_from IS 'Date this org unit becomes effective.';
COMMENT ON COLUMN org_unit.unt_effective_to IS 'Optional date this org unit is retired.';

-- Indexes for org_unit
CREATE INDEX IF NOT EXISTS idx_unt_tenant_id
    ON org_unit (unt_tenant_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_unt_tenant_code
    ON org_unit (unt_tenant_id, unt_code);

CREATE INDEX IF NOT EXISTS idx_unt_tenant_parent
    ON org_unit (unt_tenant_id, unt_parent_unt_id);

CREATE INDEX IF NOT EXISTS idx_unt_tenant_type
    ON org_unit (unt_tenant_id, unt_type_code);

CREATE INDEX IF NOT EXISTS idx_unt_tenant_name
    ON org_unit (unt_tenant_id, unt_name);

-- ---------------------------------------------------------
-- org_job_role: Abstract job roles (title, family, level, summary)
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS org_job_role (
    jbr_id         BIGSERIAL PRIMARY KEY,
    jbr_tenant_id  BIGINT       NOT NULL REFERENCES sys_tenant(ten_id),

    jbr_code       VARCHAR(50)  NOT NULL,
    jbr_name       VARCHAR(200) NOT NULL,
    jbr_family     VARCHAR(100),
    jbr_level_band VARCHAR(50),
    jbr_summary    TEXT,

    jbr_created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    jbr_created_by BIGINT,
    jbr_updated_at TIMESTAMPTZ,
    jbr_updated_by BIGINT,
    jbr_deleted_at TIMESTAMPTZ,
    jbr_deleted_by BIGINT
);

COMMENT ON TABLE org_job_role IS 'Canonical job roles reused across positions, perf templates, and L&D planning.';
COMMENT ON COLUMN org_job_role.jbr_tenant_id IS 'Tenant to which this job role definition belongs.';
COMMENT ON COLUMN org_job_role.jbr_code IS 'Tenant-unique job role code.';
COMMENT ON COLUMN org_job_role.jbr_name IS 'Job role name (e.g. Software Engineer).';
COMMENT ON COLUMN org_job_role.jbr_family IS 'Role family (ENGINEERING, SALES, etc).';
COMMENT ON COLUMN org_job_role.jbr_level_band IS 'Level/band code (L1, L2, SENIOR, etc).';

-- Indexes for org_job_role
CREATE INDEX IF NOT EXISTS idx_jbr_tenant_id
    ON org_job_role (jbr_tenant_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_jbr_tenant_code
    ON org_job_role (jbr_tenant_id, jbr_code);

CREATE INDEX IF NOT EXISTS idx_jbr_tenant_family
    ON org_job_role (jbr_tenant_id, jbr_family);

CREATE INDEX IF NOT EXISTS idx_jbr_tenant_name
    ON org_job_role (jbr_tenant_id, jbr_name);

CREATE INDEX IF NOT EXISTS idx_jbr_tenant_family_level
    ON org_job_role (jbr_tenant_id, jbr_family, jbr_level_band);

-- ---------------------------------------------------------
-- org_job_requirement: Job requirements per role
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS org_job_requirement (
    jre_id                  BIGSERIAL PRIMARY KEY,
    jre_tenant_id           BIGINT      NOT NULL REFERENCES sys_tenant(ten_id),
    jre_jbr_id              BIGINT      NOT NULL REFERENCES org_job_role(jbr_id),

    jre_min_qual_level_code VARCHAR(50), -- DEGREE, DIPLOMA, etc.
    jre_desired_years_exp   INT,

    jre_created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    jre_created_by          BIGINT,
    jre_updated_at          TIMESTAMPTZ,
    jre_updated_by          BIGINT,
    jre_deleted_at          TIMESTAMPTZ,
    jre_deleted_by          BIGINT
);

COMMENT ON TABLE org_job_requirement IS 'One requirement row per job role, extended by skills in org_job_skill.';
COMMENT ON COLUMN org_job_requirement.jre_tenant_id IS 'Tenant owning this requirement definition.';
COMMENT ON COLUMN org_job_requirement.jre_jbr_id IS 'Job role this requirement belongs to.';
COMMENT ON COLUMN org_job_requirement.jre_min_qual_level_code IS 'Minimum qualification level expected.';
COMMENT ON COLUMN org_job_requirement.jre_desired_years_exp IS 'Desired total years of experience.';

-- Indexes for org_job_requirement
CREATE INDEX IF NOT EXISTS idx_jre_tenant_id
    ON org_job_requirement (jre_tenant_id);

CREATE INDEX IF NOT EXISTS idx_jre_jbr_id
    ON org_job_requirement (jre_jbr_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_jre_role
    ON org_job_requirement (jre_tenant_id, jre_jbr_id);

-- ---------------------------------------------------------
-- org_job_skill: Skills under a job requirement
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS org_job_skill (
    jsk_id           BIGSERIAL PRIMARY KEY,
    jsk_tenant_id    BIGINT       NOT NULL REFERENCES sys_tenant(ten_id),
    jsk_jre_id       BIGINT       NOT NULL REFERENCES org_job_requirement(jre_id),

    jsk_skill_code   VARCHAR(100) NOT NULL, -- e.g. JAVA, STAKEHOLDER_MGMT
    jsk_level_code   VARCHAR(50),          -- BASIC, INTERMEDIATE, ADVANCED
    jsk_is_mandatory BOOLEAN      NOT NULL DEFAULT TRUE,

    jsk_created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    jsk_created_by   BIGINT,
    jsk_updated_at   TIMESTAMPTZ,
    jsk_updated_by   BIGINT,
    jsk_deleted_at   TIMESTAMPTZ,
    jsk_deleted_by   BIGINT
);

COMMENT ON TABLE org_job_skill IS 'Skills attached to a job requirement; tenant defines its own skill codes and levels.';
COMMENT ON COLUMN org_job_skill.jsk_tenant_id IS 'Tenant owning this skill requirement.';
COMMENT ON COLUMN org_job_skill.jsk_jre_id IS 'Job requirement that this skill belongs to.';
COMMENT ON COLUMN org_job_skill.jsk_skill_code IS 'Skill code (e.g. JAVA, STAKEHOLDER_MGMT).';
COMMENT ON COLUMN org_job_skill.jsk_is_mandatory IS 'Whether this skill is mandatory for the role.';

-- Indexes for org_job_skill
CREATE INDEX IF NOT EXISTS idx_jsk_tenant_id
    ON org_job_skill (jsk_tenant_id);

CREATE INDEX IF NOT EXISTS idx_jsk_jre_id
    ON org_job_skill (jsk_jre_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_jsk_req_skill
    ON org_job_skill (jsk_tenant_id, jsk_jre_id, jsk_skill_code);

CREATE INDEX IF NOT EXISTS idx_jsk_tenant_skill
    ON org_job_skill (jsk_tenant_id, jsk_skill_code);

-- ---------------------------------------------------------
-- org_position: Concrete positions/seats
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS org_position (
    pos_id               BIGSERIAL PRIMARY KEY,
    pos_tenant_id        BIGINT       NOT NULL REFERENCES sys_tenant(ten_id),

    pos_code             VARCHAR(50)  NOT NULL,
    pos_title            VARCHAR(200) NOT NULL,
    pos_unt_id           BIGINT       NOT NULL REFERENCES org_unit(unt_id),
    pos_jbr_id           BIGINT       NOT NULL REFERENCES org_job_role(jbr_id),
    pos_primary_pos_id   BIGINT       REFERENCES org_position(pos_id),
    pos_secondary_pos_id BIGINT       REFERENCES org_position(pos_id),

    pos_effective_from   DATE         NOT NULL,
    pos_effective_to     DATE,

    pos_created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    pos_created_by       BIGINT,
    pos_updated_at       TIMESTAMPTZ,
    pos_updated_by       BIGINT,
    pos_deleted_at       TIMESTAMPTZ,
    pos_deleted_by       BIGINT
);

COMMENT ON TABLE org_position IS 'Concrete positions/seats linked to org units & job roles; hold reporting lines via primary/secondary reports-to.';
COMMENT ON COLUMN org_position.pos_tenant_id IS 'Tenant to which this position belongs.';
COMMENT ON COLUMN org_position.pos_code IS 'Tenant-unique position code/identifier.';
COMMENT ON COLUMN org_position.pos_unt_id IS 'Org unit that hosts this position.';
COMMENT ON COLUMN org_position.pos_jbr_id IS 'Job role that this position instantiates.';
COMMENT ON COLUMN org_position.pos_primary_pos_id IS 'Primary reports-to position.';
COMMENT ON COLUMN org_position.pos_secondary_pos_id IS 'Secondary (dotted-line) reports-to position.';

-- Indexes for org_position
CREATE INDEX IF NOT EXISTS idx_pos_tenant_id
    ON org_position (pos_tenant_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pos_tenant_code
    ON org_position (pos_tenant_id, pos_code);

CREATE INDEX IF NOT EXISTS idx_pos_tenant_unit
    ON org_position (pos_tenant_id, pos_unt_id);

CREATE INDEX IF NOT EXISTS idx_pos_tenant_role
    ON org_position (pos_tenant_id, pos_jbr_id);

CREATE INDEX IF NOT EXISTS idx_pos_tenant_primary_pos
    ON org_position (pos_tenant_id, pos_primary_pos_id);

CREATE INDEX IF NOT EXISTS idx_pos_tenant_secondary_pos
    ON org_position (pos_tenant_id, pos_secondary_pos_id);

-- ---------------------------------------------------------
-- org_position_assignment: Employee–Position assignments
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS org_position_assignment (
    pas_id                   BIGSERIAL PRIMARY KEY,
    pas_tenant_id            BIGINT      NOT NULL REFERENCES sys_tenant(ten_id),
    pas_emp_id               BIGINT      NOT NULL REFERENCES pid_employee(emp_id),
    pas_pos_id               BIGINT      NOT NULL REFERENCES org_position(pos_id),

    pas_assignment_type_code VARCHAR(50) NOT NULL, -- PRIMARY, SECONDARY, TEMP, etc.
    pas_start_date           DATE        NOT NULL,
    pas_end_date             DATE,
    pas_is_current           BOOLEAN     NOT NULL DEFAULT TRUE,

    pas_created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    pas_created_by           BIGINT,
    pas_updated_at           TIMESTAMPTZ,
    pas_updated_by           BIGINT,
    pas_deleted_at           TIMESTAMPTZ,
    pas_deleted_by           BIGINT
);

COMMENT ON TABLE org_position_assignment IS 'Employee–position assignments with full history and primary/secondary type.';
COMMENT ON COLUMN org_position_assignment.pas_tenant_id IS 'Tenant to which this assignment belongs.';
COMMENT ON COLUMN org_position_assignment.pas_emp_id IS 'Employee assigned to the position.';
COMMENT ON COLUMN org_position_assignment.pas_pos_id IS 'Assigned position.';
COMMENT ON COLUMN org_position_assignment.pas_assignment_type_code IS 'PRIMARY, SECONDARY, TEMP, etc.';
COMMENT ON COLUMN org_position_assignment.pas_is_current IS 'Indicates whether this assignment is currently active.';

-- Indexes for org_position_assignment
CREATE INDEX IF NOT EXISTS idx_pas_tenant_id
    ON org_position_assignment (pas_tenant_id);

CREATE INDEX IF NOT EXISTS idx_pas_tenant_emp
    ON org_position_assignment (pas_tenant_id, pas_emp_id);

CREATE INDEX IF NOT EXISTS idx_pas_tenant_pos
    ON org_position_assignment (pas_tenant_id, pas_pos_id);

CREATE INDEX IF NOT EXISTS idx_pas_tenant_emp_current
    ON org_position_assignment (pas_tenant_id, pas_emp_id, pas_is_current);

CREATE INDEX IF NOT EXISTS idx_pas_emp_pos_start
    ON org_position_assignment (pas_tenant_id, pas_emp_id, pas_pos_id, pas_start_date);

-- Optional: in a later migration you can enforce at most one CURRENT PRIMARY assignment per employee via:
-- CREATE UNIQUE INDEX IF NOT EXISTS uq_pas_primary_current
--   ON org_position_assignment (pas_tenant_id, pas_emp_id)
--   WHERE pas_assignment_type_code = 'PRIMARY' AND pas_is_current = TRUE;
```

---

### Notes on Cross-Domain Dependencies

* **`sys_tenant`**

  * This script includes a **stub** definition for `sys_tenant`.
  * In your full schema, `sys_tenant` should be defined once in the **System / Shared** domain.
  * When composing all domains together, either:

    * Run the System migration first (which defines `sys_tenant`), then remove the stub from this script, or
    * Keep the `IF NOT EXISTS` but ensure the real definition is compatible (same PK columns and types).

* **`pid_employee`**

  * Also included as a **stub** here.
  * In the full system, `pid_employee` should be owned by the **People & Identity (People Core)** domain.
  * Same strategy: either remove the stub when applying full migrations, or rely on `IF NOT EXISTS` with a compatible definition.
