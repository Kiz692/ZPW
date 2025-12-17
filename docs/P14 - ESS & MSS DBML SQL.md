```sql
-- ========================================================
-- Domain: ESS & MSS
-- Scope: Person, Employee, field metadata & ESS/MSS rules
--
-- Assumption: this migration runs on a clean schema where
-- these tables do not yet exist. If you already have
-- canonical System / Shared, Work Lattice, Rhythms,
-- Growth Signals, Gamification, or AI tables, you should
-- reconcile/merge these stubs instead of creating them.
-- ========================================================


-- --------------------------------------------------------
-- System / Shared
-- --------------------------------------------------------

CREATE TABLE sys_tenant (
    ten_id   BIGSERIAL PRIMARY KEY,
    ten_name VARCHAR(200) NOT NULL
);

COMMENT ON TABLE sys_tenant IS 'Tenant table (row-level multi-tenancy boundary; full definition in System / Shared domain).';


CREATE TABLE sys_user (
    usr_id          BIGSERIAL PRIMARY KEY,
    usr_username    VARCHAR(150) NOT NULL,
    usr_status_code VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    usr_created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    usr_updated_at  TIMESTAMPTZ
);

ALTER TABLE sys_user
    ADD CONSTRAINT uq_usr_username UNIQUE (usr_username);

CREATE INDEX idx_sys_user_status
    ON sys_user (usr_status_code);

COMMENT ON TABLE sys_user IS 'Application users (login identities); full schema lives in System / Shared domain.';
COMMENT ON COLUMN sys_user.usr_username IS 'Unique username / login identifier.';


CREATE TABLE sys_role (
    rol_id             BIGSERIAL PRIMARY KEY,
    rol_code           VARCHAR(50)  NOT NULL,
    rol_name           VARCHAR(100) NOT NULL,
    rol_description    TEXT,
    rol_is_system_role BOOLEAN      NOT NULL DEFAULT TRUE,
    rol_created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    rol_updated_at     TIMESTAMPTZ
);

ALTER TABLE sys_role
    ADD CONSTRAINT uq_rol_code UNIQUE (rol_code);

COMMENT ON TABLE sys_role IS 'Roles (EMPLOYEE, MANAGER, HR, etc.). Used by UserRole and SelfServiceFieldRule.';


CREATE TABLE sys_user_role (
    url_id            BIGSERIAL PRIMARY KEY,
    url_tenant_id     BIGINT      NOT NULL,
    url_usr_id        BIGINT      NOT NULL,
    url_rol_id        BIGINT      NOT NULL,
    url_status_code   VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    url_effective_from DATE       NOT NULL DEFAULT current_date,
    url_effective_to   DATE,
    url_created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    url_created_by    BIGINT,
    url_updated_at    TIMESTAMPTZ,
    url_updated_by    BIGINT,
    CONSTRAINT fk_url_tenant   FOREIGN KEY (url_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_url_user     FOREIGN KEY (url_usr_id)    REFERENCES sys_user   (usr_id),
    CONSTRAINT fk_url_role     FOREIGN KEY (url_rol_id)    REFERENCES sys_role   (rol_id),
    CONSTRAINT fk_url_created_by FOREIGN KEY (url_created_by) REFERENCES sys_user (usr_id),
    CONSTRAINT fk_url_updated_by FOREIGN KEY (url_updated_by) REFERENCES sys_user (usr_id),
    CONSTRAINT uq_url_tenant_user_role UNIQUE (url_tenant_id, url_usr_id, url_rol_id)
);

CREATE INDEX idx_url_tenant_id
    ON sys_user_role (url_tenant_id);

CREATE INDEX idx_url_usr_id
    ON sys_user_role (url_usr_id);

CREATE INDEX idx_url_rol_id
    ON sys_user_role (url_rol_id);

COMMENT ON TABLE sys_user_role IS 'Tenant-scoped RBAC membership (user-role link).';


-- --------------------------------------------------------
-- People Core: Person & Employee
-- --------------------------------------------------------

CREATE TABLE pid_person (
    per_id              BIGSERIAL PRIMARY KEY,
    per_first_name      VARCHAR(100) NOT NULL,
    per_middle_name     VARCHAR(100),
    per_last_name       VARCHAR(100) NOT NULL,
    per_full_name       VARCHAR(300),
    per_date_of_birth   DATE,
    per_gender_code     VARCHAR(20),
    per_nationality_code VARCHAR(50),
    per_created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    per_created_by      BIGINT,
    per_updated_at      TIMESTAMPTZ,
    per_updated_by      BIGINT,
    per_deleted_at      TIMESTAMPTZ,
    per_deleted_by      BIGINT,
    CONSTRAINT fk_per_created_by FOREIGN KEY (per_created_by) REFERENCES sys_user (usr_id),
    CONSTRAINT fk_per_updated_by FOREIGN KEY (per_updated_by) REFERENCES sys_user (usr_id),
    CONSTRAINT fk_per_deleted_by FOREIGN KEY (per_deleted_by) REFERENCES sys_user (usr_id)
);

CREATE INDEX idx_per_name
    ON pid_person (per_last_name, per_first_name);

CREATE INDEX idx_per_dob
    ON pid_person (per_date_of_birth);

COMMENT ON TABLE pid_person IS 'Global person identity shared across tenants and domains.';
COMMENT ON COLUMN pid_person.per_full_name IS 'Optional denormalised display name.';


CREATE TABLE pid_employee (
    emp_id                          BIGSERIAL PRIMARY KEY,
    emp_tenant_id                   BIGINT       NOT NULL,
    emp_per_id                      BIGINT       NOT NULL,
    emp_employee_number             VARCHAR(50)  NOT NULL,
    emp_hire_date                   DATE,
    emp_employment_type_code        VARCHAR(50),
    emp_current_status_code         VARCHAR(50)  NOT NULL,
    emp_current_status_effective_date DATE,
    emp_created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    emp_created_by                  BIGINT,
    emp_updated_at                  TIMESTAMPTZ,
    emp_updated_by                  BIGINT,
    emp_deleted_at                  TIMESTAMPTZ,
    emp_deleted_by                  BIGINT,
    CONSTRAINT fk_emp_tenant    FOREIGN KEY (emp_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_emp_person    FOREIGN KEY (emp_per_id)    REFERENCES pid_person (per_id),
    CONSTRAINT fk_emp_created_by FOREIGN KEY (emp_created_by) REFERENCES sys_user (usr_id),
    CONSTRAINT fk_emp_updated_by FOREIGN KEY (emp_updated_by) REFERENCES sys_user (usr_id),
    CONSTRAINT fk_emp_deleted_by FOREIGN KEY (emp_deleted_by) REFERENCES sys_user (usr_id),
    CONSTRAINT uq_emp_tenant_empno UNIQUE (emp_tenant_id, emp_employee_number),
    CONSTRAINT uq_emp_tenant_per   UNIQUE (emp_tenant_id, emp_per_id)
);

CREATE INDEX idx_emp_tenant_id
    ON pid_employee (emp_tenant_id);

CREATE INDEX idx_emp_status
    ON pid_employee (emp_tenant_id, emp_current_status_code);

COMMENT ON TABLE pid_employee IS 'Employee record per tenant, linked to Person; cross-domain anchor for leave, perf, gamification, etc.';
COMMENT ON COLUMN pid_employee.emp_employee_number IS 'External/HR employee number (unique per tenant).';


-- --------------------------------------------------------
-- Cross-domain stubs (Org, Leave, Perf, Gamification, AI)
-- --------------------------------------------------------

CREATE TABLE org_unit (
    unt_id        BIGSERIAL PRIMARY KEY,
    unt_tenant_id BIGINT       NOT NULL,
    unt_code      VARCHAR(50)  NOT NULL,
    unt_name      VARCHAR(200) NOT NULL,
    unt_created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    unt_created_by BIGINT,
    unt_updated_at TIMESTAMPTZ,
    unt_updated_by BIGINT,
    CONSTRAINT fk_unt_tenant     FOREIGN KEY (unt_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_unt_created_by FOREIGN KEY (unt_created_by) REFERENCES sys_user (usr_id),
    CONSTRAINT fk_unt_updated_by FOREIGN KEY (unt_updated_by) REFERENCES sys_user (usr_id),
    CONSTRAINT uq_unt_tenant_code UNIQUE (unt_tenant_id, unt_code)
);

CREATE INDEX idx_unt_tenant_id
    ON org_unit (unt_tenant_id);

COMMENT ON TABLE org_unit IS 'Org units (company/department/team). Minimal stub for People Core; full schema in Work Lattice domain.';


CREATE TABLE org_position_assignment (
    pas_id         BIGSERIAL PRIMARY KEY,
    pas_tenant_id  BIGINT      NOT NULL,
    pas_emp_id     BIGINT      NOT NULL,
    pas_unt_id     BIGINT      NOT NULL,
    pas_is_primary BOOLEAN     NOT NULL DEFAULT TRUE,
    pas_created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    pas_created_by BIGINT,
    pas_updated_at TIMESTAMPTZ,
    pas_updated_by BIGINT,
    CONSTRAINT fk_pas_tenant     FOREIGN KEY (pas_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_pas_emp        FOREIGN KEY (pas_emp_id)    REFERENCES pid_employee (emp_id),
    CONSTRAINT fk_pas_unit       FOREIGN KEY (pas_unt_id)    REFERENCES org_unit    (unt_id),
    CONSTRAINT fk_pas_created_by FOREIGN KEY (pas_created_by) REFERENCES sys_user   (usr_id),
    CONSTRAINT fk_pas_updated_by FOREIGN KEY (pas_updated_by) REFERENCES sys_user   (usr_id)
);

CREATE INDEX idx_pas_tenant_id
    ON org_position_assignment (pas_tenant_id);

CREATE INDEX idx_pas_emp_id
    ON org_position_assignment (pas_emp_id);

CREATE INDEX idx_pas_unt_id
    ON org_position_assignment (pas_unt_id);

CREATE INDEX idx_pas_primary_per_emp
    ON org_position_assignment (pas_tenant_id, pas_emp_id, pas_is_primary);

COMMENT ON TABLE org_position_assignment IS 'Current/simple view of where an employee sits in the org tree; detailed position history lives in Work Lattice domain.';


-- Leave & Recovery stubs

CREATE TABLE lea_leave_request (
    lrq_id             BIGSERIAL PRIMARY KEY,
    lrq_tenant_id      BIGINT      NOT NULL,
    lrq_emp_id         BIGINT      NOT NULL,
    lrq_leave_type_code VARCHAR(50) NOT NULL,
    lrq_start_date     DATE        NOT NULL,
    lrq_end_date       DATE        NOT NULL,
    lrq_status_code    VARCHAR(50) NOT NULL,
    lrq_created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    lrq_created_by     BIGINT,
    lrq_updated_at     TIMESTAMPTZ,
    lrq_updated_by     BIGINT,
    CONSTRAINT fk_lrq_tenant     FOREIGN KEY (lrq_tenant_id) REFERENCES sys_tenant    (ten_id),
    CONSTRAINT fk_lrq_emp        FOREIGN KEY (lrq_emp_id)    REFERENCES pid_employee  (emp_id),
    CONSTRAINT fk_lrq_created_by FOREIGN KEY (lrq_created_by) REFERENCES sys_user     (usr_id),
    CONSTRAINT fk_lrq_updated_by FOREIGN KEY (lrq_updated_by) REFERENCES sys_user     (usr_id)
);

CREATE INDEX idx_lrq_tenant_id
    ON lea_leave_request (lrq_tenant_id);

CREATE INDEX idx_lrq_emp_id
    ON lea_leave_request (lrq_emp_id);

CREATE INDEX idx_lrq_tenant_status
    ON lea_leave_request (lrq_tenant_id, lrq_status_code);

CREATE INDEX idx_lrq_tenant_emp_status
    ON lea_leave_request (lrq_tenant_id, lrq_emp_id, lrq_status_code);

COMMENT ON TABLE lea_leave_request IS 'Leave request stub; full configuration, balances, and workflow live in Rhythms (Leave & Absence) domain.';


CREATE TABLE lea_leave_balance (
    lba_id              BIGSERIAL PRIMARY KEY,
    lba_tenant_id       BIGINT       NOT NULL,
    lba_emp_id          BIGINT       NOT NULL,
    lba_leave_type_code VARCHAR(50)  NOT NULL,
    lba_period_key      VARCHAR(50)  NOT NULL,
    lba_opening_balance NUMERIC(6,2) NOT NULL DEFAULT 0,
    lba_accrued         NUMERIC(6,2) NOT NULL DEFAULT 0,
    lba_taken           NUMERIC(6,2) NOT NULL DEFAULT 0,
    lba_closing_balance NUMERIC(6,2) NOT NULL DEFAULT 0,
    lba_last_recalc_at  TIMESTAMPTZ,
    lba_created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    lba_created_by      BIGINT,
    lba_updated_at      TIMESTAMPTZ,
    lba_updated_by      BIGINT,
    CONSTRAINT fk_lba_tenant     FOREIGN KEY (lba_tenant_id) REFERENCES sys_tenant   (ten_id),
    CONSTRAINT fk_lba_emp        FOREIGN KEY (lba_emp_id)    REFERENCES pid_employee (emp_id),
    CONSTRAINT fk_lba_created_by FOREIGN KEY (lba_created_by) REFERENCES sys_user    (usr_id),
    CONSTRAINT fk_lba_updated_by FOREIGN KEY (lba_updated_by) REFERENCES sys_user    (usr_id),
    CONSTRAINT uq_lba_emp_type_period UNIQUE (lba_tenant_id, lba_emp_id, lba_leave_type_code, lba_period_key)
);

CREATE INDEX idx_lba_tenant_id
    ON lea_leave_balance (lba_tenant_id);

CREATE INDEX idx_lba_emp_id
    ON lea_leave_balance (lba_emp_id);

COMMENT ON TABLE lea_leave_balance IS 'Per-employee leave balances; detailed accrual rules live in Rhythms domain.';


CREATE TABLE lea_recovery_index (
    rix_id                   BIGSERIAL PRIMARY KEY,
    rix_tenant_id            BIGINT       NOT NULL,
    rix_emp_id               BIGINT       NOT NULL,
    rix_period_key           VARCHAR(50)  NOT NULL,
    rix_score                NUMERIC(5,2) NOT NULL,
    rix_classification_code  VARCHAR(50),
    rix_metrics_summary_json JSONB,
    rix_computed_at          TIMESTAMPTZ  NOT NULL,
    rix_created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    rix_created_by           BIGINT,
    rix_updated_at           TIMESTAMPTZ,
    rix_updated_by           BIGINT,
    CONSTRAINT fk_rix_tenant     FOREIGN KEY (rix_tenant_id) REFERENCES sys_tenant   (ten_id),
    CONSTRAINT fk_rix_emp        FOREIGN KEY (rix_emp_id)    REFERENCES pid_employee (emp_id),
    CONSTRAINT fk_rix_created_by FOREIGN KEY (rix_created_by) REFERENCES sys_user    (usr_id),
    CONSTRAINT fk_rix_updated_by FOREIGN KEY (rix_updated_by) REFERENCES sys_user    (usr_id),
    CONSTRAINT uq_rix_tenant_emp_period UNIQUE (rix_tenant_id, rix_emp_id, rix_period_key)
);

CREATE INDEX idx_rix_tenant_id
    ON lea_recovery_index (rix_tenant_id);

CREATE INDEX idx_rix_emp_id
    ON lea_recovery_index (rix_emp_id);

CREATE INDEX idx_rix_tenant_period
    ON lea_recovery_index (rix_tenant_id, rix_period_key);

COMMENT ON TABLE lea_recovery_index IS 'Wellbeing signal computed from leave/check-ins; full spec in Rhythms domain.';


-- Performance stub

CREATE TABLE prf_perf_appraisal (
    pap_id         BIGSERIAL PRIMARY KEY,
    pap_tenant_id  BIGINT       NOT NULL,
    pap_emp_id     BIGINT       NOT NULL,
    pap_cycle_code VARCHAR(50)  NOT NULL,
    pap_status_code VARCHAR(50) NOT NULL,
    pap_created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    pap_created_by BIGINT,
    pap_updated_at TIMESTAMPTZ,
    pap_updated_by BIGINT,
    CONSTRAINT fk_pap_tenant     FOREIGN KEY (pap_tenant_id) REFERENCES sys_tenant   (ten_id),
    CONSTRAINT fk_pap_emp        FOREIGN KEY (pap_emp_id)    REFERENCES pid_employee (emp_id),
    CONSTRAINT fk_pap_created_by FOREIGN KEY (pap_created_by) REFERENCES sys_user    (usr_id),
    CONSTRAINT fk_pap_updated_by FOREIGN KEY (pap_updated_by) REFERENCES sys_user    (usr_id),
    CONSTRAINT uq_pap_tenant_emp_cycle UNIQUE (pap_tenant_id, pap_emp_id, pap_cycle_code)
);

CREATE INDEX idx_pap_tenant_id
    ON prf_perf_appraisal (pap_tenant_id);

CREATE INDEX idx_pap_emp_id
    ON prf_perf_appraisal (pap_emp_id);

CREATE INDEX idx_pap_tenant_cycle
    ON prf_perf_appraisal (pap_tenant_id, pap_cycle_code);

COMMENT ON TABLE prf_perf_appraisal IS 'Appraisal instance stub; detailed structure lives in Growth Signals domain. Merge with canonical PAP table in consolidated schema.';


-- Gamification stubs

CREATE TABLE gam_profile (
    gpr_id                 BIGSERIAL PRIMARY KEY,
    gpr_tenant_id          BIGINT      NOT NULL,
    gpr_emp_id             BIGINT      NOT NULL,
    gpr_current_points     INTEGER     NOT NULL DEFAULT 0,
    gpr_current_level_code VARCHAR(50),
    gpr_last_level_change_at TIMESTAMPTZ,
    gpr_created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    gpr_created_by         BIGINT,
    gpr_updated_at         TIMESTAMPTZ,
    gpr_updated_by         BIGINT,
    CONSTRAINT fk_gpr_tenant     FOREIGN KEY (gpr_tenant_id) REFERENCES sys_tenant   (ten_id),
    CONSTRAINT fk_gpr_emp        FOREIGN KEY (gpr_emp_id)    REFERENCES pid_employee (emp_id),
    CONSTRAINT fk_gpr_created_by FOREIGN KEY (gpr_created_by) REFERENCES sys_user   (usr_id),
    CONSTRAINT fk_gpr_updated_by FOREIGN KEY (gpr_updated_by) REFERENCES sys_user   (usr_id),
    CONSTRAINT uq_gpr_tenant_emp UNIQUE (gpr_tenant_id, gpr_emp_id)
);

CREATE INDEX idx_gpr_tenant_id
    ON gam_profile (gpr_tenant_id);

CREATE INDEX idx_gpr_emp_id
    ON gam_profile (gpr_emp_id);

COMMENT ON TABLE gam_profile IS 'Gamification profile per employee; full details in Gamification Layer domain.';


CREATE TABLE gam_manager_scorecard (
    gms_id               BIGSERIAL PRIMARY KEY,
    gms_tenant_id        BIGINT       NOT NULL,
    gms_emp_id           BIGINT       NOT NULL,
    gms_period_key       VARCHAR(50)  NOT NULL,
    gms_stewardship_score NUMERIC(5,2) NOT NULL,
    gms_created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    gms_created_by       BIGINT,
    gms_updated_at       TIMESTAMPTZ,
    gms_updated_by       BIGINT,
    CONSTRAINT fk_gms_tenant     FOREIGN KEY (gms_tenant_id) REFERENCES sys_tenant   (ten_id),
    CONSTRAINT fk_gms_emp        FOREIGN KEY (gms_emp_id)    REFERENCES pid_employee (emp_id),
    CONSTRAINT fk_gms_created_by FOREIGN KEY (gms_created_by) REFERENCES sys_user   (usr_id),
    CONSTRAINT fk_gms_updated_by FOREIGN KEY (gms_updated_by) REFERENCES sys_user   (usr_id),
    CONSTRAINT uq_gms_tenant_emp_period UNIQUE (gms_tenant_id, gms_emp_id, gms_period_key)
);

CREATE INDEX idx_gms_tenant_id
    ON gam_manager_scorecard (gms_tenant_id);

CREATE INDEX idx_gms_emp_id
    ON gam_manager_scorecard (gms_emp_id);

CREATE INDEX idx_gms_tenant_period
    ON gam_manager_scorecard (gms_tenant_id, gms_period_key);

COMMENT ON TABLE gam_manager_scorecard IS 'Manager wellbeing stewardship summary; full computation rules live in Gamification Layer domain.';


-- AI Conversation stub

CREATE TABLE ais_conversation (
    acv_id                  BIGSERIAL PRIMARY KEY,
    acv_tenant_id           BIGINT       NOT NULL,
    acv_usr_id              BIGINT       NOT NULL,
    acv_type_code           VARCHAR(50)  NOT NULL,
    acv_entry_surface_code  VARCHAR(50)  NOT NULL,
    acv_subject_entity_type VARCHAR(100),
    acv_subject_entity_id   VARCHAR(100),
    acv_started_at          TIMESTAMPTZ  NOT NULL,
    acv_ended_at            TIMESTAMPTZ,
    acv_created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    acv_created_by          BIGINT,
    acv_updated_at          TIMESTAMPTZ,
    acv_updated_by          BIGINT,
    CONSTRAINT fk_acv_tenant     FOREIGN KEY (acv_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_acv_user       FOREIGN KEY (acv_usr_id)    REFERENCES sys_user  (usr_id),
    CONSTRAINT fk_acv_created_by FOREIGN KEY (acv_created_by) REFERENCES sys_user (usr_id),
    CONSTRAINT fk_acv_updated_by FOREIGN KEY (acv_updated_by) REFERENCES sys_user (usr_id)
);

CREATE INDEX idx_acv_tenant_id
    ON ais_conversation (acv_tenant_id);

CREATE INDEX idx_acv_usr_id
    ON ais_conversation (acv_usr_id);

CREATE INDEX idx_acv_tenant_type
    ON ais_conversation (acv_tenant_id, acv_type_code);

CREATE INDEX idx_acv_tenant_user_surface
    ON ais_conversation (acv_tenant_id, acv_usr_id, acv_entry_surface_code);

COMMENT ON TABLE ais_conversation IS 'Copilot conversation session stub; full detail lives in AI Layer domain.';


-- --------------------------------------------------------
-- FieldDefinition & SelfServiceFieldRule
-- --------------------------------------------------------

CREATE TABLE sys_field_def (
    fdf_id                 BIGSERIAL PRIMARY KEY,
    fdf_target_entity_type VARCHAR(100) NOT NULL,
    fdf_field_key          VARCHAR(100) NOT NULL,
    fdf_label              VARCHAR(200) NOT NULL,
    fdf_help_text          TEXT,
    fdf_field_group        VARCHAR(100),
    fdf_data_type_code     VARCHAR(50)  NOT NULL,
    fdf_is_active          BOOLEAN      NOT NULL DEFAULT TRUE,
    fdf_created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    fdf_created_by         BIGINT,
    fdf_updated_at         TIMESTAMPTZ,
    fdf_updated_by         BIGINT,
    CONSTRAINT fk_fdf_created_by FOREIGN KEY (fdf_created_by) REFERENCES sys_user (usr_id),
    CONSTRAINT fk_fdf_updated_by FOREIGN KEY (fdf_updated_by) REFERENCES sys_user (usr_id),
    CONSTRAINT uq_fdf_entity_field UNIQUE (fdf_target_entity_type, fdf_field_key)
);

COMMENT ON TABLE sys_field_def IS 'Global catalog of configurable fields used in ESS/MSS; referenced by SelfServiceFieldRule.';


CREATE TABLE sys_field_rule (
    frl_id                      BIGSERIAL PRIMARY KEY,
    frl_tenant_id               BIGINT       NOT NULL,
    frl_rol_id                  BIGINT       NOT NULL,
    frl_fdf_id                  BIGINT       NOT NULL,
    frl_portal_type_code        VARCHAR(20)  NOT NULL,
    frl_visible_flag            BOOLEAN      NOT NULL DEFAULT TRUE,
    frl_editable_flag           BOOLEAN      NOT NULL DEFAULT FALSE,
    frl_requires_approval_flag  BOOLEAN      NOT NULL DEFAULT FALSE,
    frl_justification_required_flag BOOLEAN  NOT NULL DEFAULT FALSE,
    frl_effective_from          DATE         NOT NULL,
    frl_effective_to            DATE,
    frl_status_code             VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    frl_created_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
    frl_created_by              BIGINT,
    frl_updated_at              TIMESTAMPTZ,
    frl_updated_by              BIGINT,
    CONSTRAINT fk_frl_tenant     FOREIGN KEY (frl_tenant_id) REFERENCES sys_tenant   (ten_id),
    CONSTRAINT fk_frl_role       FOREIGN KEY (frl_rol_id)    REFERENCES sys_role     (rol_id),
    CONSTRAINT fk_frl_field_def  FOREIGN KEY (frl_fdf_id)    REFERENCES sys_field_def (fdf_id),
    CONSTRAINT fk_frl_created_by FOREIGN KEY (frl_created_by) REFERENCES sys_user   (usr_id),
    CONSTRAINT fk_frl_updated_by FOREIGN KEY (frl_updated_by) REFERENCES sys_user   (usr_id),
    CONSTRAINT uq_frl_tenant_role_field_portal_from
        UNIQUE (frl_tenant_id, frl_rol_id, frl_fdf_id, frl_portal_type_code, frl_effective_from)
);

CREATE INDEX idx_frl_tenant_id
    ON sys_field_rule (frl_tenant_id);

CREATE INDEX idx_frl_rol_id
    ON sys_field_rule (frl_rol_id);

CREATE INDEX idx_frl_fdf_id
    ON sys_field_rule (frl_fdf_id);

CREATE INDEX idx_frl_tenant_status
    ON sys_field_rule (frl_tenant_id, frl_status_code);

COMMENT ON TABLE sys_field_rule IS 'Tenant- & role-specific ESS/MSS field rules controlling visibility and editability of Person/Employee fields.';


-- ========================================================
-- Notes on cross-domain dependencies
-- ========================================================
-- * sys_tenant, sys_user, sys_role are System / Shared domain tables.
-- * org_unit and org_position_assignment are minimal stubs; full
--   Work Lattice domain will define richer org & position structures.
-- * lea_leave_request, lea_leave_balance, lea_recovery_index are
--   stubs aligned to the Rhythms (Leave & Absence) domain.
-- * prf_perf_appraisal is a stub; merge with the canonical PAP table
--   from the Growth Signals (Performance & Check-Ins) domain.
-- * gam_profile and gam_manager_scorecard are stubs aligned with
--   the Gamification Layer domain.
-- * ais_conversation is a stub aligned with the AI Layer domain.
```
