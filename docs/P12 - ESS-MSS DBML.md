```dbml
// ========================================================
// Domain: People Core
// Scope: Person, Employee, field metadata & ESS/MSS rules
// Cross-domain entities are included as light stubs.
// ========================================================


// --------------------------------------------------------
// System / Shared stubs
// --------------------------------------------------------

Table sys_tenant {
  ten_id   bigint       [pk, increment]
  ten_name varchar(200) [not null]

  Note: 'Tenant table (row-level multi-tenancy boundary; full definition in System / Shared domain).'
}

Table sys_user {
  usr_id       bigint       [pk, increment]
  usr_username varchar(150) [not null]
  usr_status_code varchar(50) [not null, default: 'ACTIVE']

  usr_created_at timestamptz [not null, default: 'now()']
  usr_updated_at timestamptz [null]

  indexes {
    (usr_username) [unique, name: 'uq_usr_username']
  }

  Note: 'Application users (login identities); full schema lives in System / Shared domain.'
}

Table sys_role {
  rol_id          bigint       [pk, increment]
  rol_code        varchar(50)  [not null]
  rol_name        varchar(100) [not null]
  rol_description text         [null]
  rol_is_system_role boolean   [not null, default: true]

  rol_created_at  timestamptz  [not null, default: 'now()']
  rol_updated_at  timestamptz  [null]

  indexes {
    (rol_code) [unique, name: 'uq_rol_code']
  }

  Note: 'Roles (EMPLOYEE, MANAGER, HR, etc.). Used by UserRole and SelfServiceFieldRule.'
}

Table sys_user_role {
  url_id        bigint      [pk, increment]
  url_tenant_id bigint      [not null, ref: > sys_tenant.ten_id]
  url_usr_id    bigint      [not null, ref: > sys_user.usr_id]
  url_rol_id    bigint      [not null, ref: > sys_role.rol_id]

  url_status_code   varchar(50) [not null, default: 'ACTIVE']
  url_effective_from date      [not null, default: 'now()']
  url_effective_to   date      [null]

  url_created_at timestamptz [not null, default: 'now()']
  url_created_by bigint      [null]
  url_updated_at timestamptz [null]
  url_updated_by bigint      [null]

  indexes {
    (url_tenant_id)                     [name: 'idx_url_tenant_id']
    (url_usr_id)                        [name: 'idx_url_usr_id']
    (url_rol_id)                        [name: 'idx_url_rol_id']
    (url_tenant_id, url_usr_id, url_rol_id) [unique, name: 'uq_url_tenant_user_role']
  }

  Note: 'Tenant-scoped RBAC membership (user-role link).'
}


// --------------------------------------------------------
// People Core: Person & Employee
// --------------------------------------------------------

Table pid_person {
  per_id              bigint       [pk, increment]
  per_first_name      varchar(100) [not null]
  per_middle_name     varchar(100) [null]
  per_last_name       varchar(100) [not null]
  per_full_name       varchar(300) [null]        // optional denorm for search/display

  per_date_of_birth   date         [null]
  per_gender_code     varchar(20)  [null]        // M, F, OTHER, UNSPECIFIED, etc.
  per_nationality_code varchar(50) [null]

  per_created_at      timestamptz  [not null, default: 'now()']
  per_created_by      bigint       [null, ref: > sys_user.usr_id]
  per_updated_at      timestamptz  [null]
  per_updated_by      bigint       [null, ref: > sys_user.usr_id]
  per_deleted_at      timestamptz  [null]
  per_deleted_by      bigint       [null, ref: > sys_user.usr_id]

  indexes {
    (per_last_name, per_first_name) [name: 'idx_per_name']
    (per_date_of_birth)             [name: 'idx_per_dob']
  }

  Note: 'Global person identity shared across tenants and domains.'
}

Table pid_employee {
  emp_id           bigint       [pk, increment]
  emp_tenant_id    bigint       [not null, ref: > sys_tenant.ten_id]
  emp_per_id       bigint       [not null, ref: > pid_person.per_id]

  emp_employee_number varchar(50) [not null]      // external/HR number
  emp_hire_date       date        [null]
  emp_employment_type_code varchar(50) [null]     // FULL_TIME, PART_TIME, CONTRACTOR, etc.
  emp_current_status_code varchar(50) [not null]  // PLANNED, ACTIVE, PROBATION, SUSPENDED, EXITED
  emp_current_status_effective_date date [null]

  emp_created_at    timestamptz  [not null, default: 'now()']
  emp_created_by    bigint       [null, ref: > sys_user.usr_id]
  emp_updated_at    timestamptz  [null]
  emp_updated_by    bigint       [null, ref: > sys_user.usr_id]
  emp_deleted_at    timestamptz  [null]
  emp_deleted_by    bigint       [null, ref: > sys_user.usr_id]

  indexes {
    (emp_tenant_id)                         [name: 'idx_emp_tenant_id']
    (emp_tenant_id, emp_employee_number)    [unique, name: 'uq_emp_tenant_empno']
    (emp_per_id)                            [unique, name: 'uq_emp_per_id'] // one employee record per tenant/person pair
    (emp_tenant_id, emp_current_status_code)[name: 'idx_emp_status']
  }

  Note: 'Employee record per tenant, linked to Person; cross-domain anchor for leave, perf, gamification, etc.'
}


// --------------------------------------------------------
// Cross-domain stubs (Org, Leave, Perf, Gamification, AI)
// --------------------------------------------------------

Table org_unit {
  unt_id        bigint       [pk, increment]
  unt_tenant_id bigint       [not null, ref: > sys_tenant.ten_id]

  unt_code      varchar(50)  [not null]
  unt_name      varchar(200) [not null]

  unt_created_at timestamptz [not null, default: 'now()']
  unt_created_by bigint      [null, ref: > sys_user.usr_id]
  unt_updated_at timestamptz [null]
  unt_updated_by bigint      [null, ref: > sys_user.usr_id]

  indexes {
    (unt_tenant_id)                  [name: 'idx_unt_tenant_id']
    (unt_tenant_id, unt_code)        [unique, name: 'uq_unt_tenant_code']
  }

  Note: 'Org units (company/department/team). Minimal stub for People Core; full schema in Work Lattice domain.'
}

Table org_position_assignment {
  pas_id           bigint      [pk, increment]
  pas_tenant_id    bigint      [not null, ref: > sys_tenant.ten_id]
  pas_emp_id       bigint      [not null, ref: > pid_employee.emp_id]
  pas_unt_id       bigint      [not null, ref: > org_unit.unt_id]

  pas_is_primary   boolean     [not null, default: true]

  pas_created_at   timestamptz [not null, default: 'now()']
  pas_created_by   bigint      [null, ref: > sys_user.usr_id]
  pas_updated_at   timestamptz [null]
  pas_updated_by   bigint      [null, ref: > sys_user.usr_id]

  indexes {
    (pas_tenant_id)                      [name: 'idx_pas_tenant_id']
    (pas_emp_id)                         [name: 'idx_pas_emp_id']
    (pas_unt_id)                         [name: 'idx_pas_unt_id']
    (pas_tenant_id, pas_emp_id, pas_is_primary) [name: 'idx_pas_primary_per_emp']
  }

  Note: 'Current/simple view of where an employee sits in the org tree; detailed position history lives in Work Lattice domain.'
}

// Leave & Recovery stubs

Table lea_leave_request {
  lrq_id         bigint      [pk, increment]
  lrq_tenant_id  bigint      [not null, ref: > sys_tenant.ten_id]
  lrq_emp_id     bigint      [not null, ref: > pid_employee.emp_id]

  lrq_leave_type_code varchar(50) [not null]
  lrq_start_date      date       [not null]
  lrq_end_date        date       [not null]
  lrq_status_code     varchar(50)[not null] // DRAFT, PENDING, APPROVED, REJECTED, CANCELLED

  lrq_created_at timestamptz [not null, default: 'now()']
  lrq_created_by bigint      [null, ref: > sys_user.usr_id]
  lrq_updated_at timestamptz [null]
  lrq_updated_by bigint      [null, ref: > sys_user.usr_id]

  indexes {
    (lrq_tenant_id)                   [name: 'idx_lrq_tenant_id']
    (lrq_emp_id)                      [name: 'idx_lrq_emp_id']
    (lrq_tenant_id, lrq_status_code)  [name: 'idx_lrq_tenant_status']
  }

  Note: 'Leave request stub; full configuration, balances, and workflow live in Rhythms (Leave & Absence) domain.'
}

Table lea_leave_balance {
  lba_id         bigint      [pk, increment]
  lba_tenant_id  bigint      [not null, ref: > sys_tenant.ten_id]
  lba_emp_id     bigint      [not null, ref: > pid_employee.emp_id]

  lba_leave_type_code varchar(50)  [not null]
  lba_period_key      varchar(50)  [not null]   // e.g. 2025, 2025-2026
  lba_opening_balance numeric(6,2) [not null, default: 0]
  lba_accrued         numeric(6,2) [not null, default: 0]
  lba_taken           numeric(6,2) [not null, default: 0]
  lba_closing_balance numeric(6,2) [not null, default: 0]

  lba_last_recalc_at  timestamptz  [null]

  lba_created_at timestamptz [not null, default: 'now()']
  lba_created_by bigint      [null, ref: > sys_user.usr_id]
  lba_updated_at timestamptz [null]
  lba_updated_by bigint      [null, ref: > sys_user.usr_id]

  indexes {
    (lba_tenant_id)                                      [name: 'idx_lba_tenant_id']
    (lba_emp_id)                                         [name: 'idx_lba_emp_id']
    (lba_tenant_id, lba_emp_id, lba_leave_type_code, lba_period_key) [unique, name: 'uq_lba_emp_type_period']
  }

  Note: 'Per-employee leave balances; detailed accrual rules live in Rhythms domain.'
}

Table lea_recovery_index {
  rix_id         bigint      [pk, increment]
  rix_tenant_id  bigint      [not null, ref: > sys_tenant.ten_id]
  rix_emp_id     bigint      [not null, ref: > pid_employee.emp_id]

  rix_period_key varchar(50)  [not null]          // e.g. 2025-01, 2025_Q1
  rix_score      numeric(5,2) [not null]          // 0–100
  rix_classification_code varchar(50) [null]      // GREEN, AMBER, RED
  rix_metrics_summary_json jsonb        [null]

  rix_computed_at timestamptz [not null]

  rix_created_at timestamptz [not null, default: 'now()']
  rix_created_by bigint      [null, ref: > sys_user.usr_id]
  rix_updated_at timestamptz [null]
  rix_updated_by bigint      [null, ref: > sys_user.usr_id]

  indexes {
    (rix_tenant_id)                             [name: 'idx_rix_tenant_id']
    (rix_emp_id)                                [name: 'idx_rix_emp_id']
    (rix_tenant_id, rix_period_key)             [name: 'idx_rix_tenant_period']
  }

  Note: 'Wellbeing signal computed from leave/check-ins; full spec in Rhythms domain.'
}

// Performance stub

Table prf_perf_appraisal {
  pap_id           bigint       [pk, increment]
  pap_tenant_id    bigint       [not null, ref: > sys_tenant.ten_id]
  pap_emp_id       bigint       [not null, ref: > pid_employee.emp_id]

  pap_cycle_code   varchar(50)  [not null]
  pap_status_code  varchar(50)  [not null]       // NOT_STARTED, IN_PROGRESS, COMPLETED, CLOSED

  pap_created_at   timestamptz  [not null, default: 'now()']
  pap_created_by   bigint       [null, ref: > sys_user.usr_id]
  pap_updated_at   timestamptz  [null]
  pap_updated_by   bigint       [null, ref: > sys_user.usr_id]

  indexes {
    (pap_tenant_id)                     [name: 'idx_pap_tenant_id']
    (pap_emp_id)                        [name: 'idx_pap_emp_id']
    (pap_tenant_id, pap_cycle_code)     [name: 'idx_pap_tenant_cycle']
  }

  Note: 'Appraisal instance stub; detailed structure lives in Growth Signals domain.'
}

// Gamification stubs

Table gam_profile {
  gpr_id               bigint      [pk, increment]
  gpr_tenant_id        bigint      [not null, ref: > sys_tenant.ten_id]
  gpr_emp_id           bigint      [not null, ref: > pid_employee.emp_id]

  gpr_current_points   integer     [not null, default: 0]
  gpr_current_level_code varchar(50) [null]
  gpr_last_level_change_at timestamptz [null]

  gpr_created_at       timestamptz [not null, default: 'now()']
  gpr_created_by       bigint      [null, ref: > sys_user.usr_id]
  gpr_updated_at       timestamptz [null]
  gpr_updated_by       bigint      [null, ref: > sys_user.usr_id]

  indexes {
    (gpr_tenant_id)                  [name: 'idx_gpr_tenant_id']
    (gpr_emp_id)                     [unique, name: 'uq_gpr_emp_id']
  }

  Note: 'Gamification profile per employee; full details in Gamification Layer domain.'
}

Table gam_manager_scorecard {
  gms_id             bigint       [pk, increment]
  gms_tenant_id      bigint       [not null, ref: > sys_tenant.ten_id]
  gms_emp_id         bigint       [not null, ref: > pid_employee.emp_id] // manager as employee

  gms_period_key     varchar(50)  [not null]         // e.g. 2025-01, 2025_Q1
  gms_stewardship_score numeric(5,2) [not null]     // 0–100

  gms_created_at     timestamptz  [not null, default: 'now()']
  gms_created_by     bigint       [null, ref: > sys_user.usr_id]
  gms_updated_at     timestamptz  [null]
  gms_updated_by     bigint       [null, ref: > sys_user.usr_id]

  indexes {
    (gms_tenant_id)                     [name: 'idx_gms_tenant_id']
    (gms_emp_id)                        [name: 'idx_gms_emp_id']
    (gms_tenant_id, gms_period_key)     [name: 'idx_gms_tenant_period']
  }

  Note: 'Manager wellbeing stewardship summary; full computation rules live in Gamification Layer domain.'
}

// AI Conversation stub (used for ESS/MSS context)

Table ais_conversation {
  acv_id                  bigint       [pk, increment]
  acv_tenant_id           bigint       [not null, ref: > sys_tenant.ten_id]
  acv_usr_id              bigint       [not null, ref: > sys_user.usr_id]

  acv_type_code           varchar(50)  [not null]   // EMPLOYEE_COPILOT, MANAGER_COPILOT, etc.
  acv_entry_surface_code  varchar(50)  [not null]   // ESS, MSS, etc.

  acv_subject_entity_type varchar(100) [null]
  acv_subject_entity_id   varchar(100) [null]

  acv_started_at          timestamptz  [not null]
  acv_ended_at            timestamptz  [null]

  acv_created_at          timestamptz  [not null, default: 'now()']
  acv_created_by          bigint       [null, ref: > sys_user.usr_id]
  acv_updated_at          timestamptz  [null]
  acv_updated_by          bigint       [null, ref: > sys_user.usr_id]

  indexes {
    (acv_tenant_id)                           [name: 'idx_acv_tenant_id']
    (acv_usr_id)                              [name: 'idx_acv_usr_id']
    (acv_tenant_id, acv_type_code)            [name: 'idx_acv_tenant_type']
  }

  Note: 'Copilot conversation session stub; full detail lives in AI Layer domain.'
}


// --------------------------------------------------------
// FieldDefinition & SelfServiceFieldRule
// --------------------------------------------------------

// 1. Field definition catalog (global)
Table sys_field_def {
  fdf_id               bigint       [pk, increment]

  fdf_target_entity_type varchar(100) [not null]   // PERSON, EMPLOYEE, WELLNESS_PROFILE, etc.
  fdf_field_key          varchar(100) [not null]   // date_of_birth, personal_email, etc.
  fdf_label              varchar(200) [not null]
  fdf_help_text          text         [null]
  fdf_field_group        varchar(100) [null]       // Personal Details, Contact Info, etc.
  fdf_data_type_code     varchar(50)  [not null]   // TEXT, DATE, ENUM, BOOLEAN, NUMBER, etc.
  fdf_is_active          boolean      [not null, default: true]

  fdf_created_at         timestamptz  [not null, default: 'now()']
  fdf_created_by         bigint       [null, ref: > sys_user.usr_id]
  fdf_updated_at         timestamptz  [null]
  fdf_updated_by         bigint       [null, ref: > sys_user.usr_id]

  indexes {
    (fdf_target_entity_type, fdf_field_key) [unique, name: 'uq_fdf_entity_field']
  }

  Note: 'Global catalog of configurable fields used in ESS/MSS; referenced by SelfServiceFieldRule.'
}

// 2. Field-level ESS/MSS rules per tenant & role
Table sys_field_rule {
  frl_id                    bigint       [pk, increment]
  frl_tenant_id             bigint       [not null, ref: > sys_tenant.ten_id]
  frl_rol_id                bigint       [not null, ref: > sys_role.rol_id]
  frl_fdf_id                bigint       [not null, ref: > sys_field_def.fdf_id]

  frl_portal_type_code      varchar(20)  [not null]   // ESS, MSS
  frl_visible_flag          boolean      [not null, default: true]
  frl_editable_flag         boolean      [not null, default: false]
  frl_requires_approval_flag boolean     [not null, default: false]
  frl_justification_required_flag boolean [not null, default: false]

  frl_effective_from        date         [not null]
  frl_effective_to          date         [null]
  frl_status_code           varchar(50)  [not null, default: 'ACTIVE']

  frl_created_at            timestamptz  [not null, default: 'now()']
  frl_created_by            bigint       [null, ref: > sys_user.usr_id]
  frl_updated_at            timestamptz  [null]
  frl_updated_by            bigint       [null, ref: > sys_user.usr_id]

  indexes {
    (frl_tenant_id)                            [name: 'idx_frl_tenant_id']
    (frl_rol_id)                               [name: 'idx_frl_rol_id']
    (frl_fdf_id)                               [name: 'idx_frl_fdf_id']
    (frl_tenant_id, frl_rol_id, frl_fdf_id, frl_portal_type_code, frl_effective_from) [name: 'idx_frl_uniqueness']
  }

  Note: 'Tenant- & role-specific ESS/MSS field rules controlling visibility and editability of Person/Employee fields.'
}
```

