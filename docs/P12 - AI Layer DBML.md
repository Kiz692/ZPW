```dbml
// Domain: AI Layer (Conversations, HR Requests, Feedback)

// --------------------------------------------------------
// System / Shared stubs (for FK references)
// --------------------------------------------------------

Table sys_tenant {
  ten_id   bigint       [pk, increment]
  ten_name varchar(200) [not null]

  Note: 'Tenant table (stub; full definition lives in System / Shared domain).'
}

Table sys_user {
  usr_id       bigint       [pk, increment]
  usr_username varchar(150) [not null]

  Note: 'User table (stub; full definition lives in System / Shared domain).'
}

Table pid_employee {
  emp_id        bigint [pk, increment]
  emp_tenant_id bigint [not null, ref: > sys_tenant.ten_id]

  indexes {
    (emp_tenant_id) [name: 'idx_emp_tenant_id']
  }

  Note: 'Employee table (stub; full definition lives in People & Identity domain).'
}

// Perf appraisal lives in Growth Signals domain; this stub includes AI fields
Table prf_perf_appraisal {
  pap_id                          bigint       [pk, increment]
  pap_tenant_id                   bigint       [not null, ref: > sys_tenant.ten_id]

  pap_overall_score               numeric(5,2) [null]
  pap_overall_rating_code         varchar(50)  [null]

  // AI summary output slot
  pap_ai_summary_draft            text         [null]
  pap_ai_summary_status_code      varchar(50)  [null]       // DRAFT, ACCEPTED, EDITED, REJECTED
  pap_ai_summary_last_generated_at timestamptz [null]
  pap_ai_summary_last_action_at   timestamptz  [null]

  pap_created_at                  timestamptz  [not null, default: `now()`]
  pap_created_by                  bigint       [null]
  pap_updated_at                  timestamptz  [null]
  pap_updated_by                  bigint       [null]
  pap_deleted_at                  timestamptz  [null]
  pap_deleted_by                  bigint       [null]

  indexes {
    (pap_tenant_id) [name: 'idx_pap_tenant_id']
  }

  Note: 'Performance appraisal (stub) extended with AI summary fields; consolidate with Growth Signals schema.'
}

// --------------------------------------------------------
// AI / Conversation entities
// --------------------------------------------------------

// 1. AI conversation session
Table ais_conversation {
  acv_id                  bigint       [pk, increment]
  acv_tenant_id           bigint       [not null, ref: > sys_tenant.ten_id]
  acv_usr_id              bigint       [not null, ref: > sys_user.usr_id]   // who started the conversation
  acv_emp_id              bigint       [null, ref: > pid_employee.emp_id]   // employee context (subject)

  acv_type_code           varchar(50)  [not null]   // EMPLOYEE_COPILOT, MANAGER_COPILOT, HR_REQUEST_ASSIST, etc.
  acv_entry_surface_code  varchar(50)  [not null]   // ESS, MSS, HR_REQUEST_UI, APPRAISAL_SCREEN, etc.

  acv_subject_entity_type varchar(100) [null]       // PERF_APPRAISAL, HR_REQUEST, etc.
  acv_subject_entity_id   varchar(100) [null]       // opaque ID of subject entity

  acv_started_at          timestamptz  [not null]
  acv_ended_at            timestamptz  [null]
  acv_status_code         varchar(50)  [not null]   // ACTIVE, CLOSED

  acv_created_at          timestamptz  [not null, default: `now()`]
  acv_created_by          bigint       [null]
  acv_updated_at          timestamptz  [null]
  acv_updated_by          bigint       [null]
  acv_deleted_at          timestamptz  [null]
  acv_deleted_by          bigint       [null]

  indexes {
    (acv_tenant_id)                           [name: 'idx_acv_tenant_id']
    (acv_usr_id)                              [name: 'idx_acv_usr_id']
    (acv_emp_id)                              [name: 'idx_acv_emp_id']
    (acv_tenant_id, acv_type_code)            [name: 'idx_acv_tenant_type']
    (acv_tenant_id, acv_subject_entity_type, acv_subject_entity_id) [name: 'idx_acv_subject']
  }

  Note: 'Logical copilot session, scoped to tenant + user + optional employee/appraisal/HRRequest.'
}

// 2. AI messages within a conversation
Table ais_message {
  ams_id                 bigint       [pk, increment]
  ams_tenant_id          bigint       [not null, ref: > sys_tenant.ten_id]
  ams_acv_id             bigint       [not null, ref: > ais_conversation.acv_id]

  ams_sender_type_code   varchar(50)  [not null]   // USER, AI, SYSTEM
  ams_sender_role_code   varchar(50)  [null]       // EMPLOYEE, MANAGER, HR, EXEC
  ams_content            text         [not null]
  ams_content_type_code  varchar(50)  [not null, default: 'PLAIN_TEXT'] // PLAIN_TEXT, RICH_TEXT, MARKDOWN
  ams_is_suggestion      boolean      [not null, default: false]        // true for AI draft content

  ams_underlying_sources jsonb        [null]       // JSON summary of entities/fields used in the reply
  ams_created_at         timestamptz  [not null]

  ams_created_by         bigint       [null]
  ams_updated_at         timestamptz  [null]
  ams_updated_by         bigint       [null]
  ams_deleted_at         timestamptz  [null]
  ams_deleted_by         bigint       [null]

  indexes {
    (ams_tenant_id)                            [name: 'idx_ams_tenant_id']
    (ams_acv_id)                               [name: 'idx_ams_acv_id']
    (ams_tenant_id, ams_acv_id, ams_created_at)[name: 'idx_ams_conv_time']
  }

  Note: 'Individual turns in a copilot conversation including user prompts and AI replies.'
}

// --------------------------------------------------------
// HR Request + classification entities
// --------------------------------------------------------

// 3. HR request work item (owned by AI/Conversation domain)
Table ais_hr_request {
  ahr_id                          bigint       [pk, increment]
  ahr_tenant_id                   bigint       [not null, ref: > sys_tenant.ten_id]
  ahr_usr_id                      bigint       [not null, ref: > sys_user.usr_id]     // requester
  ahr_emp_id                      bigint       [null, ref: > pid_employee.emp_id]     // employee context (often same as requester, but not always)

  ahr_status_code                 varchar(50)  [not null]    // NEW, TRIAGING, IN_PROGRESS, CLOSED
  ahr_subject                     varchar(200) [not null]
  ahr_body                        text         [not null]
  ahr_channel_code                varchar(50)  [not null]    // ESS, MSS, EMAIL_IMPORT, OTHER
  ahr_assigned_queue_code         varchar(100) [null]        // HR queue/team identifier

  // AI draft reply “output slot”
  ahr_ai_draft_reply              text         [null]
  ahr_ai_reply_status_code        varchar(50)  [null]        // DRAFT, ACCEPTED, EDITED, REJECTED
  ahr_ai_reply_last_generated_at  timestamptz  [null]
  ahr_ai_reply_last_action_at     timestamptz  [null]

  ahr_created_at                  timestamptz  [not null, default: `now()`]
  ahr_created_by                  bigint       [null]
  ahr_updated_at                  timestamptz  [null]
  ahr_updated_by                  bigint       [null]
  ahr_deleted_at                  timestamptz  [null]
  ahr_deleted_by                  bigint       [null]

  indexes {
    (ahr_tenant_id)                            [name: 'idx_ahr_tenant_id']
    (ahr_usr_id)                               [name: 'idx_ahr_usr_id']
    (ahr_emp_id)                               [name: 'idx_ahr_emp_id']
    (ahr_tenant_id, ahr_status_code)           [name: 'idx_ahr_tenant_status']
    (ahr_tenant_id, ahr_assigned_queue_code)   [name: 'idx_ahr_tenant_queue']
  }

  Note: 'Generic HR query from ESS/MSS; AI assists with classification and drafting replies.'
}

// 4. AI-generated classification suggestions for HR requests
Table ais_hr_request_classification {
  ahc_id                    bigint       [pk, increment]
  ahc_tenant_id             bigint       [not null, ref: > sys_tenant.ten_id]
  ahc_ahr_id                bigint       [not null, ref: > ais_hr_request.ahr_id]

  ahc_predicted_type_code   varchar(100) [not null]    // LEAVE, CONTRACT, PAYROLL, WELLNESS, POLICY_QUESTION, etc.
  ahc_suggested_queue_code  varchar(100) [null]        // HR queue/team suggested
  ahc_suggested_usr_id      bigint       [null, ref: > sys_user.usr_id]   // specific assignee, optional

  ahc_confidence_pct        numeric(5,2) [null]        // 0–100
  ahc_model_version         varchar(100) [null]
  ahc_suggested_at          timestamptz  [not null]

  ahc_accepted_flag         boolean      [not null, default: false]
  ahc_accepted_usr_id       bigint       [null, ref: > sys_user.usr_id]
  ahc_accepted_at           timestamptz  [null]

  ahc_created_at            timestamptz  [not null, default: `now()`]
  ahc_created_by            bigint       [null]
  ahc_updated_at            timestamptz  [null]
  ahc_updated_by            bigint       [null]
  ahc_deleted_at            timestamptz  [null]
  ahc_deleted_by            bigint       [null]

  indexes {
    (ahc_tenant_id)                      [name: 'idx_ahc_tenant_id']
    (ahc_ahr_id)                         [name: 'idx_ahc_ahr_id']
    (ahc_tenant_id, ahc_ahr_id)          [name: 'idx_ahc_tenant_request']
    (ahc_tenant_id, ahc_accepted_flag)   [name: 'idx_ahc_tenant_accepted']
  }

  Note: 'History of AI classification attempts for HR requests; accepted_flag marks the one HR chose (if any).'
}

// --------------------------------------------------------
// AI Feedback
// --------------------------------------------------------

// 5. User feedback on AI outputs (messages, HR replies, appraisal summaries)
Table ais_ai_feedback {
  afb_id              bigint       [pk, increment]
  afb_tenant_id       bigint       [not null, ref: > sys_tenant.ten_id]
  afb_usr_id          bigint       [not null, ref: > sys_user.usr_id]
  afb_emp_id          bigint       [null, ref: > pid_employee.emp_id]

  // Polymorphic target via optional FKs; exactly one should be non-null in practice
  afb_ams_id          bigint       [null, ref: > ais_message.ams_id]          // feedback on copilot reply
  afb_ahr_id          bigint       [null, ref: > ais_hr_request.ahr_id]       // feedback on HR request AI reply
  afb_pap_id          bigint       [null, ref: > prf_perf_appraisal.pap_id]   // feedback on appraisal AI summary

  afb_action_taken_code varchar(50) [not null]   // ACCEPT, EDIT, REJECT
  afb_helpfulness_code  varchar(50) [null]       // HELPFUL, NOT_HELPFUL, NEUTRAL
  afb_edited_text       text        [null]       // snapshot of edited suggestion, if any
  afb_comment           text        [null]       // why it was wrong/unhelpful/etc.
  afb_created_at        timestamptz [not null]

  afb_created_by        bigint      [null]
  afb_updated_at        timestamptz [null]
  afb_updated_by        bigint      [null]
  afb_deleted_at        timestamptz [null]
  afb_deleted_by        bigint      [null]

  indexes {
    (afb_tenant_id)                   [name: 'idx_afb_tenant_id']
    (afb_usr_id)                      [name: 'idx_afb_usr_id']
    (afb_emp_id)                      [name: 'idx_afb_emp_id']
    (afb_ams_id)                      [name: 'idx_afb_ams_id']
    (afb_ahr_id)                      [name: 'idx_afb_ahr_id']
    (afb_pap_id)                      [name: 'idx_afb_pap_id']
    (afb_tenant_id, afb_action_taken_code) [name: 'idx_afb_tenant_action']
  }

  Note: 'Governance/tuning signal: how users respond to AI outputs across conversations, HR replies, and summaries.'
}
```

