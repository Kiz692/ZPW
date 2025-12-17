```dbml
// ========================================================
// Domain: Integration & NFR (System, RBAC, Integrations, Imports,
//          Reporting, Audit & Engagement Signals)
// ========================================================


// --------------------------------------------------------
// Core system entities (Tenant, User, Role, UserRole, Employee stub)
// --------------------------------------------------------

Table sys_tenant {
  ten_id          bigint       [pk, increment]
  ten_name        varchar(200) [not null]
  ten_status_code varchar(50)  [not null, default: 'ACTIVE'] // ACTIVE, SUSPENDED, CLOSED, etc.

  ten_created_at  timestamptz  [not null, default: 'now()']
  ten_created_by  bigint       [null]   // → sys_user.usr_id (not FK-enforced here)
  ten_updated_at  timestamptz  [null]
  ten_updated_by  bigint       [null]   // → sys_user.usr_id

  indexes {
    (ten_name) [unique, name: 'uq_ten_name']
  }

  Note: 'Tenant / customer of the HRMS platform.'
}

Table sys_user {
  usr_id           bigint       [pk, increment]
  usr_username     varchar(150) [not null]
  usr_status_code  varchar(50)  [not null, default: 'ACTIVE'] // ACTIVE, DISABLED, INVITED, etc.

  usr_display_name varchar(200) [null]
  usr_email        varchar(200) [null]

  usr_created_at   timestamptz  [not null, default: 'now()']
  usr_created_by   bigint       [null]
  usr_updated_at   timestamptz  [null]
  usr_updated_by   bigint       [null]

  indexes {
    (usr_username) [unique, name: 'uq_usr_username']
    (usr_email)    [name: 'idx_usr_email']
  }

  Note: 'Login identity; can be linked to employees via other domains.'
}

Table sys_role {
  rol_id          bigint       [pk, increment]
  rol_code        varchar(50)  [not null]
  rol_name        varchar(100) [not null]
  rol_description text         [null]

  rol_created_at  timestamptz  [not null, default: 'now()']
  rol_created_by  bigint       [null]
  rol_updated_at  timestamptz  [null]
  rol_updated_by  bigint       [null]

  indexes {
    (rol_code) [unique, name: 'uq_rol_code']
  }

  Note: 'Application role (EMPLOYEE, MANAGER, HR, ADMIN, etc.).'
}

Table sys_user_role {
  url_id        bigint      [pk, increment]
  url_tenant_id bigint      [not null, ref: > sys_tenant.ten_id]
  url_usr_id    bigint      [not null, ref: > sys_user.usr_id]
  url_rol_id    bigint      [not null, ref: > sys_role.rol_id]

  url_status_code varchar(50) [not null, default: 'ACTIVE'] // ACTIVE, REVOKED

  url_created_at timestamptz [not null, default: 'now()']
  url_created_by bigint      [null]
  url_updated_at timestamptz [null]
  url_updated_by bigint      [null]

  indexes {
    (url_tenant_id)                      [name: 'idx_url_tenant_id']
    (url_usr_id)                         [name: 'idx_url_usr_id']
    (url_rol_id)                         [name: 'idx_url_rol_id']
    (url_tenant_id, url_usr_id, url_rol_id) [unique, name: 'uq_url_tenant_user_role']
  }

  Note: 'Tenant-scoped RBAC link between users and roles.'
}

// Employee stub (anchor for EngagementSignal, etc.)
Table pid_employee {
  emp_id              bigint       [pk, increment]
  emp_tenant_id       bigint       [not null, ref: > sys_tenant.ten_id]
  emp_employee_number varchar(50)  [not null]

  emp_status_code     varchar(50)  [not null, default: 'ACTIVE'] // high-level status
  emp_created_at      timestamptz  [not null, default: 'now()']
  emp_created_by      bigint       [null]
  emp_updated_at      timestamptz  [null]
  emp_updated_by      bigint       [null]

  indexes {
    (emp_tenant_id)                          [name: 'idx_emp_tenant_id']
    (emp_tenant_id, emp_employee_number)     [unique, name: 'uq_emp_tenant_empno']
  }

  Note: 'Employee stub; full People & Identity schema lives in its own domain.'
}


// --------------------------------------------------------
// Integration events & subscriptions
// --------------------------------------------------------

Table sys_integration_event {
  ine_id                   bigint       [pk, increment]
  ine_tenant_id            bigint       [not null, ref: > sys_tenant.ten_id]

  ine_event_type_code      varchar(100) [not null]  // e.g. EMPLOYEE_CREATED, LEAVE_APPROVED
  ine_subject_entity_type  varchar(100) [not null]  // EMPLOYEE, ORG_UNIT, etc.
  ine_subject_entity_id    varchar(100) [not null]  // opaque ID; can be cross-system
  ine_payload_summary      text         [null]      // short human-readable summary
  ine_occurred_at          timestamptz  [not null]

  ine_created_at           timestamptz  [not null, default: 'now()']
  ine_created_by           bigint       [null]
  ine_updated_at           timestamptz  [null]
  ine_updated_by           bigint       [null]

  indexes {
    (ine_tenant_id)                         [name: 'idx_ine_tenant_id']
    (ine_tenant_id, ine_occurred_at)        [name: 'idx_ine_tenant_occurred']
    (ine_tenant_id, ine_event_type_code)    [name: 'idx_ine_tenant_event_type']
    (ine_subject_entity_type, ine_subject_entity_id) [name: 'idx_ine_subject']
  }

  Note: 'Outbox-style integration event log for a tenant.'
}

Table sys_integration_subscription {
  ins_id                 bigint       [pk, increment]
  ins_tenant_id          bigint       [not null, ref: > sys_tenant.ten_id]

  ins_subscriber_system  varchar(100) [not null]    // e.g. ZHEP, PayrollSystemX
  ins_destination_type   varchar(50)  [not null]    // WEBHOOK, QUEUE, TOPIC
  ins_destination_url    varchar(500) [not null]
  ins_is_active          boolean      [not null, default: true]

  ins_created_at         timestamptz  [not null, default: 'now()']
  ins_created_by         bigint       [null]
  ins_updated_at         timestamptz  [null]
  ins_updated_by         bigint       [null]

  indexes {
    (ins_tenant_id)                                       [name: 'idx_ins_tenant_id']
    (ins_tenant_id, ins_subscriber_system)               [name: 'idx_ins_tenant_subscriber']
    (ins_tenant_id, ins_subscriber_system, ins_is_active)[name: 'idx_ins_active_subscriber']
  }

  Note: 'Subscription config for pushing IntegrationEvents to external systems.'
}

Table sys_int_sub_event_type {
  ise_id          bigint       [pk, increment]
  ise_tenant_id   bigint       [not null, ref: > sys_tenant.ten_id]
  ise_ins_id      bigint       [not null, ref: > sys_integration_subscription.ins_id]

  ise_event_type_code varchar(100) [not null]

  ise_created_at  timestamptz  [not null, default: 'now()']
  ise_created_by  bigint       [null]
  ise_updated_at  timestamptz  [null]
  ise_updated_by  bigint       [null]

  indexes {
    (ise_tenant_id)                        [name: 'idx_ise_tenant_id']
    (ise_ins_id)                           [name: 'idx_ise_ins_id']
    (ise_tenant_id, ise_ins_id, ise_event_type_code) [unique, name: 'uq_ise_subscription_event_type']
  }

  Note: 'Event types a subscription is interested in.'
}

Table sys_event_delivery {
  evd_id            bigint       [pk, increment]
  evd_tenant_id     bigint       [not null, ref: > sys_tenant.ten_id]
  evd_ine_id        bigint       [not null, ref: > sys_integration_event.ine_id]
  evd_ins_id        bigint       [not null, ref: > sys_integration_subscription.ins_id]

  evd_status_code   varchar(50)  [not null]         // PENDING, SUCCESS, FAILED, RETRYING
  evd_attempt_count integer      [not null, default: 0]
  evd_last_attempt_at timestamptz [null]
  evd_last_status_code integer   [null]             // HTTP or queue status
  evd_error_message text         [null]

  evd_created_at    timestamptz  [not null, default: 'now()']
  evd_created_by    bigint       [null]
  evd_updated_at    timestamptz  [null]
  evd_updated_by    bigint       [null]

  indexes {
    (evd_tenant_id)                             [name: 'idx_evd_tenant_id']
    (evd_ine_id)                                [name: 'idx_evd_ine_id']
    (evd_ins_id)                                [name: 'idx_evd_ins_id']
    (evd_status_code)                           [name: 'idx_evd_status']
    (evd_tenant_id, evd_status_code)            [name: 'idx_evd_tenant_status']
  }

  Note: 'Per-subscription delivery attempts for an IntegrationEvent.'
}


// --------------------------------------------------------
// Engagement Signals (from external systems) 
// --------------------------------------------------------

Table sys_engagement_signal {
  egs_id                    bigint       [pk, increment]
  egs_tenant_id             bigint       [not null, ref: > sys_tenant.ten_id]
  egs_emp_id                bigint       [not null, ref: > pid_employee.emp_id]

  egs_source_system         varchar(100) [not null]    // e.g. ZHEP, MotionOS, LMS
  egs_tags                  jsonb        [null]        // flexible tags/labels
  egs_participation_summary text         [null]        // human-readable summary

  egs_received_at           timestamptz  [not null]
  egs_processed_flag        boolean      [not null, default: false]
  egs_processed_at          timestamptz  [null]

  egs_created_at            timestamptz  [not null, default: 'now()']
  egs_created_by            bigint       [null]
  egs_updated_at            timestamptz  [null]
  egs_updated_by            bigint       [null]

  indexes {
    (egs_tenant_id)                            [name: 'idx_egs_tenant_id']
    (egs_emp_id)                               [name: 'idx_egs_emp_id']
    (egs_tenant_id, egs_processed_flag)        [name: 'idx_egs_tenant_processed']
    (egs_source_system)                        [name: 'idx_egs_source_system']
  }

  Note: 'Cross-system engagement signals for an employee (events, participation, etc.).'
}


// --------------------------------------------------------
// Audit logging & workflow definitions
// --------------------------------------------------------

Table sys_audit_log {
  aud_id                 bigint       [pk, increment]
  aud_tenant_id          bigint       [not null, ref: > sys_tenant.ten_id]
  aud_usr_id             bigint       [not null, ref: > sys_user.usr_id]

  aud_action_type_code   varchar(100) [not null] // CREATE, UPDATE, APPROVE, REJECT, LOGIN, etc.
  aud_target_entity_type varchar(100) [not null] // EMPLOYEE, LEAVE_REQUEST, etc.
  aud_target_entity_id   varchar(100) [not null]
  aud_description        text         [null]
  aud_occurred_at        timestamptz  [not null]

  aud_created_at         timestamptz  [not null, default: 'now()']
  aud_created_by         bigint       [null]

  indexes {
    (aud_tenant_id, aud_occurred_at)          [name: 'idx_aud_tenant_occurred']
    (aud_usr_id, aud_occurred_at)             [name: 'idx_aud_user_time']
    (aud_target_entity_type, aud_target_entity_id) [name: 'idx_aud_target']
  }

  Note: 'Structured audit trail entries with actor and target.'
}

Table sys_workflow_def {
  wfd_id              bigint       [pk, increment]
  wfd_tenant_id       bigint       [not null, ref: > sys_tenant.ten_id]

  wfd_workflow_code   varchar(100) [not null]  // e.g. LEAVE_APPROVAL_STANDARD
  wfd_process_type    varchar(100) [not null]  // LEAVE, ROLE_CHANGE, DATA_CHANGE
  wfd_levels          integer      [not null, default: 1]  // number of approval levels
  wfd_is_active       boolean      [not null, default: true]

  wfd_created_at      timestamptz  [not null, default: 'now()']
  wfd_created_by      bigint       [null]
  wfd_updated_at      timestamptz  [null]
  wfd_updated_by      bigint       [null]

  indexes {
    (wfd_tenant_id)                          [name: 'idx_wfd_tenant_id']
    (wfd_tenant_id, wfd_workflow_code)       [unique, name: 'uq_wfd_tenant_code']
    (wfd_tenant_id, wfd_process_type)        [name: 'idx_wfd_tenant_process']
  }

  Note: 'High-level workflow definitions (number of levels per process type).'
}


// --------------------------------------------------------
// Imports (templates, jobs, row results)
// --------------------------------------------------------

Table sys_import_template {
  imt_id            bigint       [pk, increment]
  imt_tenant_id     bigint       [not null, ref: > sys_tenant.ten_id]

  imt_template_code varchar(100) [not null]   // e.g. EMPLOYEE_BULK_IMPORT
  imt_entity_type   varchar(100) [not null]   // EMPLOYEE, ORG_UNIT, POSITION, etc.
  imt_version       integer      [not null, default: 1]
  imt_is_active     boolean      [not null, default: true]

  imt_description   text         [null]

  imt_created_at    timestamptz  [not null, default: 'now()']
  imt_created_by    bigint       [null]
  imt_updated_at    timestamptz  [null]
  imt_updated_by    bigint       [null]

  indexes {
    (imt_tenant_id)                                [name: 'idx_imt_tenant_id']
    (imt_tenant_id, imt_template_code, imt_version)[unique, name: 'uq_imt_tenant_code_version']
  }

  Note: 'Import template metadata (which entity and version).'
}

Table sys_import_template_col {
  imc_id           bigint       [pk, increment]
  imc_tenant_id    bigint       [not null, ref: > sys_tenant.ten_id]
  imc_imt_id       bigint       [not null, ref: > sys_import_template.imt_id]

  imc_column_name  varchar(200) [not null]   // expected column header in file
  imc_target_field varchar(200) [not null]   // target field path/property
  imc_is_required  boolean      [not null, default: false]
  imc_data_type    varchar(50)  [not null]   // STRING, NUMBER, DATE, BOOLEAN, ENUM, etc.
  imc_order_index  integer      [not null]

  imc_created_at   timestamptz  [not null, default: 'now()']
  imc_created_by   bigint       [null]
  imc_updated_at   timestamptz  [null]
  imc_updated_by   bigint       [null]

  indexes {
    (imc_tenant_id)                     [name: 'idx_imc_tenant_id']
    (imc_imt_id)                        [name: 'idx_imc_imt_id']
    (imc_imt_id, imc_order_index)       [name: 'idx_imc_template_order']
  }

  Note: 'Column-to-field mapping for an import template.'
}

Table sys_import_job {
  imj_id          bigint       [pk, increment]
  imj_tenant_id   bigint       [not null, ref: > sys_tenant.ten_id]
  imj_imt_id      bigint       [not null, ref: > sys_import_template.imt_id]
  imj_usr_id      bigint       [not null, ref: > sys_user.usr_id] // user who started the job

  imj_status_code varchar(50)  [not null, default: 'PENDING'] // PENDING, RUNNING, COMPLETED, FAILED
  imj_total_rows  integer      [not null, default: 0]
  imj_success_rows integer     [not null, default: 0]
  imj_error_rows  integer      [not null, default: 0]

  imj_created_at  timestamptz  [not null, default: 'now()']
  imj_completed_at timestamptz [null]

  imj_created_by  bigint       [null]
  imj_updated_at  timestamptz  [null]
  imj_updated_by  bigint       [null]

  indexes {
    (imj_tenant_id)                      [name: 'idx_imj_tenant_id']
    (imj_imt_id)                         [name: 'idx_imj_imt_id']
    (imj_usr_id)                         [name: 'idx_imj_usr_id']
    (imj_tenant_id, imj_status_code)     [name: 'idx_imj_tenant_status']
  }

  Note: 'Execution instance of an import template.'
}

Table sys_import_job_row {
  ijr_id           bigint       [pk, increment]
  ijr_tenant_id    bigint       [not null, ref: > sys_tenant.ten_id]
  ijr_imj_id       bigint       [not null, ref: > sys_import_job.imj_id]

  ijr_row_number   integer      [not null]
  ijr_status_code  varchar(50)  [not null]          // SUCCESS, ERROR, SKIPPED
  ijr_error_messages text       [null]              // may contain multiple messages

  ijr_created_at   timestamptz  [not null, default: 'now()']
  ijr_created_by   bigint       [null]

  indexes {
    (ijr_tenant_id)                      [name: 'idx_ijr_tenant_id']
    (ijr_imj_id)                         [name: 'idx_ijr_imj_id']
    (ijr_imj_id, ijr_row_number)         [unique, name: 'uq_ijr_job_row']
    (ijr_status_code)                    [name: 'idx_ijr_status']
  }

  Note: 'Per-row outcome for an import job.'
}


// --------------------------------------------------------
// Reporting (definitions & runs)
// --------------------------------------------------------

Table sys_report_def {
  rdf_id             bigint       [pk, increment]
  rdf_tenant_id      bigint       [not null, ref: > sys_tenant.ten_id]

  rdf_code           varchar(100) [not null]   // e.g. EMP_HEADCOUNT, LEAVE_SUMMARY
  rdf_name           varchar(200) [not null]
  rdf_description    text         [null]
  rdf_allowed_formats varchar(200)[not null]   // e.g. PDF,CSV,XLSX

  rdf_created_at     timestamptz  [not null, default: 'now()']
  rdf_created_by     bigint       [null]
  rdf_updated_at     timestamptz  [null]
  rdf_updated_by     bigint       [null]

  indexes {
    (rdf_tenant_id)                     [name: 'idx_rdf_tenant_id']
    (rdf_tenant_id, rdf_code)          [unique, name: 'uq_rdf_tenant_code']
  }

  Note: 'Report definitions available per tenant.'
}

Table sys_report_run {
  rrn_id            bigint       [pk, increment]
  rrn_tenant_id     bigint       [not null, ref: > sys_tenant.ten_id]
  rrn_rdf_id        bigint       [not null, ref: > sys_report_def.rdf_id]
  rrn_usr_id        bigint       [not null, ref: > sys_user.usr_id] // requested by

  rrn_status_code   varchar(50)  [not null, default: 'PENDING'] // PENDING, RUNNING, COMPLETED, FAILED
  rrn_parameters    jsonb        [null]      // filter parameters, date ranges, etc.
  rrn_output_location varchar(500) [null]    // storage URL/path for output artifact

  rrn_created_at    timestamptz  [not null, default: 'now()']
  rrn_completed_at  timestamptz  [null]

  rrn_created_by    bigint       [null]
  rrn_updated_at    timestamptz  [null]
  rrn_updated_by    bigint       [null]

  indexes {
    (rrn_tenant_id)                        [name: 'idx_rrn_tenant_id']
    (rrn_rdf_id)                           [name: 'idx_rrn_rdf_id']
    (rrn_usr_id)                           [name: 'idx_rrn_usr_id']
    (rrn_tenant_id, rrn_status_code)       [name: 'idx_rrn_tenant_status']
    (rrn_created_at)                       [name: 'idx_rrn_created_at']
  }

  Note: 'Report execution instance with parameters and output.'
}
```

