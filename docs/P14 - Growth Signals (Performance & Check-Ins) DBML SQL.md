Here’s a single PostgreSQL DDL script for the **Growth Signals (Performance & Check-Ins)** domain.

**Assumptions:**

* Assumes a **clean schema** (no existing tables with these names).
* Includes minimal **stub tables** for `sys_tenant`, `pid_employee`, and `org_job_role` so this file is self-contained.

  * In your real, integrated schema, you should **drop or skip** these stub definitions and use the canonical versions from the System / People / Work Lattice domains.

---

```sql
-- ============================================
-- Domain: Growth Signals (Performance & Check-Ins)
-- Schema: public (default)
-- Assumption: clean schema, no existing tables
-- ============================================

-- ------------------------------------------------
-- System / Shared stubs (for FK references)
-- ------------------------------------------------

CREATE TABLE sys_tenant (
    ten_id   bigserial PRIMARY KEY,
    ten_name varchar(200) NOT NULL
);

COMMENT ON TABLE sys_tenant IS
    'Tenant table (stub; full definition lives in System / Shared domain).';


CREATE TABLE pid_employee (
    emp_id        bigserial PRIMARY KEY,
    emp_tenant_id bigint NOT NULL REFERENCES sys_tenant(ten_id)
);

COMMENT ON TABLE pid_employee IS
    'Employee table (stub; full definition lives in People & Identity domain).';


CREATE TABLE org_job_role (
    jbr_id        bigserial PRIMARY KEY,
    jbr_tenant_id bigint       NOT NULL REFERENCES sys_tenant(ten_id),
    jbr_code      varchar(50)  NOT NULL,
    jbr_name      varchar(200) NOT NULL
);

COMMENT ON TABLE org_job_role IS
    'Job role table (stub; full definition lives in Work Lattice domain).';

CREATE INDEX idx_jbr_tenant_id
    ON org_job_role (jbr_tenant_id);

CREATE UNIQUE INDEX uq_jbr_tenant_code
    ON org_job_role (jbr_tenant_id, jbr_code);

-- ------------------------------------------------
-- Performance & Check-Ins (Growth Signals)
-- ------------------------------------------------

-- Performance cycle (e.g. 2025_H1)
CREATE TABLE prf_perf_cycle (
    pcl_id          bigserial PRIMARY KEY,
    pcl_tenant_id   bigint       NOT NULL REFERENCES sys_tenant(ten_id),
    pcl_code        varchar(50)  NOT NULL,  -- e.g. 2025_H1
    pcl_name        varchar(200) NOT NULL,
    pcl_start_date  date         NOT NULL,
    pcl_end_date    date         NOT NULL,
    pcl_status_code varchar(50)  NOT NULL,  -- PLANNED, ACTIVE, CLOSED, etc.
    pcl_created_at  timestamptz  NOT NULL DEFAULT now(),
    pcl_created_by  bigint       NULL,
    pcl_updated_at  timestamptz  NULL,
    pcl_updated_by  bigint       NULL,
    pcl_deleted_at  timestamptz  NULL,
    pcl_deleted_by  bigint       NULL
);

COMMENT ON TABLE prf_perf_cycle IS
    'Performance cycle window per tenant.';

CREATE INDEX idx_pcl_tenant_id
    ON prf_perf_cycle (pcl_tenant_id);

CREATE UNIQUE INDEX uq_pcl_tenant_code
    ON prf_perf_cycle (pcl_tenant_id, pcl_code);

CREATE INDEX idx_pcl_tenant_status
    ON prf_perf_cycle (pcl_tenant_id, pcl_status_code);


-- Appraisal template definition
CREATE TABLE prf_perf_template (
    ptm_id          bigserial PRIMARY KEY,
    ptm_tenant_id   bigint       NOT NULL REFERENCES sys_tenant(ten_id),
    ptm_name        varchar(200) NOT NULL,
    ptm_description text         NULL,
    ptm_is_active   boolean      NOT NULL DEFAULT true,
    ptm_created_at  timestamptz  NOT NULL DEFAULT now(),
    ptm_created_by  bigint       NULL,
    ptm_updated_at  timestamptz  NULL,
    ptm_updated_by  bigint       NULL,
    ptm_deleted_at  timestamptz  NULL,
    ptm_deleted_by  bigint       NULL
);

COMMENT ON TABLE prf_perf_template IS
    'Top-level appraisal template (sections & questions hang off this).';

CREATE INDEX idx_ptm_tenant_id
    ON prf_perf_template (ptm_tenant_id);

CREATE UNIQUE INDEX uq_ptm_tenant_name
    ON prf_perf_template (ptm_tenant_id, ptm_name);

CREATE INDEX idx_ptm_tenant_active
    ON prf_perf_template (ptm_tenant_id, ptm_is_active);


-- Assignment of templates to scopes (job role, org unit, etc.)
CREATE TABLE prf_perf_template_assign (
    pta_id              bigserial PRIMARY KEY,
    pta_tenant_id       bigint       NOT NULL REFERENCES sys_tenant(ten_id),
    pta_ptm_id          bigint       NOT NULL REFERENCES prf_perf_template(ptm_id),
    pta_jbr_id          bigint       NULL REFERENCES org_job_role(jbr_id), -- when scope_type = JOB_ROLE
    pta_scope_type_code varchar(50)  NOT NULL,   -- JOB_ROLE, ORG_UNIT, TENANT_DEFAULT, etc.
    pta_scope_value     varchar(100) NULL,       -- e.g. org unit code, grade code
    pta_effective_from  date         NOT NULL,
    pta_effective_to    date         NULL,
    pta_priority        int          NOT NULL DEFAULT 100,
    pta_created_at      timestamptz  NOT NULL DEFAULT now(),
    pta_created_by      bigint       NULL,
    pta_updated_at      timestamptz  NULL,
    pta_updated_by      bigint       NULL,
    pta_deleted_at      timestamptz  NULL,
    pta_deleted_by      bigint       NULL
);

COMMENT ON TABLE prf_perf_template_assign IS
    'Determines which template applies to which population (job roles, org units, etc.).';

CREATE INDEX idx_pta_tenant_id
    ON prf_perf_template_assign (pta_tenant_id);

CREATE INDEX idx_pta_ptm_id
    ON prf_perf_template_assign (pta_ptm_id);

CREATE INDEX idx_pta_jbr_id
    ON prf_perf_template_assign (pta_jbr_id);

CREATE INDEX idx_pta_scope_from
    ON prf_perf_template_assign (
        pta_tenant_id,
        pta_scope_type_code,
        pta_scope_value,
        pta_jbr_id,
        pta_effective_from
    );


-- Sections within a template (e.g. KPIs, OKRs, Values)
CREATE TABLE prf_perf_section (
    psc_id                bigserial PRIMARY KEY,
    psc_tenant_id         bigint       NOT NULL REFERENCES sys_tenant(ten_id),
    psc_ptm_id            bigint       NOT NULL REFERENCES prf_perf_template(ptm_id),
    psc_section_type_code varchar(50)  NOT NULL,   -- KPIS, OKRS, VALUES, NARRATIVE, etc.
    psc_label             varchar(200) NOT NULL,
    psc_is_scoring        boolean      NOT NULL DEFAULT true,
    psc_weight_pct        numeric(5,2) NULL,       -- contribution to overall score
    psc_sequence          int          NOT NULL,   -- order within template
    psc_created_at        timestamptz  NOT NULL DEFAULT now(),
    psc_created_by        bigint       NULL,
    psc_updated_at        timestamptz  NULL,
    psc_updated_by        bigint       NULL,
    psc_deleted_at        timestamptz  NULL,
    psc_deleted_by        bigint       NULL
);

COMMENT ON TABLE prf_perf_section IS
    'Logical sections within a template; used for scoring and grouping.';

CREATE INDEX idx_psc_tenant_id
    ON prf_perf_section (psc_tenant_id);

CREATE INDEX idx_psc_ptm_id
    ON prf_perf_section (psc_ptm_id);

CREATE UNIQUE INDEX uq_psc_template_sequence
    ON prf_perf_section (psc_tenant_id, psc_ptm_id, psc_sequence);


-- Questions in narrative/behavioural sections
CREATE TABLE prf_perf_question (
    pqs_id                 bigserial PRIMARY KEY,
    pqs_tenant_id          bigint       NOT NULL REFERENCES sys_tenant(ten_id),
    pqs_psc_id             bigint       NOT NULL REFERENCES prf_perf_section(psc_id),
    pqs_text               text         NOT NULL,
    pqs_help_text          text         NULL,
    pqs_response_type_code varchar(50)  NOT NULL,   -- RATING_1_5, TEXT, etc.
    pqs_inner_weight       numeric(5,2) NULL,       -- weight within section
    pqs_is_active          boolean      NOT NULL DEFAULT true,
    pqs_sequence           int          NOT NULL DEFAULT 1,
    pqs_created_at         timestamptz  NOT NULL DEFAULT now(),
    pqs_created_by         bigint       NULL,
    pqs_updated_at         timestamptz  NULL,
    pqs_updated_by         bigint       NULL,
    pqs_deleted_at         timestamptz  NULL,
    pqs_deleted_by         bigint       NULL
);

COMMENT ON TABLE prf_perf_question IS
    'Questions used for self/manager/final narrative or behaviour ratings.';

CREATE INDEX idx_pqs_tenant_id
    ON prf_perf_question (pqs_tenant_id);

CREATE INDEX idx_pqs_psc_id
    ON prf_perf_question (pqs_psc_id);

CREATE UNIQUE INDEX uq_pqs_section_sequence
    ON prf_perf_question (pqs_tenant_id, pqs_psc_id, pqs_sequence);


-- Overall rating bands (e.g. Outstanding, Solid, Needs Support)
CREATE TABLE prf_rating_band (
    rbd_id         bigserial PRIMARY KEY,
    rbd_tenant_id  bigint       NOT NULL REFERENCES sys_tenant(ten_id),
    rbd_name       varchar(100) NOT NULL,
    rbd_description text        NULL,
    rbd_is_active  boolean      NOT NULL DEFAULT true,
    rbd_created_at timestamptz  NOT NULL DEFAULT now(),
    rbd_created_by bigint       NULL,
    rbd_updated_at timestamptz  NULL,
    rbd_updated_by bigint       NULL,
    rbd_deleted_at timestamptz  NULL,
    rbd_deleted_by bigint       NULL
);

COMMENT ON TABLE prf_rating_band IS
    'Tenant-specific performance rating banding schemes.';

CREATE INDEX idx_rbd_tenant_id
    ON prf_rating_band (rbd_tenant_id);

CREATE UNIQUE INDEX uq_rbd_tenant_name
    ON prf_rating_band (rbd_tenant_id, rbd_name);

CREATE INDEX idx_rbd_tenant_active
    ON prf_rating_band (rbd_tenant_id, rbd_is_active);


-- Score ranges within a rating band
CREATE TABLE prf_rating_band_range (
    rbr_id        bigserial PRIMARY KEY,
    rbr_tenant_id bigint       NOT NULL REFERENCES sys_tenant(ten_id),
    rbr_rbd_id    bigint       NOT NULL REFERENCES prf_rating_band(rbd_id),
    rbr_code      varchar(50)  NOT NULL,    -- e.g. A, B, C or OUTSTANDING, etc.
    rbr_label     varchar(100) NOT NULL,
    rbr_min_score numeric(5,2) NOT NULL,
    rbr_max_score numeric(5,2) NOT NULL,
    rbr_sequence  int          NOT NULL,
    rbr_is_active boolean      NOT NULL DEFAULT true,
    rbr_created_at timestamptz NOT NULL DEFAULT now(),
    rbr_created_by bigint      NULL,
    rbr_updated_at timestamptz NULL,
    rbr_updated_by bigint      NULL,
    rbr_deleted_at timestamptz NULL,
    rbr_deleted_by bigint      NULL
);

COMMENT ON TABLE prf_rating_band_range IS
    'Maps overall scores to named rating labels for a given scheme.';

CREATE INDEX idx_rbr_tenant_id
    ON prf_rating_band_range (rbr_tenant_id);

CREATE INDEX idx_rbr_rbd_id
    ON prf_rating_band_range (rbr_rbd_id);

CREATE UNIQUE INDEX uq_rbr_band_code
    ON prf_rating_band_range (rbr_tenant_id, rbr_rbd_id, rbr_code);

CREATE INDEX idx_rbr_band_seq
    ON prf_rating_band_range (rbr_tenant_id, rbr_rbd_id, rbr_sequence);

CREATE INDEX idx_rbr_band_active
    ON prf_rating_band_range (rbr_tenant_id, rbr_rbd_id, rbr_is_active);


-- Appraisal instance per employee per cycle
CREATE TABLE prf_perf_appraisal (
    pap_id                  bigserial PRIMARY KEY,
    pap_tenant_id           bigint        NOT NULL REFERENCES sys_tenant(ten_id),
    pap_emp_id              bigint        NOT NULL REFERENCES pid_employee(emp_id),
    pap_pcl_id              bigint        NOT NULL REFERENCES prf_perf_cycle(pcl_id),
    pap_ptm_id              bigint        NOT NULL REFERENCES prf_perf_template(ptm_id),
    pap_rbd_id              bigint        NULL REFERENCES prf_rating_band(rbd_id),
    pap_status_code         varchar(50)   NOT NULL,   -- DRAFT, IN_PROGRESS, IN_REVIEW, FINALIZED, etc.
    pap_self_completed_at   timestamptz   NULL,
    pap_manager_completed_at timestamptz  NULL,
    pap_finalized_at        timestamptz   NULL,
    pap_overall_score       numeric(5,2)  NULL,
    pap_overall_rating_code varchar(50)   NULL,       -- e.g. OUTSTANDING, SOLID, etc.
    pap_is_locked           boolean       NOT NULL DEFAULT false,
    pap_created_at          timestamptz   NOT NULL DEFAULT now(),
    pap_created_by          bigint        NULL,
    pap_updated_at          timestamptz   NULL,
    pap_updated_by          bigint        NULL,
    pap_deleted_at          timestamptz   NULL,
    pap_deleted_by          bigint        NULL
);

COMMENT ON TABLE prf_perf_appraisal IS
    'Core appraisal record per employee per cycle, referencing template and rating band scheme.';

CREATE INDEX idx_pap_tenant_id
    ON prf_perf_appraisal (pap_tenant_id);

CREATE INDEX idx_pap_emp_id
    ON prf_perf_appraisal (pap_emp_id);

CREATE INDEX idx_pap_pcl_id
    ON prf_perf_appraisal (pap_pcl_id);

CREATE INDEX idx_pap_ptm_id
    ON prf_perf_appraisal (pap_ptm_id);

CREATE INDEX idx_pap_rbd_id
    ON prf_perf_appraisal (pap_rbd_id);

CREATE UNIQUE INDEX uq_pap_emp_cycle
    ON prf_perf_appraisal (pap_tenant_id, pap_emp_id, pap_pcl_id);

CREATE INDEX idx_pap_tenant_status
    ON prf_perf_appraisal (pap_tenant_id, pap_status_code);

CREATE INDEX idx_pap_tenant_emp_status
    ON prf_perf_appraisal (pap_tenant_id, pap_emp_id, pap_status_code);

CREATE INDEX idx_pap_tenant_cycle_status
    ON prf_perf_appraisal (pap_tenant_id, pap_pcl_id, pap_status_code);


-- Answers per appraisal-question pair
CREATE TABLE prf_perf_answer (
    pan_id             bigserial PRIMARY KEY,
    pan_tenant_id      bigint        NOT NULL REFERENCES sys_tenant(ten_id),
    pan_pap_id         bigint        NOT NULL REFERENCES prf_perf_appraisal(pap_id),
    pan_pqs_id         bigint        NOT NULL REFERENCES prf_perf_question(pqs_id),
    pan_self_rating    numeric(5,2)  NULL,
    pan_self_comment   text          NULL,
    pan_manager_rating numeric(5,2)  NULL,
    pan_manager_comment text         NULL,
    pan_final_rating   numeric(5,2)  NULL,
    pan_final_comment  text          NULL,
    pan_created_at     timestamptz   NOT NULL DEFAULT now(),
    pan_created_by     bigint        NULL,
    pan_updated_at     timestamptz   NULL,
    pan_updated_by     bigint        NULL,
    pan_deleted_at     timestamptz   NULL,
    pan_deleted_by     bigint        NULL
);

COMMENT ON TABLE prf_perf_answer IS
    'Stores self, manager, and final ratings/comments for each question in an appraisal.';

CREATE INDEX idx_pan_tenant_id
    ON prf_perf_answer (pan_tenant_id);

CREATE INDEX idx_pan_pap_id
    ON prf_perf_answer (pan_pap_id);

CREATE INDEX idx_pan_pqs_id
    ON prf_perf_answer (pan_pqs_id);

CREATE UNIQUE INDEX uq_pan_appraisal_question
    ON prf_perf_answer (pan_tenant_id, pan_pap_id, pan_pqs_id);


-- KPI/OKR/performance items inside an appraisal
CREATE TABLE prf_perf_item (
    pit_id              bigserial PRIMARY KEY,
    pit_tenant_id       bigint        NOT NULL REFERENCES sys_tenant(ten_id),
    pit_pap_id          bigint        NOT NULL REFERENCES prf_perf_appraisal(pap_id),
    pit_psc_id          bigint        NULL REFERENCES prf_perf_section(psc_id),
    pit_item_type_code  varchar(50)   NOT NULL,    -- KPI, OKR, DEV_PLAN, etc.
    pit_title           varchar(255)  NOT NULL,
    pit_description     text          NULL,
    pit_role_context    varchar(50)   NULL,        -- INDIVIDUAL, TEAM, MANAGER, etc.
    pit_target_or_measure text        NULL,
    pit_weight_pct      numeric(5,2)  NULL,
    pit_self_rating     numeric(5,2)  NULL,
    pit_self_comment    text          NULL,
    pit_manager_rating  numeric(5,2)  NULL,
    pit_manager_comment text          NULL,
    pit_final_rating    numeric(5,2)  NULL,
    pit_final_comment   text          NULL,
    pit_sequence        int           NULL,
    pit_created_at      timestamptz   NOT NULL DEFAULT now(),
    pit_created_by      bigint        NULL,
    pit_updated_at      timestamptz   NULL,
    pit_updated_by      bigint        NULL,
    pit_deleted_at      timestamptz   NULL,
    pit_deleted_by      bigint        NULL
);

COMMENT ON TABLE prf_perf_item IS
    'Unified representation for KPIs, OKRs, and similar items with their own ratings.';

CREATE INDEX idx_pit_tenant_id
    ON prf_perf_item (pit_tenant_id);

CREATE INDEX idx_pit_pap_id
    ON prf_perf_item (pit_pap_id);

CREATE INDEX idx_pit_psc_id
    ON prf_perf_item (pit_psc_id);

CREATE INDEX idx_pit_appraisal_sequence
    ON prf_perf_item (pit_tenant_id, pit_pap_id, pit_sequence);


-- Growth / wellness / development actions agreed in appraisals
CREATE TABLE prf_perf_action (
    pac_id             bigserial PRIMARY KEY,
    pac_tenant_id      bigint        NOT NULL REFERENCES sys_tenant(ten_id),
    pac_pap_id         bigint        NOT NULL REFERENCES prf_perf_appraisal(pap_id),
    pac_owner_emp_id   bigint        NOT NULL REFERENCES pid_employee(emp_id),
    pac_action_type_code varchar(50) NOT NULL,    -- DEVELOPMENT, WELLNESS, ROLE_CHANGE, etc.
    pac_description    text          NOT NULL,
    pac_target_date    date          NULL,
    pac_status_code    varchar(50)   NOT NULL,    -- OPEN, IN_PROGRESS, COMPLETED, CANCELLED
    pac_created_at     timestamptz   NOT NULL DEFAULT now(),
    pac_created_by     bigint        NULL,
    pac_updated_at     timestamptz   NULL,
    pac_updated_by     bigint        NULL,
    pac_deleted_at     timestamptz   NULL,
    pac_deleted_by     bigint        NULL
);

COMMENT ON TABLE prf_perf_action IS
    'Track follow-up actions from appraisals with owners and due dates.';

CREATE INDEX idx_pac_tenant_id
    ON prf_perf_action (pac_tenant_id);

CREATE INDEX idx_pac_pap_id
    ON prf_perf_action (pac_pap_id);

CREATE INDEX idx_pac_owner_emp_id
    ON prf_perf_action (pac_owner_emp_id);

CREATE INDEX idx_pac_tenant_status
    ON prf_perf_action (pac_tenant_id, pac_status_code);

CREATE INDEX idx_pac_owner_status_due
    ON prf_perf_action (pac_tenant_id, pac_owner_emp_id, pac_status_code, pac_target_date);


-- 1:1 check-ins with wellbeing signals
CREATE TABLE prf_checkin (
    chk_id             bigserial PRIMARY KEY,
    chk_tenant_id      bigint        NOT NULL REFERENCES sys_tenant(ten_id),
    chk_subject_emp_id bigint        NOT NULL REFERENCES pid_employee(emp_id),  -- employee being checked in on
    chk_manager_emp_id bigint        NOT NULL REFERENCES pid_employee(emp_id),  -- manager/coach running the check-in
    chk_datetime       timestamptz   NOT NULL,
    chk_summary        text          NULL,
    chk_energy_score   numeric(3,1)  NULL,   -- e.g. 1.0-10.0
    chk_workload_score numeric(3,1)  NULL,
    chk_stress_score   numeric(3,1)  NULL,
    chk_created_at     timestamptz   NOT NULL DEFAULT now(),
    chk_created_by     bigint        NULL,
    chk_updated_at     timestamptz   NULL,
    chk_updated_by     bigint        NULL,
    chk_deleted_at     timestamptz   NULL,
    chk_deleted_by     bigint        NULL
);

COMMENT ON TABLE prf_checkin IS
    '1:1 check-ins capturing short narrative plus simple wellbeing scores.';

CREATE INDEX idx_chk_tenant_id
    ON prf_checkin (chk_tenant_id);

CREATE INDEX idx_chk_subject_emp_id
    ON prf_checkin (chk_subject_emp_id);

CREATE INDEX idx_chk_manager_emp_id
    ON prf_checkin (chk_manager_emp_id);

CREATE INDEX idx_chk_subject_time
    ON prf_checkin (chk_tenant_id, chk_subject_emp_id, chk_datetime);

CREATE INDEX idx_chk_manager_time
    ON prf_checkin (chk_tenant_id, chk_manager_emp_id, chk_datetime);
```

---

### Notes on Cross-Domain Dependencies

* This script declares **stub** versions of:

  * `sys_tenant` (real definition should live in your **System / Shared** domain).
  * `pid_employee` (real definition from **People & Identity** / People Core).
  * `org_job_role` (real definition from **Work Lattice (Org & Jobs)**).

When you assemble a single, unified schema:

* Use the **canonical** `sys_tenant`, `pid_employee`, and `org_job_role` tables from their own domain migrations.
* Remove or guard the stub `CREATE TABLE` statements in this script (e.g. by running this only after the shared tables are created or by manually deleting the stub block).