---

### Foreign Key Relationships (Readable Summary)

| From table                      | From column            | To table             | To column | Notes                                                   |
| ------------------------------- | ---------------------- | -------------------- | --------- | ------------------------------------------------------- |
| `pid_employee`                  | `emp_tenant_id`        | `sys_tenant`         | `ten_id`  | Tenant scoping for employees (stub)                     |
| `prf_perf_appraisal`            | `pap_tenant_id`        | `sys_tenant`         | `ten_id`  | Tenant scoping for appraisals                           |
| `ais_conversation`              | `acv_tenant_id`        | `sys_tenant`         | `ten_id`  | Tenant scoping for AI conversations                     |
| `ais_conversation`              | `acv_usr_id`           | `sys_user`           | `usr_id`  | User who started the conversation                       |
| `ais_conversation`              | `acv_emp_id`           | `pid_employee`       | `emp_id`  | Employee context for conversation (subject)             |
| `ais_message`                   | `ams_tenant_id`        | `sys_tenant`         | `ten_id`  | Tenant scoping for AI messages                          |
| `ais_message`                   | `ams_acv_id`           | `ais_conversation`   | `acv_id`  | Messages belong to a conversation                       |
| `ais_hr_request`                | `ahr_tenant_id`        | `sys_tenant`         | `ten_id`  | Tenant scoping for HR requests                          |
| `ais_hr_request`                | `ahr_usr_id`           | `sys_user`           | `usr_id`  | Requester user                                          |
| `ais_hr_request`                | `ahr_emp_id`           | `pid_employee`       | `emp_id`  | Employee context (may be same as requester)             |
| `ais_hr_request_classification` | `ahc_tenant_id`        | `sys_tenant`         | `ten_id`  | Tenant scoping for classifications                      |
| `ais_hr_request_classification` | `ahc_ahr_id`           | `ais_hr_request`     | `ahr_id`  | Classification belongs to an HR request                 |
| `ais_hr_request_classification` | `ahc_suggested_usr_id` | `sys_user`           | `usr_id`  | Optionally suggests a specific assignee                 |
| `ais_hr_request_classification` | `ahc_accepted_usr_id`  | `sys_user`           | `usr_id`  | HR user who accepted the suggestion                     |
| `ais_ai_feedback`               | `afb_tenant_id`        | `sys_tenant`         | `ten_id`  | Tenant scoping for feedback                             |
| `ais_ai_feedback`               | `afb_usr_id`           | `sys_user`           | `usr_id`  | User who gave feedback                                  |
| `ais_ai_feedback`               | `afb_emp_id`           | `pid_employee`       | `emp_id`  | Employee context (if separate from user)                |
| `ais_ai_feedback`               | `afb_ams_id`           | `ais_message`        | `ams_id`  | Feedback on a specific copilot message                  |
| `ais_ai_feedback`               | `afb_ahr_id`           | `ais_hr_request`     | `ahr_id`  | Feedback on an AI draft reply for a specific HR request |
| `ais_ai_feedback`               | `afb_pap_id`           | `prf_perf_appraisal` | `pap_id`  | Feedback on a performance appraisal AI summary          |

---

### Key Design Choices

I’ve kept the **multi-tenant pattern** consistent: every AI-layer table has its own `<prefix>_tenant_id` foreign key to `sys_tenant`. Even though tenancy could be inferred via relationships (e.g. messages via conversations), this makes row-level security and direct querying much simpler and symmetric with the other domains you’ve modeled.

For **AIFeedback**, I implemented the “can attach to multiple AI surfaces” requirement with three optional foreign keys (`afb_ams_id`, `afb_ahr_id`, `afb_pap_id`) rather than a polymorphic `target_type` + `target_id` pair. That aligns with your relationship diagram (feedback linked to messages, HR requests, and perf appraisals) while still being easy to query and join. In practice you enforce “exactly one of these is non-null” at the application layer or via a CHECK constraint if you’d like.

Finally, I treated **AI output slots** as fields on the owning entities (HRRequest and PerfAppraisal), matching your earlier AIOutputSlot concept: `ahr_ai_*` on `ais_hr_request` and `pap_ai_*` on `prf_perf_appraisal`. The `prf_perf_appraisal` table here is marked as a stub that extends the core schema from the Growth Signals domain; when you consolidate DBML across domains, you’ll merge those definitions into a single canonical PAP table containing both performance and AI summary fields.
