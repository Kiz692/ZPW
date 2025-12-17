Here’s a single PostgreSQL DDL script for the **AI Layer** domain.

**Assumption:**
This migration assumes a **clean schema for this domain**, but that **core shared tables already exist**:

* `sys_tenant(ten_id, ...)` – from System / Shared domain
* `sys_user(usr_id, ...)` – from System / Shared domain
* `pid_employee(emp_id, emp_tenant_id, ...)` – from People & Identity domain
* `prf_perf_appraisal(pap_id, pap_tenant_id, ...)` – from Growth Signals domain (canonical PAP table with AI-summary fields merged in)

If those tables are not yet present, you’ll need to create them (or their stubs) before running this script.

---

```sql
-- ============================================
-- AI Layer (Conversations, HR Requests, Feedback)
-- ============================================

-- ============================================
-- 1. AI Conversation Sessions
-- ============================================

CREATE TABLE ais_conversation (
    acv_id                  BIGSERIAL PRIMARY KEY,
    acv_tenant_id           BIGINT NOT NULL,
    acv_usr_id              BIGINT NOT NULL,
    acv_emp_id              BIGINT NULL,

    acv_type_code           VARCHAR(50) NOT NULL,   -- EMPLOYEE_COPILOT, MANAGER_COPILOT, etc.
    acv_entry_surface_code  VARCHAR(50) NOT NULL,   -- ESS, MSS, HR_REQUEST_UI, etc.

    acv_subject_entity_type VARCHAR(100) NULL,      -- PERF_APPRAISAL, HR_REQUEST, etc.
    acv_subject_entity_id   VARCHAR(100) NULL,      -- opaque subject ID

    acv_started_at          TIMESTAMPTZ NOT NULL,
    acv_ended_at            TIMESTAMPTZ NULL,
    acv_status_code         VARCHAR(50) NOT NULL,   -- ACTIVE, CLOSED

    acv_created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    acv_created_by          BIGINT NULL,
    acv_updated_at          TIMESTAMPTZ NULL,
    acv_updated_by          BIGINT NULL,
    acv_deleted_at          TIMESTAMPTZ NULL,
    acv_deleted_by          BIGINT NULL,

    CONSTRAINT fk_acv_tenant
        FOREIGN KEY (acv_tenant_id) REFERENCES sys_tenant(ten_id),
    CONSTRAINT fk_acv_user
        FOREIGN KEY (acv_usr_id) REFERENCES sys_user(usr_id),
    CONSTRAINT fk_acv_employee
        FOREIGN KEY (acv_emp_id) REFERENCES pid_employee(emp_id)
);

CREATE INDEX idx_acv_tenant_id
    ON ais_conversation (acv_tenant_id);

CREATE INDEX idx_acv_usr_id
    ON ais_conversation (acv_usr_id);

CREATE INDEX idx_acv_emp_id
    ON ais_conversation (acv_emp_id);

CREATE INDEX idx_acv_tenant_type
    ON ais_conversation (acv_tenant_id, acv_type_code);

CREATE INDEX idx_acv_subject
    ON ais_conversation (acv_tenant_id, acv_subject_entity_type, acv_subject_entity_id);

CREATE INDEX idx_acv_tenant_user_status
    ON ais_conversation (acv_tenant_id, acv_usr_id, acv_status_code);

COMMENT ON TABLE ais_conversation IS
    'Logical copilot session, scoped to tenant + user + optional employee/appraisal/HR request.';
COMMENT ON COLUMN ais_conversation.acv_type_code IS
    'Conversation type: EMPLOYEE_COPILOT, MANAGER_COPILOT, HR_REQUEST_ASSIST, etc.';
COMMENT ON COLUMN ais_conversation.acv_entry_surface_code IS
    'Entry surface: ESS, MSS, HR_REQUEST_UI, APPRAISAL_SCREEN, etc.';
COMMENT ON COLUMN ais_conversation.acv_subject_entity_type IS
    'Type of subject entity (e.g. PERF_APPRAISAL, HR_REQUEST).';


-- ============================================
-- 2. AI Messages within a Conversation
-- ============================================

CREATE TABLE ais_message (
    ams_id                 BIGSERIAL PRIMARY KEY,
    ams_tenant_id          BIGINT NOT NULL,
    ams_acv_id             BIGINT NOT NULL,

    ams_sender_type_code   VARCHAR(50) NOT NULL,    -- USER, AI, SYSTEM
    ams_sender_role_code   VARCHAR(50) NULL,        -- EMPLOYEE, MANAGER, HR, EXEC
    ams_content            TEXT NOT NULL,
    ams_content_type_code  VARCHAR(50) NOT NULL DEFAULT 'PLAIN_TEXT', -- PLAIN_TEXT, RICH_TEXT, MARKDOWN
    ams_is_suggestion      BOOLEAN NOT NULL DEFAULT FALSE,            -- TRUE for AI draft content

    ams_underlying_sources JSONB NULL,             -- JSON summary of entities/fields used in reply
    ams_created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

    ams_created_by         BIGINT NULL,
    ams_updated_at         TIMESTAMPTZ NULL,
    ams_updated_by         BIGINT NULL,
    ams_deleted_at         TIMESTAMPTZ NULL,
    ams_deleted_by         BIGINT NULL,

    CONSTRAINT fk_ams_tenant
        FOREIGN KEY (ams_tenant_id) REFERENCES sys_tenant(ten_id),
    CONSTRAINT fk_ams_conversation
        FOREIGN KEY (ams_acv_id) REFERENCES ais_conversation(acv_id)
);

CREATE INDEX idx_ams_tenant_id
    ON ais_message (ams_tenant_id);

CREATE INDEX idx_ams_acv_id
    ON ais_message (ams_acv_id);

CREATE INDEX idx_ams_conv_time
    ON ais_message (ams_tenant_id, ams_acv_id, ams_created_at);

CREATE INDEX idx_ams_tenant_sender_type
    ON ais_message (ams_tenant_id, ams_sender_type_code);

COMMENT ON TABLE ais_message IS
    'Individual turns in a copilot conversation including user prompts and AI replies.';
COMMENT ON COLUMN ais_message.ams_is_suggestion IS
    'TRUE when this message is an AI suggestion/draft rather than a normal reply.';


-- ============================================
-- 3. HR Request Work Item
-- ============================================

CREATE TABLE ais_hr_request (
    ahr_id                          BIGSERIAL PRIMARY KEY,
    ahr_tenant_id                   BIGINT NOT NULL,
    ahr_usr_id                      BIGINT NOT NULL,   -- requester user
    ahr_emp_id                      BIGINT NULL,       -- employee context

    ahr_status_code                 VARCHAR(50)  NOT NULL,    -- NEW, TRIAGING, IN_PROGRESS, CLOSED
    ahr_subject                     VARCHAR(200) NOT NULL,
    ahr_body                        TEXT NOT NULL,
    ahr_channel_code                VARCHAR(50)  NOT NULL,    -- ESS, MSS, EMAIL_IMPORT, OTHER
    ahr_assigned_queue_code         VARCHAR(100) NULL,        -- HR queue/team identifier

    -- AI draft reply “output slot”
    ahr_ai_draft_reply              TEXT NULL,
    ahr_ai_reply_status_code        VARCHAR(50)  NULL,        -- DRAFT, ACCEPTED, EDITED, REJECTED
    ahr_ai_reply_last_generated_at  TIMESTAMPTZ NULL,
    ahr_ai_reply_last_action_at     TIMESTAMPTZ NULL,

    ahr_created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    ahr_created_by                  BIGINT NULL,
    ahr_updated_at                  TIMESTAMPTZ NULL,
    ahr_updated_by                  BIGINT NULL,
    ahr_deleted_at                  TIMESTAMPTZ NULL,
    ahr_deleted_by                  BIGINT NULL,

    CONSTRAINT fk_ahr_tenant
        FOREIGN KEY (ahr_tenant_id) REFERENCES sys_tenant(ten_id),
    CONSTRAINT fk_ahr_user
        FOREIGN KEY (ahr_usr_id) REFERENCES sys_user(usr_id),
    CONSTRAINT fk_ahr_employee
        FOREIGN KEY (ahr_emp_id) REFERENCES pid_employee(emp_id)
);

CREATE INDEX idx_ahr_tenant_id
    ON ais_hr_request (ahr_tenant_id);

CREATE INDEX idx_ahr_usr_id
    ON ais_hr_request (ahr_usr_id);

CREATE INDEX idx_ahr_emp_id
    ON ais_hr_request (ahr_emp_id);

CREATE INDEX idx_ahr_tenant_status
    ON ais_hr_request (ahr_tenant_id, ahr_status_code);

CREATE INDEX idx_ahr_tenant_queue
    ON ais_hr_request (ahr_tenant_id, ahr_assigned_queue_code);

CREATE INDEX idx_ahr_tenant_channel
    ON ais_hr_request (ahr_tenant_id, ahr_channel_code);

CREATE INDEX idx_ahr_tenant_user_status
    ON ais_hr_request (ahr_tenant_id, ahr_usr_id, ahr_status_code);

COMMENT ON TABLE ais_hr_request IS
    'Generic HR query from ESS/MSS; AI assists with classification and drafting replies.';
COMMENT ON COLUMN ais_hr_request.ahr_status_code IS
    'Lifecycle status of the HR request: NEW, TRIAGING, IN_PROGRESS, CLOSED.';
COMMENT ON COLUMN ais_hr_request.ahr_ai_draft_reply IS
    'AI-generated draft reply text for this HR request.';


-- ============================================
-- 4. HR Request Classification Suggestions
-- ============================================

CREATE TABLE ais_hr_request_classification (
    ahc_id                    BIGSERIAL PRIMARY KEY,
    ahc_tenant_id             BIGINT NOT NULL,
    ahc_ahr_id                BIGINT NOT NULL,

    ahc_predicted_type_code   VARCHAR(100) NOT NULL,   -- LEAVE, CONTRACT, PAYROLL, WELLNESS, etc.
    ahc_suggested_queue_code  VARCHAR(100) NULL,       -- suggested HR queue/team
    ahc_suggested_usr_id      BIGINT NULL,             -- optional specific assignee

    ahc_confidence_pct        NUMERIC(5,2) NULL,       -- 0–100
    ahc_model_version         VARCHAR(100) NULL,
    ahc_suggested_at          TIMESTAMPTZ NOT NULL,

    ahc_accepted_flag         BOOLEAN NOT NULL DEFAULT FALSE,
    ahc_accepted_usr_id       BIGINT NULL,
    ahc_accepted_at           TIMESTAMPTZ NULL,

    ahc_created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    ahc_created_by            BIGINT NULL,
    ahc_updated_at            TIMESTAMPTZ NULL,
    ahc_updated_by            BIGINT NULL,
    ahc_deleted_at            TIMESTAMPTZ NULL,
    ahc_deleted_by            BIGINT NULL,

    CONSTRAINT fk_ahc_tenant
        FOREIGN KEY (ahc_tenant_id) REFERENCES sys_tenant(ten_id),
    CONSTRAINT fk_ahc_hr_request
        FOREIGN KEY (ahc_ahr_id) REFERENCES ais_hr_request(ahr_id),
    CONSTRAINT fk_ahc_suggested_user
        FOREIGN KEY (ahc_suggested_usr_id) REFERENCES sys_user(usr_id),
    CONSTRAINT fk_ahc_accepted_user
        FOREIGN KEY (ahc_accepted_usr_id) REFERENCES sys_user(usr_id)
);

CREATE INDEX idx_ahc_tenant_id
    ON ais_hr_request_classification (ahc_tenant_id);

CREATE INDEX idx_ahc_ahr_id
    ON ais_hr_request_classification (ahc_ahr_id);

CREATE INDEX idx_ahc_tenant_request
    ON ais_hr_request_classification (ahc_tenant_id, ahc_ahr_id);

CREATE INDEX idx_ahc_tenant_accepted
    ON ais_hr_request_classification (ahc_tenant_id, ahc_accepted_flag);

CREATE INDEX idx_ahc_tenant_type
    ON ais_hr_request_classification (ahc_tenant_id, ahc_predicted_type_code);

COMMENT ON TABLE ais_hr_request_classification IS
    'History of AI classification attempts for HR requests; accepted_flag marks the one HR chose.';
COMMENT ON COLUMN ais_hr_request_classification.ahc_predicted_type_code IS
    'Predicted category of the HR request (LEAVE, CONTRACT, PAYROLL, WELLNESS, etc.).';


-- ============================================
-- 5. User Feedback on AI Outputs
-- ============================================

CREATE TABLE ais_ai_feedback (
    afb_id              BIGSERIAL PRIMARY KEY,
    afb_tenant_id       BIGINT NOT NULL,
    afb_usr_id          BIGINT NOT NULL,
    afb_emp_id          BIGINT NULL,

    -- Polymorphic target via optional FKs; exactly one should be non-null in practice
    afb_ams_id          BIGINT NULL,   -- feedback on copilot reply
    afb_ahr_id          BIGINT NULL,   -- feedback on HR request AI reply
    afb_pap_id          BIGINT NULL,   -- feedback on appraisal AI summary

    afb_action_taken_code VARCHAR(50) NOT NULL,    -- ACCEPT, EDIT, REJECT
    afb_helpfulness_code  VARCHAR(50) NULL,        -- HELPFUL, NOT_HELPFUL, NEUTRAL
    afb_edited_text       TEXT NULL,               -- snapshot of edited suggestion, if any
    afb_comment           TEXT NULL,               -- why it was wrong/unhelpful/etc.
    afb_created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    afb_created_by        BIGINT NULL,
    afb_updated_at        TIMESTAMPTZ NULL,
    afb_updated_by        BIGINT NULL,
    afb_deleted_at        TIMESTAMPTZ NULL,
    afb_deleted_by        BIGINT NULL,

    CONSTRAINT fk_afb_tenant
        FOREIGN KEY (afb_tenant_id) REFERENCES sys_tenant(ten_id),
    CONSTRAINT fk_afb_user
        FOREIGN KEY (afb_usr_id) REFERENCES sys_user(usr_id),
    CONSTRAINT fk_afb_employee
        FOREIGN KEY (afb_emp_id) REFERENCES pid_employee(emp_id),
    CONSTRAINT fk_afb_message
        FOREIGN KEY (afb_ams_id) REFERENCES ais_message(ams_id),
    CONSTRAINT fk_afb_hr_request
        FOREIGN KEY (afb_ahr_id) REFERENCES ais_hr_request(ahr_id),
    CONSTRAINT fk_afb_perf_appraisal
        FOREIGN KEY (afb_pap_id) REFERENCES prf_perf_appraisal(pap_id)
);

CREATE INDEX idx_afb_tenant_id
    ON ais_ai_feedback (afb_tenant_id);

CREATE INDEX idx_afb_usr_id
    ON ais_ai_feedback (afb_usr_id);

CREATE INDEX idx_afb_emp_id
    ON ais_ai_feedback (afb_emp_id);

CREATE INDEX idx_afb_ams_id
    ON ais_ai_feedback (afb_ams_id);

CREATE INDEX idx_afb_ahr_id
    ON ais_ai_feedback (afb_ahr_id);

CREATE INDEX idx_afb_pap_id
    ON ais_ai_feedback (afb_pap_id);

CREATE INDEX idx_afb_tenant_action
    ON ais_ai_feedback (afb_tenant_id, afb_action_taken_code);

CREATE INDEX idx_afb_tenant_helpfulness
    ON ais_ai_feedback (afb_tenant_id, afb_helpfulness_code);

CREATE INDEX idx_afb_tenant_created_at
    ON ais_ai_feedback (afb_tenant_id, afb_created_at);

COMMENT ON TABLE ais_ai_feedback IS
    'Governance/tuning signal: how users respond to AI outputs across conversations, HR replies, and summaries.';
COMMENT ON COLUMN ais_ai_feedback.afb_action_taken_code IS
    'User action on the AI output: ACCEPT, EDIT, or REJECT.';
COMMENT ON COLUMN ais_ai_feedback.afb_edited_text IS
    'Snapshot of edited AI suggestion, used for model improvement.';
```

---

### Dependencies on Other Domains

This AI Layer DDL **requires** these tables to already exist:

* `sys_tenant` (System / Shared domain)
* `sys_user` (System / Shared domain)
* `pid_employee` (People & Identity / People Core domain)
* `prf_perf_appraisal` (Growth Signals / Performance domain, including AI summary fields)

In your real migration pipeline you’ll typically:

1. Apply **System / Shared** migrations (create `sys_tenant`, `sys_user`, etc.).
2. Apply **People Core** and **Growth Signals** migrations (create `pid_employee`, `prf_perf_appraisal`, etc.).
3. Then apply this **AI Layer** migration.