---

### Foreign Key Relationships (Readable Summary)

| From table                | From column     | To table        | To column | Notes                                          |
| ------------------------- | --------------- | --------------- | --------- | ---------------------------------------------- |
| `sys_user_role`           | `url_tenant_id` | `sys_tenant`    | `ten_id`  | RBAC membership is tenant-scoped               |
| `sys_user_role`           | `url_usr_id`    | `sys_user`      | `usr_id`  | User in a tenant                               |
| `sys_user_role`           | `url_rol_id`    | `sys_role`      | `rol_id`  | Role assigned to user                          |
| `pid_employee`            | `emp_tenant_id` | `sys_tenant`    | `ten_id`  | Employee record per tenant                     |
| `pid_employee`            | `emp_per_id`    | `pid_person`    | `per_id`  | Employee is a tenant-specific view of a Person |
| `org_unit`                | `unt_tenant_id` | `sys_tenant`    | `ten_id`  | Org units are tenant-scoped                    |
| `org_position_assignment` | `pas_tenant_id` | `sys_tenant`    | `ten_id`  | Assignments are tenant-scoped                  |
| `org_position_assignment` | `pas_emp_id`    | `pid_employee`  | `emp_id`  | Employee being assigned                        |
| `org_position_assignment` | `pas_unt_id`    | `org_unit`      | `unt_id`  | Org unit the employee sits under               |
| `lea_leave_request`       | `lrq_tenant_id` | `sys_tenant`    | `ten_id`  | Leave requests are tenant-scoped               |
| `lea_leave_request`       | `lrq_emp_id`    | `pid_employee`  | `emp_id`  | Employee making the request                    |
| `lea_leave_balance`       | `lba_tenant_id` | `sys_tenant`    | `ten_id`  | Leave balances are tenant-scoped               |
| `lea_leave_balance`       | `lba_emp_id`    | `pid_employee`  | `emp_id`  | Employee whose balance is tracked              |
| `lea_recovery_index`      | `rix_tenant_id` | `sys_tenant`    | `ten_id`  | Recovery indices are tenant-scoped             |
| `lea_recovery_index`      | `rix_emp_id`    | `pid_employee`  | `emp_id`  | Employee whose wellbeing is summarised         |
| `prf_perf_appraisal`      | `pap_tenant_id` | `sys_tenant`    | `ten_id`  | Appraisals are tenant-scoped                   |
| `prf_perf_appraisal`      | `pap_emp_id`    | `pid_employee`  | `emp_id`  | Employee under review                          |
| `gam_profile`             | `gpr_tenant_id` | `sys_tenant`    | `ten_id`  | Gamification profiles are tenant-scoped        |
| `gam_profile`             | `gpr_emp_id`    | `pid_employee`  | `emp_id`  | Employee’s gamification profile                |
| `gam_manager_scorecard`   | `gms_tenant_id` | `sys_tenant`    | `ten_id`  | Scorecards are tenant-scoped                   |
| `gam_manager_scorecard`   | `gms_emp_id`    | `pid_employee`  | `emp_id`  | Manager employee whose stewardship is scored   |
| `ais_conversation`        | `acv_tenant_id` | `sys_tenant`    | `ten_id`  | Conversations are tenant-scoped                |
| `ais_conversation`        | `acv_usr_id`    | `sys_user`      | `usr_id`  | User who started the conversation              |
| `sys_field_rule`          | `frl_tenant_id` | `sys_tenant`    | `ten_id`  | Self-service rules are tenant-scoped           |
| `sys_field_rule`          | `frl_rol_id`    | `sys_role`      | `rol_id`  | Role context (Employee/Manager/HR)             |
| `sys_field_rule`          | `frl_fdf_id`    | `sys_field_def` | `fdf_id`  | Field whose behaviour is controlled            |

---

### Design Notes

I treated **Person and Employee** as the true “People Core” of the platform: `pid_person` is global and tenant-agnostic, while `pid_employee` is tenant-scoped and links a person into a specific organisation. This mirrors how the rest of the platform (leave, performance, gamification, AI) already hang off `emp_id`, and gives you a clean, consistent anchor for cross-domain joins.

For **SelfServiceFieldRule**, I introduced a separate `sys_field_def` catalog and made `sys_field_rule` tenant- and role-scoped. This matches your earlier ESS/MSS narrative: global knowledge of what a field *is* (data type, label, entity) plus per-tenant/per-role rules for visibility and editability. That design also avoids duplicating the same field metadata for every tenant, while still allowing HR per tenant to tune the self-service experience.

Finally, I kept the other domains (Org, Leave, Recovery Index, Perf, Gamification, AI) as **lightweight stubs**: just enough columns to respect the relationships in your diagram and keep reporting straightforward, without re-specifying all their business rules here. In your combined schema, these stubs will be reconciled with the richer domain-specific DBML you’ve already generated for Work Lattice, Rhythms, Growth Signals, Gamification, and the AI Layer.