---

### Foreign Key Relationships (Readable Table)

| From table                     | From column     | To table                       | To column | Notes                               |
| ------------------------------ | --------------- | ------------------------------ | --------- | ----------------------------------- |
| `sys_user_role`                | `url_tenant_id` | `sys_tenant`                   | `ten_id`  | Tenant scope for RBAC link          |
| `sys_user_role`                | `url_usr_id`    | `sys_user`                     | `usr_id`  | User having the role                |
| `sys_user_role`                | `url_rol_id`    | `sys_role`                     | `rol_id`  | Role assigned                       |
| `pid_employee`                 | `emp_tenant_id` | `sys_tenant`                   | `ten_id`  | Employee record is tenant-scoped    |
| `sys_integration_event`        | `ine_tenant_id` | `sys_tenant`                   | `ten_id`  | Events belong to a tenant           |
| `sys_integration_subscription` | `ins_tenant_id` | `sys_tenant`                   | `ten_id`  | Subscriptions are tenant-scoped     |
| `sys_int_sub_event_type`       | `ise_tenant_id` | `sys_tenant`                   | `ten_id`  | Event-type mapping is tenant-scoped |
| `sys_int_sub_event_type`       | `ise_ins_id`    | `sys_integration_subscription` | `ins_id`  | Event types for a subscription      |
| `sys_event_delivery`           | `evd_tenant_id` | `sys_tenant`                   | `ten_id`  | Deliveries are tenant-scoped        |
| `sys_event_delivery`           | `evd_ine_id`    | `sys_integration_event`        | `ine_id`  | Which event is being delivered      |
| `sys_event_delivery`           | `evd_ins_id`    | `sys_integration_subscription` | `ins_id`  | Delivered to which subscription     |
| `sys_engagement_signal`        | `egs_tenant_id` | `sys_tenant`                   | `ten_id`  | Signals are tenant-scoped           |
| `sys_engagement_signal`        | `egs_emp_id`    | `pid_employee`                 | `emp_id`  | Signal relates to which employee    |
| `sys_audit_log`                | `aud_tenant_id` | `sys_tenant`                   | `ten_id`  | Audit entry is tenant-scoped        |
| `sys_audit_log`                | `aud_usr_id`    | `sys_user`                     | `usr_id`  | Actor user                          |
| `sys_workflow_def`             | `wfd_tenant_id` | `sys_tenant`                   | `ten_id`  | Workflow config per tenant          |
| `sys_import_template`          | `imt_tenant_id` | `sys_tenant`                   | `ten_id`  | Import template per tenant          |
| `sys_import_template_col`      | `imc_tenant_id` | `sys_tenant`                   | `ten_id`  | Column mapping per tenant           |
| `sys_import_template_col`      | `imc_imt_id`    | `sys_import_template`          | `imt_id`  | Columns for a specific template     |
| `sys_import_job`               | `imj_tenant_id` | `sys_tenant`                   | `ten_id`  | Import job per tenant               |
| `sys_import_job`               | `imj_imt_id`    | `sys_import_template`          | `imt_id`  | Job uses which template             |
| `sys_import_job`               | `imj_usr_id`    | `sys_user`                     | `usr_id`  | User who started the job            |
| `sys_import_job_row`           | `ijr_tenant_id` | `sys_tenant`                   | `ten_id`  | Row results tenant-scoped via job   |
| `sys_import_job_row`           | `ijr_imj_id`    | `sys_import_job`               | `imj_id`  | Row result for which job            |
| `sys_report_def`               | `rdf_tenant_id` | `sys_tenant`                   | `ten_id`  | Report definition per tenant        |
| `sys_report_run`               | `rrn_tenant_id` | `sys_tenant`                   | `ten_id`  | Report run per tenant               |
| `sys_report_run`               | `rrn_rdf_id`    | `sys_report_def`               | `rdf_id`  | Which report definition is run      |
| `sys_report_run`               | `rrn_usr_id`    | `sys_user`                     | `usr_id`  | User requesting the run             |

(Audit `*_created_by` / `*_updated_by` columns are intentionally left as plain `bigint` to keep FK graph light; they can be tied to `sys_user.usr_id` if you want strict referential constraints.)

---

### Design Notes

I’ve treated **Integration & NFR** here as your *platform spine* for multi-tenant operations: RBAC, events, integrations, imports, reporting, audit, and cross-system engagement signals. Everything is consistently tenant-scoped with `<prefix>_tenant_id` → `sys_tenant.ten_id`, which lets you layer row-level security and simple tenant filters on all your operational surfaces.

For the **integration/event bus**, I went with a classic outbox pattern: `sys_integration_event` is the durable log; `sys_integration_subscription` + `sys_int_sub_event_type` define who cares about which events; and `sys_event_delivery` captures retries and failures per subscriber. Fields like `subject_entity_type/id` are deliberately typed as `varchar` so you can reference internal or external IDs without over-constraining the schema.

Finally, I kept **EngagementSignal, AuditLog, Imports, and Reporting** relatively generic and JSON-friendly in all the “edge” fields (`tags`, `parameters`, `metrics`, `errorMessages`). This gives you enough structure to index and filter by tenant, user, employee, time, and status, while staying flexible for new event types, new import templates, and new report definitions without schema churn.
