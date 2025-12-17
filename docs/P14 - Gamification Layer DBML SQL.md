```sql
-- =========================================================
-- Domain: Gamification Layer
-- PostgreSQL DDL generated from DBML
-- Assumption: running on a CLEAN schema (tables do not exist yet).
-- In an integrated system, sys_tenant / pid_employee / org_unit
-- will come from their own domains instead of these stubs.
-- =========================================================


-- ---------------------------------------------------------
-- System / Shared stubs (for FK references)
-- ---------------------------------------------------------

CREATE TABLE sys_tenant (
    ten_id   BIGSERIAL PRIMARY KEY,
    ten_name VARCHAR(200) NOT NULL
);

COMMENT ON TABLE sys_tenant IS 'Tenant table (stub; full definition lives in System / Shared domain).';


CREATE TABLE pid_employee (
    emp_id        BIGSERIAL PRIMARY KEY,
    emp_tenant_id BIGINT NOT NULL,

    CONSTRAINT fk_emp_tenant
        FOREIGN KEY (emp_tenant_id) REFERENCES sys_tenant (ten_id)
);

COMMENT ON TABLE pid_employee IS 'Employee table (stub; full definition lives in People & Identity domain).';

CREATE INDEX idx_emp_tenant_id ON pid_employee (emp_tenant_id);


CREATE TABLE org_unit (
    unt_id        BIGSERIAL PRIMARY KEY,
    unt_tenant_id BIGINT       NOT NULL,
    unt_code      VARCHAR(50)  NOT NULL,
    unt_name      VARCHAR(200) NOT NULL,

    CONSTRAINT fk_unt_tenant
        FOREIGN KEY (unt_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT uq_unt_tenant_code
        UNIQUE (unt_tenant_id, unt_code)
);

COMMENT ON TABLE org_unit IS 'Org unit table (stub; full definition lives in Work Lattice domain).';

CREATE INDEX idx_unt_tenant_id ON org_unit (unt_tenant_id);


-- ---------------------------------------------------------
-- 4. Level definitions (Getting Started, Steady, Thriving)
-- ---------------------------------------------------------

CREATE TABLE gam_level_def (
    gld_id         BIGSERIAL PRIMARY KEY,
    gld_tenant_id  BIGINT       NOT NULL,

    gld_code       VARCHAR(50)  NOT NULL,     -- LEVEL_1, LEVEL_2, etc.
    gld_name       VARCHAR(100) NOT NULL,
    gld_description TEXT        NULL,
    gld_min_points INTEGER      NOT NULL,
    gld_max_points INTEGER      NOT NULL,
    gld_sequence   INT          NOT NULL,

    gld_created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    gld_created_by BIGINT       NULL,
    gld_updated_at TIMESTAMPTZ  NULL,
    gld_updated_by BIGINT       NULL,
    gld_deleted_at TIMESTAMPTZ  NULL,
    gld_deleted_by BIGINT       NULL,

    CONSTRAINT fk_gld_tenant
        FOREIGN KEY (gld_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT uq_gld_tenant_code
        UNIQUE (gld_tenant_id, gld_code)
);

COMMENT ON TABLE gam_level_def IS 'Per-tenant points thresholds for levels (used by profiles and reporting).';

CREATE INDEX idx_gld_tenant_id ON gam_level_def (gld_tenant_id);
CREATE INDEX idx_gld_tenant_sequence ON gam_level_def (gld_tenant_id, gld_sequence);


-- ---------------------------------------------------------
-- 1. Gamification profile per employee
-- ---------------------------------------------------------

CREATE TABLE gam_profile (
    gpr_id                   BIGSERIAL PRIMARY KEY,
    gpr_tenant_id            BIGINT       NOT NULL,
    gpr_emp_id               BIGINT       NOT NULL,
    gpr_gld_id               BIGINT       NULL,

    gpr_current_points       INTEGER      NOT NULL DEFAULT 0,
    gpr_current_level_code   VARCHAR(50)  NULL,        -- optional denormalized copy of GLD_CODE
    gpr_last_level_change_at TIMESTAMPTZ  NULL,
    gpr_show_visuals_flag    BOOLEAN      NOT NULL DEFAULT TRUE,

    gpr_created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    gpr_created_by           BIGINT       NULL,
    gpr_updated_at           TIMESTAMPTZ  NULL,
    gpr_updated_by           BIGINT       NULL,
    gpr_deleted_at           TIMESTAMPTZ  NULL,
    gpr_deleted_by           BIGINT       NULL,

    CONSTRAINT fk_gpr_tenant
        FOREIGN KEY (gpr_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_gpr_emp
        FOREIGN KEY (gpr_emp_id) REFERENCES pid_employee (emp_id),
    CONSTRAINT fk_gpr_gld
        FOREIGN KEY (gpr_gld_id) REFERENCES gam_level_def (gld_id),
    CONSTRAINT uq_gpr_tenant_emp
        UNIQUE (gpr_tenant_id, gpr_emp_id)
);

COMMENT ON TABLE gam_profile IS 'Gamification state per employee per tenant (points, level, visuals).';

CREATE INDEX idx_gpr_tenant_id      ON gam_profile (gpr_tenant_id);
CREATE INDEX idx_gpr_emp_id         ON gam_profile (gpr_emp_id);
CREATE INDEX idx_gpr_gld_id         ON gam_profile (gpr_gld_id);
CREATE INDEX idx_gpr_tenant_level   ON gam_profile (gpr_tenant_id, gpr_gld_id);


-- ---------------------------------------------------------
-- 2. Points transactions (earn/adjustment)
-- ---------------------------------------------------------

CREATE TABLE gam_points_txn (
    gpt_id                  BIGSERIAL PRIMARY KEY,
    gpt_tenant_id           BIGINT       NOT NULL,
    gpt_gpr_id              BIGINT       NOT NULL,

    gpt_txn_type_code       VARCHAR(50)  NOT NULL,   -- EARN, ADJUSTMENT
    gpt_event_category_code VARCHAR(50)  NOT NULL,   -- ONBOARDING, LEAVE_PLANNING, etc.
    gpt_points_delta        INTEGER      NOT NULL,
    gpt_txn_at              TIMESTAMPTZ  NOT NULL,

    gpt_source_domain       VARCHAR(100) NOT NULL,   -- e.g. LEAVE_REQUEST, PAP_APPRAISAL
    gpt_source_id           VARCHAR(100) NOT NULL,   -- opaque ID of source entity
    gpt_comment             TEXT         NULL,

    gpt_created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    gpt_created_by          BIGINT       NULL,
    gpt_updated_at          TIMESTAMPTZ  NULL,
    gpt_updated_by          BIGINT       NULL,
    gpt_deleted_at          TIMESTAMPTZ  NULL,
    gpt_deleted_by          BIGINT       NULL,

    CONSTRAINT fk_gpt_tenant
        FOREIGN KEY (gpt_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_gpt_gpr
        FOREIGN KEY (gpt_gpr_id) REFERENCES gam_profile (gpr_id)
);

COMMENT ON TABLE gam_points_txn IS 'Immutable log of points earn/adjustment events for profiles; used for audit and recalculation.';

CREATE INDEX idx_gpt_tenant_id          ON gam_points_txn (gpt_tenant_id);
CREATE INDEX idx_gpt_gpr_id             ON gam_points_txn (gpt_gpr_id);
CREATE INDEX idx_gpt_profile_time       ON gam_points_txn (gpt_tenant_id, gpt_gpr_id, gpt_txn_at);
CREATE INDEX idx_gpt_tenant_category    ON gam_points_txn (gpt_tenant_id, gpt_event_category_code);
CREATE INDEX idx_gpt_tenant_time        ON gam_points_txn (gpt_tenant_id, gpt_txn_at);
CREATE INDEX idx_gpt_tenant_source      ON gam_points_txn (gpt_tenant_id, gpt_source_domain, gpt_source_id);


-- ---------------------------------------------------------
-- 3. Tenant-level points rules
-- ---------------------------------------------------------

CREATE TABLE gam_points_rule (
    grl_id             BIGSERIAL PRIMARY KEY,
    grl_tenant_id      BIGINT       NOT NULL,

    grl_template_code  VARCHAR(100) NOT NULL,   -- ONBOARDING_COMPLETE, TIMELY_SELF_REVIEW, etc.
    grl_enabled        BOOLEAN      NOT NULL DEFAULT TRUE,
    grl_points_awarded INTEGER      NOT NULL,
    grl_condition_scope JSONB       NULL,       -- optional JSON with thresholds, filters, etc.
    grl_effective_from DATE         NOT NULL,
    grl_effective_to   DATE         NULL,

    grl_created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    grl_created_by     BIGINT       NULL,
    grl_updated_at     TIMESTAMPTZ  NULL,
    grl_updated_by     BIGINT       NULL,
    grl_deleted_at     TIMESTAMPTZ  NULL,
    grl_deleted_by     BIGINT       NULL,

    CONSTRAINT fk_grl_tenant
        FOREIGN KEY (grl_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT uq_grl_tenant_template
        UNIQUE (grl_tenant_id, grl_template_code)
);

COMMENT ON TABLE gam_points_rule IS 'Configures how many points to award for specific behaviours per tenant.';

CREATE INDEX idx_grl_tenant_id      ON gam_points_rule (grl_tenant_id);
CREATE INDEX idx_grl_tenant_enabled ON gam_points_rule (grl_tenant_id, grl_enabled);


-- ---------------------------------------------------------
-- 5. Challenge definitions (Quarter of Recovery, Check-in Cadence, etc.)
-- ---------------------------------------------------------

CREATE TABLE gam_challenge_def (
    gcd_id                 BIGSERIAL PRIMARY KEY,
    gcd_tenant_id          BIGINT        NOT NULL,

    gcd_code               VARCHAR(50)   NOT NULL,
    gcd_name               VARCHAR(200)  NOT NULL,
    gcd_description        TEXT          NULL,
    gcd_challenge_type_code VARCHAR(50)  NOT NULL,   -- PLANNED_BREAKS, CHECKIN_CADENCE, etc.
    gcd_eligibility_config JSONB         NULL,       -- which teams/org units eligible
    gcd_target_definition  TEXT          NULL,       -- human-readable success criteria
    gcd_is_active          BOOLEAN       NOT NULL DEFAULT TRUE,
    gcd_start_date         DATE          NULL,       -- optional global window
    gcd_end_date           DATE          NULL,

    gcd_created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
    gcd_created_by         BIGINT        NULL,
    gcd_updated_at         TIMESTAMPTZ   NULL,
    gcd_updated_by         BIGINT        NULL,
    gcd_deleted_at         TIMESTAMPTZ   NULL,
    gcd_deleted_by         BIGINT        NULL,

    CONSTRAINT fk_gcd_tenant
        FOREIGN KEY (gcd_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT uq_gcd_tenant_code
        UNIQUE (gcd_tenant_id, gcd_code)
);

COMMENT ON TABLE gam_challenge_def IS 'Templates for team-based wellbeing challenges.';

CREATE INDEX idx_gcd_tenant_id    ON gam_challenge_def (gcd_tenant_id);
CREATE INDEX idx_gcd_tenant_active ON gam_challenge_def (gcd_tenant_id, gcd_is_active);


-- ---------------------------------------------------------
-- 6. Team challenge participation snapshots
-- ---------------------------------------------------------

CREATE TABLE gam_challenge_participation (
    gcp_id              BIGSERIAL PRIMARY KEY,
    gcp_tenant_id       BIGINT        NOT NULL,
    gcp_gcd_id          BIGINT        NOT NULL,
    gcp_unt_id          BIGINT        NOT NULL,

    gcp_start_date      DATE          NOT NULL,
    gcp_end_date        DATE          NULL,
    gcp_eligible_count  INTEGER       NOT NULL DEFAULT 0,
    gcp_completed_count INTEGER       NOT NULL DEFAULT 0,
    gcp_completion_pct  NUMERIC(5,2)  NULL,     -- cached, derived %
    gcp_status_code     VARCHAR(50)   NOT NULL, -- NOT_STARTED, IN_PROGRESS, COMPLETED
    gcp_summary         TEXT          NULL,

    gcp_created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    gcp_created_by      BIGINT        NULL,
    gcp_updated_at      TIMESTAMPTZ   NULL,
    gcp_updated_by      BIGINT        NULL,
    gcp_deleted_at      TIMESTAMPTZ   NULL,
    gcp_deleted_by      BIGINT        NULL,

    CONSTRAINT fk_gcp_tenant
        FOREIGN KEY (gcp_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_gcp_gcd
        FOREIGN KEY (gcp_gcd_id) REFERENCES gam_challenge_def (gcd_id),
    CONSTRAINT fk_gcp_unt
        FOREIGN KEY (gcp_unt_id) REFERENCES org_unit (unt_id),
    CONSTRAINT uq_gcp_tenant_challenge_team_start
        UNIQUE (gcp_tenant_id, gcp_gcd_id, gcp_unt_id, gcp_start_date)
);

COMMENT ON TABLE gam_challenge_participation IS 'Aggregated participation/completion stats per team and challenge instance.';

CREATE INDEX idx_gcp_tenant_id      ON gam_challenge_participation (gcp_tenant_id);
CREATE INDEX idx_gcp_gcd_id         ON gam_challenge_participation (gcp_gcd_id);
CREATE INDEX idx_gcp_unt_id         ON gam_challenge_participation (gcp_unt_id);
CREATE INDEX idx_gcp_tenant_status  ON gam_challenge_participation (gcp_tenant_id, gcp_status_code);
CREATE INDEX idx_gcp_team_status    ON gam_challenge_participation (gcp_tenant_id, gcp_unt_id, gcp_status_code);


-- ---------------------------------------------------------
-- 7. Manager health stewardship scorecard
-- ---------------------------------------------------------

CREATE TABLE gam_manager_scorecard (
    gms_id                    BIGSERIAL PRIMARY KEY,
    gms_tenant_id             BIGINT        NOT NULL,
    gms_emp_id                BIGINT        NOT NULL, -- manager employee

    gms_time_window_type_code VARCHAR(50)   NOT NULL,   -- MONTH, QUARTER, YEAR, etc.
    gms_time_window_key       VARCHAR(50)   NOT NULL,   -- 2025-01, 2025_Q1, etc.

    gms_team_size             INTEGER       NOT NULL DEFAULT 0,
    gms_pct_with_planned_breaks NUMERIC(5,2) NULL,      -- %
    gms_checkin_cadence       NUMERIC(5,2)  NULL,       -- avg check-ins per person per period
    gms_recovery_green_count  INTEGER       NULL,
    gms_recovery_amber_count  INTEGER       NULL,
    gms_recovery_red_count    INTEGER       NULL,
    gms_stewardship_score     NUMERIC(5,2)  NULL,
    gms_computed_at           TIMESTAMPTZ   NOT NULL,

    gms_created_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
    gms_created_by            BIGINT        NULL,
    gms_updated_at            TIMESTAMPTZ   NULL,
    gms_updated_by            BIGINT        NULL,
    gms_deleted_at            TIMESTAMPTZ   NULL,
    gms_deleted_by            BIGINT        NULL,

    CONSTRAINT fk_gms_tenant
        FOREIGN KEY (gms_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_gms_emp
        FOREIGN KEY (gms_emp_id) REFERENCES pid_employee (emp_id),
    CONSTRAINT uq_gms_manager_window
        UNIQUE (gms_tenant_id, gms_emp_id, gms_time_window_type_code, gms_time_window_key)
);

COMMENT ON TABLE gam_manager_scorecard IS 'Snapshot of a manager''s wellbeing stewardship for a given time window.';

CREATE INDEX idx_gms_tenant_id      ON gam_manager_scorecard (gms_tenant_id);
CREATE INDEX idx_gms_emp_id         ON gam_manager_scorecard (gms_emp_id);
CREATE INDEX idx_gms_tenant_window  ON gam_manager_scorecard (gms_tenant_id, gms_time_window_type_code, gms_time_window_key);


-- ---------------------------------------------------------
-- 8. Badge definitions
-- ---------------------------------------------------------

CREATE TABLE gam_badge (
    gbd_id                 BIGSERIAL PRIMARY KEY,
    gbd_tenant_id          BIGINT       NOT NULL,

    gbd_code               VARCHAR(50)  NOT NULL,
    gbd_name               VARCHAR(200) NOT NULL,
    gbd_description        TEXT         NULL,
    gbd_category_code      VARCHAR(50)  NOT NULL,  -- RECOVERY, REFLECTION, WELLNESS, etc.
    gbd_criteria_description TEXT       NULL,
    gbd_is_active          BOOLEAN      NOT NULL DEFAULT TRUE,

    gbd_created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    gbd_created_by         BIGINT       NULL,
    gbd_updated_at         TIMESTAMPTZ  NULL,
    gbd_updated_by         BIGINT       NULL,
    gbd_deleted_at         TIMESTAMPTZ  NULL,
    gbd_deleted_by         BIGINT       NULL,

    CONSTRAINT fk_gbd_tenant
        FOREIGN KEY (gbd_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT uq_gbd_tenant_code
        UNIQUE (gbd_tenant_id, gbd_code)
);

COMMENT ON TABLE gam_badge IS 'Badges representing key wellbeing behaviours/achievements.';

CREATE INDEX idx_gbd_tenant_id     ON gam_badge (gbd_tenant_id);
CREATE INDEX idx_gbd_tenant_active ON gam_badge (gbd_tenant_id, gbd_is_active);


-- ---------------------------------------------------------
-- 9. Badge awards to employees
-- ---------------------------------------------------------

CREATE TABLE gam_badge_award (
    gba_id             BIGSERIAL PRIMARY KEY,
    gba_tenant_id      BIGINT       NOT NULL,
    gba_gbd_id         BIGINT       NOT NULL,
    gba_emp_id         BIGINT       NOT NULL,
    gba_gpr_id         BIGINT       NULL,

    gba_awarded_at     TIMESTAMPTZ  NOT NULL,
    gba_award_source_code VARCHAR(50) NOT NULL,  -- AUTO_RULE, MANAGER, HR
    gba_message        TEXT         NULL,

    gba_created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    gba_created_by     BIGINT       NULL,
    gba_updated_at     TIMESTAMPTZ  NULL,
    gba_updated_by     BIGINT       NULL,
    gba_deleted_at     TIMESTAMPTZ  NULL,
    gba_deleted_by     BIGINT       NULL,

    CONSTRAINT fk_gba_tenant
        FOREIGN KEY (gba_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_gba_gbd
        FOREIGN KEY (gba_gbd_id) REFERENCES gam_badge (gbd_id),
    CONSTRAINT fk_gba_emp
        FOREIGN KEY (gba_emp_id) REFERENCES pid_employee (emp_id),
    CONSTRAINT fk_gba_gpr
        FOREIGN KEY (gba_gpr_id) REFERENCES gam_profile (gpr_id)
);

COMMENT ON TABLE gam_badge_award IS 'History of employees earning badges; optionally linked to their profile.';

CREATE INDEX idx_gba_tenant_id   ON gam_badge_award (gba_tenant_id);
CREATE INDEX idx_gba_emp_id      ON gam_badge_award (gba_emp_id);
CREATE INDEX idx_gba_gbd_id      ON gam_badge_award (gba_gbd_id);
CREATE INDEX idx_gba_gpr_id      ON gam_badge_award (gba_gpr_id);
CREATE INDEX idx_gba_emp_time    ON gam_badge_award (gba_tenant_id, gba_emp_id, gba_awarded_at);
CREATE INDEX idx_gba_emp_badge   ON gam_badge_award (gba_tenant_id, gba_emp_id, gba_gbd_id);


-- ---------------------------------------------------------
-- 10. Visual ring snapshots (Recovery / Reflection / Wellness)
-- ---------------------------------------------------------

CREATE TABLE gam_visual_state (
    gvs_id                    BIGSERIAL PRIMARY KEY,
    gvs_tenant_id             BIGINT        NOT NULL,
    gvs_emp_id                BIGINT        NOT NULL,
    gvs_gpr_id                BIGINT        NULL,

    gvs_time_window_type_code VARCHAR(50)   NOT NULL,   -- DAY, WEEK, MONTH, etc.
    gvs_time_window_key       VARCHAR(50)   NOT NULL,   -- e.g. 2025-01-15, 2025-W05, 2025-01
    gvs_recovery_ring_value   NUMERIC(5,2)  NULL,       -- 0–100
    gvs_reflection_ring_value NUMERIC(5,2)  NULL,
    gvs_wellness_ring_value   NUMERIC(5,2)  NULL,
    gvs_computed_at           TIMESTAMPTZ   NOT NULL,

    gvs_created_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
    gvs_created_by            BIGINT        NULL,
    gvs_updated_at            TIMESTAMPTZ   NULL,
    gvs_updated_by            BIGINT        NULL,
    gvs_deleted_at            TIMESTAMPTZ   NULL,
    gvs_deleted_by            BIGINT        NULL,

    CONSTRAINT fk_gvs_tenant
        FOREIGN KEY (gvs_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_gvs_emp
        FOREIGN KEY (gvs_emp_id) REFERENCES pid_employee (emp_id),
    CONSTRAINT fk_gvs_gpr
        FOREIGN KEY (gvs_gpr_id) REFERENCES gam_profile (gpr_id),
    CONSTRAINT uq_gvs_emp_window
        UNIQUE (gvs_tenant_id, gvs_emp_id, gvs_time_window_type_code, gvs_time_window_key)
);

COMMENT ON TABLE gam_visual_state IS 'Cached ring values per employee and time window; computed from Leave, Performance, and Gamification data.';

CREATE INDEX idx_gvs_tenant_id     ON gam_visual_state (gvs_tenant_id);
CREATE INDEX idx_gvs_emp_id        ON gam_visual_state (gvs_emp_id);
CREATE INDEX idx_gvs_gpr_id        ON gam_visual_state (gvs_gpr_id);
CREATE INDEX idx_gvs_tenant_window ON gam_visual_state (gvs_tenant_id, gvs_time_window_type_code, gvs_time_window_key);

-- =========================================================
-- End of Gamification Layer DDL
-- =========================================================
```

**Notes / Dependencies**

* This script **assumes a clean schema** (no existing tables with these names). In your real migration system you can wrap with `CREATE TABLE IF NOT EXISTS` or split into versioned migrations as needed.
* `sys_tenant`, `pid_employee`, and `org_unit` are included here as **stubs** so the DDL is self-contained.

  * In your full platform, those tables should come from the **System / Shared**, **People & Identity**, and **Work Lattice** domains respectively, and you should **remove or skip** these stub definitions there.
