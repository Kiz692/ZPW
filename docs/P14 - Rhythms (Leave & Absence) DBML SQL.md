Here’s a **single PostgreSQL DDL script** for the **Rhythms (Leave & Absence)** domain, based on the final DBML.

* **Assumption:** This script assumes a **clean schema** (tables don’t already exist).
* In an integrated system, `sys_tenant`, `pid_employee`, `org_unit`, and `sys_role` will typically be defined in their own domains; here they are included as simple stubs for completeness.

---

```sql
-- =========================================================
-- Domain: Rhythms (Leave & Absence)
-- Assumes: clean schema (tables do not already exist)
-- =========================================================

-- ---------------------------------------------------------
-- System / Shared stubs (for FK references)
-- In real deployment, these come from System / People / Org domains.
-- ---------------------------------------------------------

CREATE TABLE sys_tenant (
    ten_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_name VARCHAR(200) NOT NULL
);

COMMENT ON TABLE sys_tenant IS 'Tenant table (stub; full definition lives in System / Shared domain).';


CREATE TABLE pid_employee (
    emp_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    emp_tenant_id BIGINT NOT NULL REFERENCES sys_tenant (ten_id)
);

COMMENT ON TABLE pid_employee IS 'Employee table (stub; full definition lives in People & Identity domain).';


CREATE TABLE org_unit (
    unt_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    unt_tenant_id BIGINT NOT NULL REFERENCES sys_tenant (ten_id)
);

COMMENT ON TABLE org_unit IS 'Org unit table (stub; full definition lives in Work Lattice domain).';


CREATE TABLE sys_role (
    rol_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rol_code VARCHAR(50) NOT NULL
);

COMMENT ON TABLE sys_role IS 'Role table (stub; full definition lives in System / Shared domain).';

-- =========================================================
-- Rhythms (Leave & Absence) tables
-- =========================================================

-- ---------------------------------------------------------
-- Configurable leave types (annual, sick, wellness, etc.)
-- ---------------------------------------------------------

CREATE TABLE lea_leave_type (
    ltp_id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ltp_tenant_id           BIGINT      NOT NULL REFERENCES sys_tenant (ten_id),
    ltp_code                VARCHAR(50) NOT NULL,
    ltp_name                VARCHAR(200) NOT NULL,
    ltp_category_code       VARCHAR(50) NOT NULL,  -- ANNUAL, SICK, WELLNESS, OTHER, etc.
    ltp_is_paid             BOOLEAN     NOT NULL DEFAULT TRUE,
    ltp_requires_attachment BOOLEAN     NOT NULL DEFAULT FALSE,
    ltp_min_duration        NUMERIC(5,2),
    ltp_max_duration        NUMERIC(5,2),
    ltp_is_wellness_related BOOLEAN     NOT NULL DEFAULT FALSE,
    ltp_is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    ltp_created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ltp_created_by          BIGINT,
    ltp_updated_at          TIMESTAMPTZ,
    ltp_updated_by          BIGINT,
    ltp_deleted_at          TIMESTAMPTZ,
    ltp_deleted_by          BIGINT,
    CONSTRAINT uq_ltp_tenant_code UNIQUE (ltp_tenant_id, ltp_code)
);

COMMENT ON TABLE lea_leave_type IS 'Leave type definitions per tenant; seeded + configurable.';


CREATE INDEX idx_ltp_tenant_id
    ON lea_leave_type (ltp_tenant_id);

CREATE INDEX idx_ltp_tenant_active
    ON lea_leave_type (ltp_tenant_id, ltp_is_active);

CREATE INDEX idx_ltp_tenant_category
    ON lea_leave_type (ltp_tenant_id, ltp_category_code);

CREATE INDEX idx_ltp_tenant_wellness_active
    ON lea_leave_type (ltp_tenant_id, ltp_is_wellness_related, ltp_is_active);

-- ---------------------------------------------------------
-- Entitlement and accrual policy per leave type
-- ---------------------------------------------------------

CREATE TABLE lea_leave_policy (
    lpl_id                         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lpl_tenant_id                  BIGINT      NOT NULL REFERENCES sys_tenant (ten_id),
    lpl_ltp_id                     BIGINT      NOT NULL REFERENCES lea_leave_type (ltp_id),
    lpl_accrual_model_code         VARCHAR(50) NOT NULL,   -- NONE, ANNUAL, MONTHLY
    lpl_days_per_period            NUMERIC(5,2),
    lpl_max_annual_entitlement     NUMERIC(5,2),
    lpl_carry_forward_allowed      BOOLEAN     NOT NULL DEFAULT FALSE,
    lpl_max_carry_forward_days     NUMERIC(5,2),
    lpl_pro_rata_joiners_rule_code VARCHAR(50),
    lpl_pro_rata_leavers_rule_code VARCHAR(50),
    lpl_effective_from             DATE        NOT NULL,
    lpl_effective_to               DATE,
    lpl_created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lpl_created_by                 BIGINT,
    lpl_updated_at                 TIMESTAMPTZ,
    lpl_updated_by                 BIGINT,
    lpl_deleted_at                 TIMESTAMPTZ,
    lpl_deleted_by                 BIGINT,
    CONSTRAINT uq_lpl_tenant_type_from
        UNIQUE (lpl_tenant_id, lpl_ltp_id, lpl_effective_from)
);

COMMENT ON TABLE lea_leave_policy IS 'Entitlement & accrual policy per leave type, historized via effective_from/effective_to.';


CREATE INDEX idx_lpl_tenant_id
    ON lea_leave_policy (lpl_tenant_id);

CREATE INDEX idx_lpl_ltp_id
    ON lea_leave_policy (lpl_ltp_id);

-- ---------------------------------------------------------
-- Leave accounting period (e.g., year)
-- ---------------------------------------------------------

CREATE TABLE lea_leave_period (
    lpd_id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lpd_tenant_id        BIGINT      NOT NULL REFERENCES sys_tenant (ten_id),
    lpd_code             VARCHAR(50) NOT NULL,  -- e.g. 2025, 2025_FY
    lpd_period_type_code VARCHAR(50) NOT NULL,  -- CALENDAR, FISCAL, etc.
    lpd_start_date       DATE        NOT NULL,
    lpd_end_date         DATE        NOT NULL,
    lpd_is_active        BOOLEAN     NOT NULL DEFAULT FALSE,
    lpd_created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lpd_created_by       BIGINT,
    lpd_updated_at       TIMESTAMPTZ,
    lpd_updated_by       BIGINT,
    lpd_deleted_at       TIMESTAMPTZ,
    lpd_deleted_by       BIGINT,
    CONSTRAINT uq_lpd_tenant_code UNIQUE (lpd_tenant_id, lpd_code)
);

COMMENT ON TABLE lea_leave_period IS 'Leave accounting periods per tenant (e.g., yearly); usually one active at a time.';


CREATE INDEX idx_lpd_tenant_id
    ON lea_leave_period (lpd_tenant_id);

CREATE INDEX idx_lpd_tenant_active
    ON lea_leave_period (lpd_tenant_id, lpd_is_active);

CREATE INDEX idx_lpd_tenant_dates
    ON lea_leave_period (lpd_tenant_id, lpd_start_date, lpd_end_date);

-- ---------------------------------------------------------
-- Per-employee, per-type, per-period leave balance
-- ---------------------------------------------------------

CREATE TABLE lea_leave_balance (
    lba_id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lba_tenant_id        BIGINT       NOT NULL REFERENCES sys_tenant (ten_id),
    lba_emp_id           BIGINT       NOT NULL REFERENCES pid_employee (emp_id),
    lba_ltp_id           BIGINT       NOT NULL REFERENCES lea_leave_type (ltp_id),
    lba_lpd_id           BIGINT       NOT NULL REFERENCES lea_leave_period (lpd_id),
    lba_opening_balance  NUMERIC(7,2) NOT NULL DEFAULT 0,
    lba_accrued          NUMERIC(7,2) NOT NULL DEFAULT 0,
    lba_taken            NUMERIC(7,2) NOT NULL DEFAULT 0,
    lba_adjustment_total NUMERIC(7,2) NOT NULL DEFAULT 0,
    lba_closing_balance  NUMERIC(7,2) NOT NULL DEFAULT 0,
    lba_last_recalc_at   TIMESTAMPTZ,
    lba_created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lba_created_by       BIGINT,
    lba_updated_at       TIMESTAMPTZ,
    lba_updated_by       BIGINT,
    lba_deleted_at       TIMESTAMPTZ,
    lba_deleted_by       BIGINT,
    CONSTRAINT uq_lba_emp_type_period
        UNIQUE (lba_tenant_id, lba_emp_id, lba_ltp_id, lba_lpd_id)
);

COMMENT ON TABLE lea_leave_balance IS 'One row per employee + leave type + period; totals derived from policy, usage & adjustments.';


CREATE INDEX idx_lba_tenant_id
    ON lea_leave_balance (lba_tenant_id);

CREATE INDEX idx_lba_emp_id
    ON lea_leave_balance (lba_emp_id);

CREATE INDEX idx_lba_ltp_id
    ON lea_leave_balance (lba_ltp_id);

CREATE INDEX idx_lba_lpd_id
    ON lea_leave_balance (lba_lpd_id);

-- ---------------------------------------------------------
-- Auditable balance adjustment entries
-- ---------------------------------------------------------

CREATE TABLE lea_leave_bal_adj (
    lad_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lad_tenant_id   BIGINT       NOT NULL REFERENCES sys_tenant (ten_id),
    lad_lba_id      BIGINT       NOT NULL REFERENCES lea_leave_balance (lba_id),
    lad_amount      NUMERIC(7,2) NOT NULL,  -- + or - days
    lad_reason_code VARCHAR(50),
    lad_comment     TEXT,
    lad_adjusted_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    lad_created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    lad_created_by  BIGINT,
    lad_updated_at  TIMESTAMPTZ,
    lad_updated_by  BIGINT,
    lad_deleted_at  TIMESTAMPTZ,
    lad_deleted_by  BIGINT
);

COMMENT ON TABLE lea_leave_bal_adj IS 'Detailed audit log of manual balance changes; supports reconciliation and compliance.';


CREATE INDEX idx_lad_tenant_id
    ON lea_leave_bal_adj (lad_tenant_id);

CREATE INDEX idx_lad_lba_id
    ON lea_leave_bal_adj (lad_lba_id);

CREATE INDEX idx_lad_tenant_bal_date
    ON lea_leave_bal_adj (lad_tenant_id, lad_lba_id, lad_adjusted_at);

-- ---------------------------------------------------------
-- Leave request header
-- ---------------------------------------------------------

CREATE TABLE lea_leave_request (
    lrq_id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lrq_tenant_id           BIGINT       NOT NULL REFERENCES sys_tenant (ten_id),
    lrq_emp_id              BIGINT       NOT NULL REFERENCES pid_employee (emp_id),
    lrq_ltp_id              BIGINT       NOT NULL REFERENCES lea_leave_type (ltp_id),
    lrq_lpd_id              BIGINT       NOT NULL REFERENCES lea_leave_period (lpd_id),
    lrq_request_datetime    TIMESTAMPTZ  NOT NULL,
    lrq_start_date          DATE         NOT NULL,
    lrq_end_date            DATE         NOT NULL,
    lrq_total_duration_units NUMERIC(7,2) NOT NULL,  -- total units requested
    lrq_reason              TEXT,
    lrq_attachment_ref      VARCHAR(255),
    lrq_status_code         VARCHAR(50)  NOT NULL,   -- DRAFT, PENDING, APPROVED, REJECTED, CANCELLED
    lrq_current_stage_code  VARCHAR(50),
    lrq_created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    lrq_created_by          BIGINT,
    lrq_updated_at          TIMESTAMPTZ,
    lrq_updated_by          BIGINT,
    lrq_deleted_at          TIMESTAMPTZ,
    lrq_deleted_by          BIGINT
);

COMMENT ON TABLE lea_leave_request IS 'Core leave request record; per-day breakdown stored in lea_leave_request_day.';


CREATE INDEX idx_lrq_tenant_id
    ON lea_leave_request (lrq_tenant_id);

CREATE INDEX idx_lrq_emp_id
    ON lea_leave_request (lrq_emp_id);

CREATE INDEX idx_lrq_ltp_id
    ON lea_leave_request (lrq_ltp_id);

CREATE INDEX idx_lrq_lpd_id
    ON lea_leave_request (lrq_lpd_id);

CREATE INDEX idx_lrq_tenant_status
    ON lea_leave_request (lrq_tenant_id, lrq_status_code);

CREATE INDEX idx_lrq_tenant_emp_status
    ON lea_leave_request (lrq_tenant_id, lrq_emp_id, lrq_status_code);

CREATE INDEX idx_lrq_tenant_dates
    ON lea_leave_request (lrq_tenant_id, lrq_start_date, lrq_end_date);

CREATE INDEX idx_lrq_tenant_type_start
    ON lea_leave_request (lrq_tenant_id, lrq_ltp_id, lrq_start_date);

-- ---------------------------------------------------------
-- Per-day breakdown of a leave request
-- ---------------------------------------------------------

CREATE TABLE lea_leave_request_day (
    lrd_id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lrd_tenant_id      BIGINT       NOT NULL REFERENCES sys_tenant (ten_id),
    lrd_lrq_id         BIGINT       NOT NULL REFERENCES lea_leave_request (lrq_id),
    lrd_date           DATE         NOT NULL,
    lrd_unit_type_code VARCHAR(50)  NOT NULL,  -- FULL_DAY, HALF_DAY, HOURS, etc.
    lrd_units          NUMERIC(5,2) NOT NULL,
    lrd_segment_notes  TEXT,
    lrd_created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    lrd_created_by     BIGINT,
    lrd_updated_at     TIMESTAMPTZ,
    lrd_updated_by     BIGINT,
    lrd_deleted_at     TIMESTAMPTZ,
    lrd_deleted_by     BIGINT,
    CONSTRAINT uq_lrd_lrq_date UNIQUE (lrd_lrq_id, lrd_date)
);

COMMENT ON TABLE lea_leave_request_day IS 'Per-day breakdown of leave requests; supports mixed patterns within one request.';


CREATE INDEX idx_lrd_tenant_id
    ON lea_leave_request_day (lrd_tenant_id);

CREATE INDEX idx_lrd_lrq_id
    ON lea_leave_request_day (lrd_lrq_id);

CREATE INDEX idx_lrd_tenant_date
    ON lea_leave_request_day (lrd_tenant_id, lrd_date);

-- ---------------------------------------------------------
-- Workflow rules per leave type/category
-- ---------------------------------------------------------

CREATE TABLE lea_leave_workflow_rule (
    lwr_id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lwr_tenant_id            BIGINT      NOT NULL REFERENCES sys_tenant (ten_id),
    lwr_ltp_id               BIGINT      REFERENCES lea_leave_type (ltp_id),
    lwr_scope_type_code      VARCHAR(50) NOT NULL,   -- TYPE, CATEGORY, TENANT_DEFAULT, etc.
    lwr_scope_value_code     VARCHAR(50),
    lwr_is_active            BOOLEAN     NOT NULL DEFAULT TRUE,
    lwr_effective_from       DATE        NOT NULL,
    lwr_effective_to         DATE,
    lwr_special_routing_flags JSONB,
    lwr_created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lwr_created_by           BIGINT,
    lwr_updated_at           TIMESTAMPTZ,
    lwr_updated_by           BIGINT,
    lwr_deleted_at           TIMESTAMPTZ,
    lwr_deleted_by           BIGINT
);

COMMENT ON TABLE lea_leave_workflow_rule IS 'Configures approval patterns (e.g., manager-only, manager+HR) per leave type/category.';


CREATE INDEX idx_lwr_tenant_id
    ON lea_leave_workflow_rule (lwr_tenant_id);

CREATE INDEX idx_lwr_ltp_id
    ON lea_leave_workflow_rule (lwr_ltp_id);

CREATE INDEX idx_lwr_scope_from
    ON lea_leave_workflow_rule (lwr_tenant_id, lwr_scope_type_code, lwr_scope_value_code, lwr_effective_from);

CREATE INDEX idx_lwr_tenant_active
    ON lea_leave_workflow_rule (lwr_tenant_id, lwr_is_active);

-- ---------------------------------------------------------
-- Steps within a workflow rule (e.g. step 1 manager, step 2 HR)
-- ---------------------------------------------------------

CREATE TABLE lea_leave_workflow_step (
    lws_id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lws_tenant_id        BIGINT      NOT NULL REFERENCES sys_tenant (ten_id),
    lws_lwr_id           BIGINT      NOT NULL REFERENCES lea_leave_workflow_rule (lwr_id),
    lws_step_number      INT         NOT NULL,         -- 1, 2, ...
    lws_approver_type_code VARCHAR(50) NOT NULL,      -- MANAGER, HR, ROLE, etc.
    lws_approver_rol_id  BIGINT      REFERENCES sys_role (rol_id),
    lws_is_final_step    BOOLEAN     NOT NULL DEFAULT FALSE,
    lws_step_name        VARCHAR(100),
    lws_created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lws_created_by       BIGINT,
    lws_updated_at       TIMESTAMPTZ,
    lws_updated_by       BIGINT,
    lws_deleted_at       TIMESTAMPTZ,
    lws_deleted_by       BIGINT,
    CONSTRAINT uq_lws_rule_step
        UNIQUE (lws_tenant_id, lws_lwr_id, lws_step_number)
);

COMMENT ON TABLE lea_leave_workflow_step IS 'Ordered approval steps per workflow rule.';


CREATE INDEX idx_lws_tenant_id
    ON lea_leave_workflow_step (lws_tenant_id);

CREATE INDEX idx_lws_lwr_id
    ON lea_leave_workflow_step (lws_lwr_id);

-- ---------------------------------------------------------
-- Approval decisions on leave requests
-- ---------------------------------------------------------

CREATE TABLE lea_leave_approval (
    lap_id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lap_tenant_id            BIGINT      NOT NULL REFERENCES sys_tenant (ten_id),
    lap_lrq_id               BIGINT      NOT NULL REFERENCES lea_leave_request (lrq_id),
    lap_lws_id               BIGINT      REFERENCES lea_leave_workflow_step (lws_id),
    lap_decision_status_code VARCHAR(50) NOT NULL,   -- APPROVED, REJECTED, CANCELLED
    lap_decision_datetime    TIMESTAMPTZ NOT NULL,
    lap_decision_comment     TEXT,
    lap_created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lap_created_by           BIGINT,
    lap_updated_at           TIMESTAMPTZ,
    lap_updated_by           BIGINT,
    lap_deleted_at           TIMESTAMPTZ,
    lap_deleted_by           BIGINT
);

COMMENT ON TABLE lea_leave_approval IS 'One row per decision per workflow step; lap_created_by usually holds approver identity.';


CREATE INDEX idx_lap_tenant_id
    ON lea_leave_approval (lap_tenant_id);

CREATE INDEX idx_lap_lrq_id
    ON lea_leave_approval (lap_lrq_id);

CREATE INDEX idx_lap_lws_id
    ON lea_leave_approval (lap_lws_id);

CREATE INDEX idx_lap_tenant_request_date
    ON lea_leave_approval (lap_tenant_id, lap_lrq_id, lap_decision_datetime);

-- ---------------------------------------------------------
-- Staffing / capacity rules per Org Unit
-- ---------------------------------------------------------

CREATE TABLE lea_roster_rule (
    lrr_id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lrr_tenant_id             BIGINT       NOT NULL REFERENCES sys_tenant (ten_id),
    lrr_unt_id                BIGINT       NOT NULL REFERENCES org_unit (unt_id),
    lrr_min_staff_on_duty     NUMERIC(5,2),
    lrr_max_simultaneous_leaves NUMERIC(5,2),
    lrr_scope_code            VARCHAR(50)  NOT NULL,  -- ALL_LEAVE, CATEGORY, TYPE, etc.
    lrr_is_active             BOOLEAN      NOT NULL DEFAULT TRUE,
    lrr_effective_from        DATE         NOT NULL,
    lrr_effective_to          DATE,
    lrr_created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    lrr_created_by            BIGINT,
    lrr_updated_at            TIMESTAMPTZ,
    lrr_updated_by            BIGINT,
    lrr_deleted_at            TIMESTAMPTZ,
    lrr_deleted_by            BIGINT
);

COMMENT ON TABLE lea_roster_rule IS 'Staffing / capacity rules to protect minimum coverage per org unit.';


CREATE INDEX idx_lrr_tenant_id
    ON lea_roster_rule (lrr_tenant_id);

CREATE INDEX idx_lrr_unt_id
    ON lea_roster_rule (lrr_unt_id);

CREATE INDEX idx_lrr_active_by_unit
    ON lea_roster_rule (lrr_tenant_id, lrr_unt_id, lrr_is_active);

CREATE INDEX idx_lrr_tenant_unit_from
    ON lea_roster_rule (lrr_tenant_id, lrr_unt_id, lrr_effective_from);

-- ---------------------------------------------------------
-- Recovery Index snapshots (rest/recovery signal)
-- ---------------------------------------------------------

CREATE TABLE lea_recovery_index (
    rix_id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rix_tenant_id             BIGINT       NOT NULL REFERENCES sys_tenant (ten_id),
    rix_emp_id                BIGINT       NOT NULL REFERENCES pid_employee (emp_id),
    rix_time_window_type_code VARCHAR(50)  NOT NULL,  -- MONTHLY, QUARTERLY, YEARLY, etc.
    rix_time_window_key       VARCHAR(50)  NOT NULL,  -- e.g. 2025-01, 2025_Q1
    rix_score                 NUMERIC(5,2) NOT NULL,
    rix_classification_code   VARCHAR(50),
    rix_metrics_summary_json  JSONB,
    rix_computed_at           TIMESTAMPTZ  NOT NULL,
    rix_created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    rix_created_by            BIGINT,
    rix_updated_at            TIMESTAMPTZ,
    rix_updated_by            BIGINT,
    rix_deleted_at            TIMESTAMPTZ,
    rix_deleted_by            BIGINT,
    CONSTRAINT uq_rix_emp_window
        UNIQUE (rix_tenant_id, rix_emp_id, rix_time_window_type_code, rix_time_window_key)
);

COMMENT ON TABLE lea_recovery_index IS 'Recovery Index snapshots per employee & time window; feeds wellbeing & gamification views.';


CREATE INDEX idx_rix_tenant_id
    ON lea_recovery_index (rix_tenant_id);

CREATE INDEX idx_rix_emp_id
    ON lea_recovery_index (rix_emp_id);

CREATE INDEX idx_rix_tenant_window
    ON lea_recovery_index (rix_tenant_id, rix_time_window_type_code, rix_time_window_key);
```

---

### Notes on Cross-Domain Dependencies

* **`sys_tenant`**: In the full system, comes from the **System / Shared** domain.
* **`pid_employee`**: Defined in the **People & Identity (People Core)** domain; here used for `lba_emp_id`, `lrq_emp_id`, `rix_emp_id`.
* **`org_unit`**: Defined in **Work Lattice (Org & Jobs)**; used by `lea_roster_rule.lrr_unt_id`.
* **`sys_role`**: Defined in the **System / Shared** domain; used for role-based approvers in workflow steps.

When you integrate this into a consolidated schema, you’ll typically:

* Remove the stub table definitions for those four tables, and
* Keep all the FK references as-is pointing to the real definitions.
