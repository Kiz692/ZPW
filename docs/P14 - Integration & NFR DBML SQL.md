```sql
-- ============================================================
-- Domain: Integration & NFR
-- Scope: System, RBAC, Integrations, Imports, Reporting, Audit,
--        Engagement Signals
--
-- Assumption: running on a clean schema (tables do not exist yet).
-- If you need full idempotence, wrap CREATEs in your migration tool.
-- ============================================================

-- ------------------------------------------------------------
-- Core system entities (Tenant, User, Role, UserRole, Employee stub)
-- ------------------------------------------------------------

CREATE TABLE sys_tenant (
    ten_id          BIGSERIAL PRIMARY KEY,
    ten_name        VARCHAR(200) NOT NULL,
    ten_status_code VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    ten_created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    ten_created_by  BIGINT       NULL,
    ten_updated_at  TIMESTAMPTZ  NULL,
    ten_updated_by  BIGINT       NULL,
    CONSTRAINT uq_ten_name UNIQUE (ten_name)
);

COMMENT ON TABLE sys_tenant IS 'Tenant / customer of the HRMS platform.';
COMMENT ON COLUMN sys_tenant.ten_status_code IS 'ACTIVE, SUSPENDED, CLOSED, etc.';


CREATE TABLE sys_user (
    usr_id           BIGSERIAL PRIMARY KEY,
    usr_username     VARCHAR(150) NOT NULL,
    usr_status_code  VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    usr_display_name VARCHAR(200) NULL,
    usr_email        VARCHAR(200) NULL,
    usr_created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    usr_created_by   BIGINT       NULL,
    usr_updated_at   TIMESTAMPTZ  NULL,
    usr_updated_by   BIGINT       NULL,
    CONSTRAINT uq_usr_username UNIQUE (usr_username)
);

COMMENT ON TABLE sys_user IS 'Login identity; can be linked to employees via other domains.';
COMMENT ON COLUMN sys_user.usr_status_code IS 'ACTIVE, DISABLED, INVITED, etc.';


CREATE TABLE sys_role (
    rol_id          BIGSERIAL PRIMARY KEY,
    rol_code        VARCHAR(50)  NOT NULL,
    rol_name        VARCHAR(100) NOT NULL,
    rol_description TEXT         NULL,
    rol_created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    rol_created_by  BIGINT       NULL,
    rol_updated_at  TIMESTAMPTZ  NULL,
    rol_updated_by  BIGINT       NULL,
    CONSTRAINT uq_rol_code UNIQUE (rol_code)
);

COMMENT ON TABLE sys_role IS 'Application role (EMPLOYEE, MANAGER, HR, ADMIN, etc.).';


CREATE TABLE sys_user_role (
    url_id        BIGSERIAL PRIMARY KEY,
    url_tenant_id BIGINT      NOT NULL,
    url_usr_id    BIGINT      NOT NULL,
    url_rol_id    BIGINT      NOT NULL,
    url_status_code VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    url_created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    url_created_by BIGINT      NULL,
    url_updated_at TIMESTAMPTZ NULL,
    url_updated_by BIGINT      NULL,
    CONSTRAINT fk_url_tenant
        FOREIGN KEY (url_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_url_user
        FOREIGN KEY (url_usr_id) REFERENCES sys_user (usr_id),
    CONSTRAINT fk_url_role
        FOREIGN KEY (url_rol_id) REFERENCES sys_role (rol_id),
    CONSTRAINT uq_url_tenant_user_role
        UNIQUE (url_tenant_id, url_usr_id, url_rol_id)
);

COMMENT ON TABLE sys_user_role IS 'Tenant-scoped RBAC link between users and roles.';


CREATE TABLE pid_employee (
    emp_id              BIGSERIAL PRIMARY KEY,
    emp_tenant_id       BIGINT      NOT NULL,
    emp_employee_number VARCHAR(50) NOT NULL,
    emp_status_code     VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    emp_created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    emp_created_by      BIGINT      NULL,
    emp_updated_at      TIMESTAMPTZ NULL,
    emp_updated_by      BIGINT      NULL,
    CONSTRAINT fk_emp_tenant
        FOREIGN KEY (emp_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT uq_emp_tenant_empno
        UNIQUE (emp_tenant_id, emp_employee_number)
);

COMMENT ON TABLE pid_employee IS 'Employee stub; full People & Identity schema lives in its own domain.';
COMMENT ON COLUMN pid_employee.emp_status_code IS 'High-level employee status.';


-- ------------------------------------------------------------
-- Integration events & subscriptions
-- ------------------------------------------------------------

CREATE TABLE sys_integration_event (
    ine_id                  BIGSERIAL PRIMARY KEY,
    ine_tenant_id           BIGINT       NOT NULL,
    ine_event_type_code     VARCHAR(100) NOT NULL,
    ine_subject_entity_type VARCHAR(100) NOT NULL,
    ine_subject_entity_id   VARCHAR(100) NOT NULL,
    ine_payload_summary     TEXT         NULL,
    ine_occurred_at         TIMESTAMPTZ  NOT NULL,
    ine_created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    ine_created_by          BIGINT       NULL,
    ine_updated_at          TIMESTAMPTZ  NULL,
    ine_updated_by          BIGINT       NULL,
    CONSTRAINT fk_ine_tenant
        FOREIGN KEY (ine_tenant_id) REFERENCES sys_tenant (ten_id)
);

COMMENT ON TABLE sys_integration_event IS 'Outbox-style integration event log for a tenant.';


CREATE TABLE sys_integration_subscription (
    ins_id                BIGSERIAL PRIMARY KEY,
    ins_tenant_id         BIGINT       NOT NULL,
    ins_subscriber_system VARCHAR(100) NOT NULL,
    ins_destination_type  VARCHAR(50)  NOT NULL,
    ins_destination_url   VARCHAR(500) NOT NULL,
    ins_is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    ins_created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    ins_created_by        BIGINT       NULL,
    ins_updated_at        TIMESTAMPTZ  NULL,
    ins_updated_by        BIGINT       NULL,
    CONSTRAINT fk_ins_tenant
        FOREIGN KEY (ins_tenant_id) REFERENCES sys_tenant (ten_id)
);

COMMENT ON TABLE sys_integration_subscription IS 'Subscription config for pushing IntegrationEvents to external systems.';


CREATE TABLE sys_int_sub_event_type (
    ise_id             BIGSERIAL PRIMARY KEY,
    ise_tenant_id      BIGINT       NOT NULL,
    ise_ins_id         BIGINT       NOT NULL,
    ise_event_type_code VARCHAR(100) NOT NULL,
    ise_created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    ise_created_by     BIGINT       NULL,
    ise_updated_at     TIMESTAMPTZ  NULL,
    ise_updated_by     BIGINT       NULL,
    CONSTRAINT fk_ise_tenant
        FOREIGN KEY (ise_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_ise_ins
        FOREIGN KEY (ise_ins_id) REFERENCES sys_integration_subscription (ins_id),
    CONSTRAINT uq_ise_subscription_event_type
        UNIQUE (ise_tenant_id, ise_ins_id, ise_event_type_code)
);

COMMENT ON TABLE sys_int_sub_event_type IS 'Event types a subscription is interested in.';


CREATE TABLE sys_event_delivery (
    evd_id             BIGSERIAL PRIMARY KEY,
    evd_tenant_id      BIGINT       NOT NULL,
    evd_ine_id         BIGINT       NOT NULL,
    evd_ins_id         BIGINT       NOT NULL,
    evd_status_code    VARCHAR(50)  NOT NULL,
    evd_attempt_count  INTEGER      NOT NULL DEFAULT 0,
    evd_last_attempt_at TIMESTAMPTZ NULL,
    evd_last_status_code INTEGER    NULL,
    evd_error_message  TEXT         NULL,
    evd_created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    evd_created_by     BIGINT       NULL,
    evd_updated_at     TIMESTAMPTZ  NULL,
    evd_updated_by     BIGINT       NULL,
    CONSTRAINT fk_evd_tenant
        FOREIGN KEY (evd_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_evd_ine
        FOREIGN KEY (evd_ine_id) REFERENCES sys_integration_event (ine_id),
    CONSTRAINT fk_evd_ins
        FOREIGN KEY (evd_ins_id) REFERENCES sys_integration_subscription (ins_id)
);

COMMENT ON TABLE sys_event_delivery IS 'Per-subscription delivery attempts for an IntegrationEvent.';


-- ------------------------------------------------------------
-- Engagement Signals (from external systems)
-- ------------------------------------------------------------

CREATE TABLE sys_engagement_signal (
    egs_id                    BIGSERIAL PRIMARY KEY,
    egs_tenant_id             BIGINT       NOT NULL,
    egs_emp_id                BIGINT       NOT NULL,
    egs_source_system         VARCHAR(100) NOT NULL,
    egs_tags                  JSONB        NULL,
    egs_participation_summary TEXT         NULL,
    egs_received_at           TIMESTAMPTZ  NOT NULL,
    egs_processed_flag        BOOLEAN      NOT NULL DEFAULT FALSE,
    egs_processed_at          TIMESTAMPTZ  NULL,
    egs_created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    egs_created_by            BIGINT       NULL,
    egs_updated_at            TIMESTAMPTZ  NULL,
    egs_updated_by            BIGINT       NULL,
    CONSTRAINT fk_egs_tenant
        FOREIGN KEY (egs_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_egs_emp
        FOREIGN KEY (egs_emp_id) REFERENCES pid_employee (emp_id)
);

COMMENT ON TABLE sys_engagement_signal IS 'Cross-system engagement signals for an employee (events, participation, etc.).';


-- ------------------------------------------------------------
-- Audit logging & workflow definitions
-- ------------------------------------------------------------

CREATE TABLE sys_audit_log (
    aud_id                 BIGSERIAL PRIMARY KEY,
    aud_tenant_id          BIGINT       NOT NULL,
    aud_usr_id             BIGINT       NOT NULL,
    aud_action_type_code   VARCHAR(100) NOT NULL,
    aud_target_entity_type VARCHAR(100) NOT NULL,
    aud_target_entity_id   VARCHAR(100) NOT NULL,
    aud_description        TEXT         NULL,
    aud_occurred_at        TIMESTAMPTZ  NOT NULL,
    aud_created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    aud_created_by         BIGINT       NULL,
    CONSTRAINT fk_aud_tenant
        FOREIGN KEY (aud_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_aud_user
        FOREIGN KEY (aud_usr_id) REFERENCES sys_user (usr_id)
);

COMMENT ON TABLE sys_audit_log IS 'Structured audit trail entries with actor and target.';


CREATE TABLE sys_workflow_def (
    wfd_id            BIGSERIAL PRIMARY KEY,
    wfd_tenant_id     BIGINT       NOT NULL,
    wfd_workflow_code VARCHAR(100) NOT NULL,
    wfd_process_type  VARCHAR(100) NOT NULL,
    wfd_levels        INTEGER      NOT NULL DEFAULT 1,
    wfd_is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    wfd_created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    wfd_created_by    BIGINT       NULL,
    wfd_updated_at    TIMESTAMPTZ  NULL,
    wfd_updated_by    BIGINT       NULL,
    CONSTRAINT fk_wfd_tenant
        FOREIGN KEY (wfd_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT uq_wfd_tenant_code
        UNIQUE (wfd_tenant_id, wfd_workflow_code)
);

COMMENT ON TABLE sys_workflow_def IS 'High-level workflow definitions (number of levels per process type).';


-- ------------------------------------------------------------
-- Imports (templates, jobs, row results)
-- ------------------------------------------------------------

CREATE TABLE sys_import_template (
    imt_id            BIGSERIAL PRIMARY KEY,
    imt_tenant_id     BIGINT       NOT NULL,
    imt_template_code VARCHAR(100) NOT NULL,
    imt_entity_type   VARCHAR(100) NOT NULL,
    imt_version       INTEGER      NOT NULL DEFAULT 1,
    imt_is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    imt_description   TEXT         NULL,
    imt_created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    imt_created_by    BIGINT       NULL,
    imt_updated_at    TIMESTAMPTZ  NULL,
    imt_updated_by    BIGINT       NULL,
    CONSTRAINT fk_imt_tenant
        FOREIGN KEY (imt_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT uq_imt_tenant_code_version
        UNIQUE (imt_tenant_id, imt_template_code, imt_version)
);

COMMENT ON TABLE sys_import_template IS 'Import template metadata (which entity and version).';


CREATE TABLE sys_import_template_col (
    imc_id           BIGSERIAL PRIMARY KEY,
    imc_tenant_id    BIGINT       NOT NULL,
    imc_imt_id       BIGINT       NOT NULL,
    imc_column_name  VARCHAR(200) NOT NULL,
    imc_target_field VARCHAR(200) NOT NULL,
    imc_is_required  BOOLEAN      NOT NULL DEFAULT FALSE,
    imc_data_type    VARCHAR(50)  NOT NULL,
    imc_order_index  INTEGER      NOT NULL,
    imc_created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    imc_created_by   BIGINT       NULL,
    imc_updated_at   TIMESTAMPTZ  NULL,
    imc_updated_by   BIGINT       NULL,
    CONSTRAINT fk_imc_tenant
        FOREIGN KEY (imc_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_imc_imt
        FOREIGN KEY (imc_imt_id) REFERENCES sys_import_template (imt_id)
);

COMMENT ON TABLE sys_import_template_col IS 'Column-to-field mapping for an import template.';


CREATE TABLE sys_import_job (
    imj_id           BIGSERIAL PRIMARY KEY,
    imj_tenant_id    BIGINT      NOT NULL,
    imj_imt_id       BIGINT      NOT NULL,
    imj_usr_id       BIGINT      NOT NULL,
    imj_status_code  VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    imj_total_rows   INTEGER     NOT NULL DEFAULT 0,
    imj_success_rows INTEGER     NOT NULL DEFAULT 0,
    imj_error_rows   INTEGER     NOT NULL DEFAULT 0,
    imj_created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    imj_completed_at TIMESTAMPTZ NULL,
    imj_created_by   BIGINT      NULL,
    imj_updated_at   TIMESTAMPTZ NULL,
    imj_updated_by   BIGINT      NULL,
    CONSTRAINT fk_imj_tenant
        FOREIGN KEY (imj_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_imj_imt
        FOREIGN KEY (imj_imt_id) REFERENCES sys_import_template (imt_id),
    CONSTRAINT fk_imj_usr
        FOREIGN KEY (imj_usr_id) REFERENCES sys_user (usr_id)
);

COMMENT ON TABLE sys_import_job IS 'Execution instance of an import template.';


CREATE TABLE sys_import_job_row (
    ijr_id           BIGSERIAL PRIMARY KEY,
    ijr_tenant_id    BIGINT      NOT NULL,
    ijr_imj_id       BIGINT      NOT NULL,
    ijr_row_number   INTEGER     NOT NULL,
    ijr_status_code  VARCHAR(50) NOT NULL,
    ijr_error_messages TEXT      NULL,
    ijr_created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    ijr_created_by   BIGINT      NULL,
    CONSTRAINT fk_ijr_tenant
        FOREIGN KEY (ijr_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_ijr_imj
        FOREIGN KEY (ijr_imj_id) REFERENCES sys_import_job (imj_id),
    CONSTRAINT uq_ijr_job_row
        UNIQUE (ijr_imj_id, ijr_row_number)
);

COMMENT ON TABLE sys_import_job_row IS 'Per-row outcome for an import job.';


-- ------------------------------------------------------------
-- Reporting (definitions & runs)
-- ------------------------------------------------------------

CREATE TABLE sys_report_def (
    rdf_id             BIGSERIAL PRIMARY KEY,
    rdf_tenant_id      BIGINT       NOT NULL,
    rdf_code           VARCHAR(100) NOT NULL,
    rdf_name           VARCHAR(200) NOT NULL,
    rdf_description    TEXT         NULL,
    rdf_allowed_formats VARCHAR(200) NOT NULL,
    rdf_created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    rdf_created_by     BIGINT       NULL,
    rdf_updated_at     TIMESTAMPTZ  NULL,
    rdf_updated_by     BIGINT       NULL,
    CONSTRAINT fk_rdf_tenant
        FOREIGN KEY (rdf_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT uq_rdf_tenant_code
        UNIQUE (rdf_tenant_id, rdf_code)
);

COMMENT ON TABLE sys_report_def IS 'Report definitions available per tenant.';


CREATE TABLE sys_report_run (
    rrn_id            BIGSERIAL PRIMARY KEY,
    rrn_tenant_id     BIGINT      NOT NULL,
    rrn_rdf_id        BIGINT      NOT NULL,
    rrn_usr_id        BIGINT      NOT NULL,
    rrn_status_code   VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    rrn_parameters    JSONB       NULL,
    rrn_output_location VARCHAR(500) NULL,
    rrn_created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    rrn_completed_at  TIMESTAMPTZ NULL,
    rrn_created_by    BIGINT      NULL,
    rrn_updated_at    TIMESTAMPTZ NULL,
    rrn_updated_by    BIGINT      NULL,
    CONSTRAINT fk_rrn_tenant
        FOREIGN KEY (rrn_tenant_id) REFERENCES sys_tenant (ten_id),
    CONSTRAINT fk_rrn_rdf
        FOREIGN KEY (rrn_rdf_id) REFERENCES sys_report_def (rdf_id),
    CONSTRAINT fk_rrn_usr
        FOREIGN KEY (rrn_usr_id) REFERENCES sys_user (usr_id)
);

COMMENT ON TABLE sys_report_run IS 'Report execution instance with parameters and output.';


-- ------------------------------------------------------------
-- Indexes (non-unique)
-- ------------------------------------------------------------

-- sys_tenant
CREATE INDEX idx_ten_status
    ON sys_tenant (ten_status_code);

-- sys_user
CREATE INDEX idx_usr_email
    ON sys_user (usr_email);
CREATE INDEX idx_usr_status
    ON sys_user (usr_status_code);

-- sys_user_role
CREATE INDEX idx_url_tenant_id
    ON sys_user_role (url_tenant_id);
CREATE INDEX idx_url_usr_id
    ON sys_user_role (url_usr_id);
CREATE INDEX idx_url_rol_id
    ON sys_user_role (url_rol_id);
CREATE INDEX idx_url_tenant_status
    ON sys_user_role (url_tenant_id, url_status_code);

-- pid_employee
CREATE INDEX idx_emp_tenant_id
    ON pid_employee (emp_tenant_id);
CREATE INDEX idx_emp_tenant_status
    ON pid_employee (emp_tenant_id, emp_status_code);

-- sys_integration_event
CREATE INDEX idx_ine_tenant_id
    ON sys_integration_event (ine_tenant_id);
CREATE INDEX idx_ine_tenant_occurred
    ON sys_integration_event (ine_tenant_id, ine_occurred_at);
CREATE INDEX idx_ine_tenant_event_type
    ON sys_integration_event (ine_tenant_id, ine_event_type_code);
CREATE INDEX idx_ine_tenant_subject
    ON sys_integration_event (ine_tenant_id, ine_subject_entity_type, ine_subject_entity_id);

-- sys_integration_subscription
CREATE INDEX idx_ins_tenant_id
    ON sys_integration_subscription (ins_tenant_id);
CREATE INDEX idx_ins_tenant_subscriber
    ON sys_integration_subscription (ins_tenant_id, ins_subscriber_system);
CREATE INDEX idx_ins_active_subscriber
    ON sys_integration_subscription (ins_tenant_id, ins_subscriber_system, ins_is_active);

-- sys_int_sub_event_type
CREATE INDEX idx_ise_tenant_id
    ON sys_int_sub_event_type (ise_tenant_id);
CREATE INDEX idx_ise_ins_id
    ON sys_int_sub_event_type (ise_ins_id);

-- sys_event_delivery
CREATE INDEX idx_evd_tenant_id
    ON sys_event_delivery (evd_tenant_id);
CREATE INDEX idx_evd_ine_id
    ON sys_event_delivery (evd_ine_id);
CREATE INDEX idx_evd_ins_id
    ON sys_event_delivery (evd_ins_id);
CREATE INDEX idx_evd_status
    ON sys_event_delivery (evd_status_code);
CREATE INDEX idx_evd_tenant_status
    ON sys_event_delivery (evd_tenant_id, evd_status_code);
CREATE INDEX idx_evd_tenant_ins_status
    ON sys_event_delivery (evd_tenant_id, evd_ins_id, evd_status_code);

-- sys_engagement_signal
CREATE INDEX idx_egs_tenant_id
    ON sys_engagement_signal (egs_tenant_id);
CREATE INDEX idx_egs_emp_id
    ON sys_engagement_signal (egs_emp_id);
CREATE INDEX idx_egs_tenant_processed
    ON sys_engagement_signal (egs_tenant_id, egs_processed_flag);
CREATE INDEX idx_egs_tenant_source
    ON sys_engagement_signal (egs_tenant_id, egs_source_system);

-- sys_audit_log
CREATE INDEX idx_aud_tenant_occurred
    ON sys_audit_log (aud_tenant_id, aud_occurred_at);
CREATE INDEX idx_aud_user_time
    ON sys_audit_log (aud_usr_id, aud_occurred_at);
CREATE INDEX idx_aud_tenant_target
    ON sys_audit_log (aud_tenant_id, aud_target_entity_type, aud_target_entity_id);

-- sys_workflow_def
CREATE INDEX idx_wfd_tenant_id
    ON sys_workflow_def (wfd_tenant_id);
CREATE INDEX idx_wfd_tenant_process
    ON sys_workflow_def (wfd_tenant_id, wfd_process_type);

-- sys_import_template
CREATE INDEX idx_imt_tenant_id
    ON sys_import_template (imt_tenant_id);

-- sys_import_template_col
CREATE INDEX idx_imc_tenant_id
    ON sys_import_template_col (imc_tenant_id);
CREATE INDEX idx_imc_imt_id
    ON sys_import_template_col (imc_imt_id);
CREATE INDEX idx_imc_template_order
    ON sys_import_template_col (imc_imt_id, imc_order_index);

-- sys_import_job
CREATE INDEX idx_imj_tenant_id
    ON sys_import_job (imj_tenant_id);
CREATE INDEX idx_imj_imt_id
    ON sys_import_job (imj_imt_id);
CREATE INDEX idx_imj_usr_id
    ON sys_import_job (imj_usr_id);
CREATE INDEX idx_imj_tenant_status
    ON sys_import_job (imj_tenant_id, imj_status_code);
CREATE INDEX idx_imj_tenant_created
    ON sys_import_job (imj_tenant_id, imj_created_at);

-- sys_import_job_row
CREATE INDEX idx_ijr_tenant_id
    ON sys_import_job_row (ijr_tenant_id);
CREATE INDEX idx_ijr_imj_id
    ON sys_import_job_row (ijr_imj_id);
CREATE INDEX idx_ijr_status
    ON sys_import_job_row (ijr_status_code);
CREATE INDEX idx_ijr_job_status
    ON sys_import_job_row (ijr_imj_id, ijr_status_code);

-- sys_report_def
CREATE INDEX idx_rdf_tenant_id
    ON sys_report_def (rdf_tenant_id);

-- sys_report_run
CREATE INDEX idx_rrn_tenant_id
    ON sys_report_run (rrn_tenant_id);
CREATE INDEX idx_rrn_rdf_id
    ON sys_report_run (rrn_rdf_id);
CREATE INDEX idx_rrn_usr_id
    ON sys_report_run (rrn_usr_id);
CREATE INDEX idx_rrn_tenant_status
    ON sys_report_run (rrn_tenant_id, rrn_status_code);
CREATE INDEX idx_rrn_tenant_created
    ON sys_report_run (rrn_tenant_id, rrn_created_at);
```

### Notes on dependencies

* This script defines the **canonical** `sys_tenant`, `sys_user`, `sys_role`, `sys_user_role`, and a stub `pid_employee`.
* Other domains (ESS & MSS, Rhythms, Growth Signals, Gamification, AI Layer, etc.) should reference these tables instead of redefining them.
* If you already have `sys_tenant`, `sys_user`, `sys_role`, `pid_employee` in another migration, you should:

  * Remove those CREATE TABLEs from this script, and
  * Keep only the dependent tables (`sys_*` integration/import/reporting entities) and their foreign keys.
