```dbml
// Domain: Rhythms (Leave & Absence)

// --------------------------------------------------------
// System / Shared stubs (for FK references)
// --------------------------------------------------------

Table sys_tenant {
  ten_id    bigint [pk, increment]
  ten_name  varchar(200) [not null]

  Note: 'Tenant table (stub; full definition lives in System / Shared domain).'
}

Table pid_employee {
  emp_id         bigint [pk, increment]
  emp_tenant_id  bigint [not null, ref: > sys_tenant.ten_id]

  Note: 'Employee table (stub; full definition lives in People & Identity domain).'
}

Table org_unit {
  unt_id         bigint [pk, increment]
  unt_tenant_id  bigint [not null, ref: > sys_tenant.ten_id]

  Note: 'Org unit table (stub; full definition lives in Work Lattice domain).'
}

Table sys_role {
  rol_id    bigint [pk, increment]
  rol_code  varchar(50) [not null]

  Note: 'Role table (stub; full definition lives in System / Shared domain).'
}

// --------------------------------------------------------
// Leave & Absence – Rhythms tables
// --------------------------------------------------------

// Configurable leave types (annual, sick, wellness, etc.)
Table lea_leave_type {
  ltp_id                  bigint       [pk, increment]
  ltp_tenant_id           bigint       [not null, ref: > sys_tenant.ten_id]

  ltp_code                varchar(50)  [not null]   // unique per tenant
  ltp_name                varchar(200) [not null]
  ltp_category_code       varchar(50)  [not null]   // ANNUAL, SICK, WELLNESS, OTHER, etc.
  ltp_is_paid             boolean      [not null, default: true]
  ltp_requires_attachment boolean      [not null, default: false]
  ltp_min_duration        numeric(5,2) [null]       // min units per request (days or fractions)
  ltp_max_duration        numeric(5,2) [null]       // max units per request
  ltp_is_wellness_related boolean      [not null, default: false]
  ltp_is_active           boolean      [not null, default: true]

  ltp_created_at          timestamptz  [not null, default: `now()`]
  ltp_created_by          bigint       [null]
  ltp_updated_at          timestamptz  [null]
  ltp_updated_by          bigint       [null]
  ltp_deleted_at          timestamptz  [null]
  ltp_deleted_by          bigint       [null]

  indexes {
    (ltp_tenant_id)                 [name: 'idx_ltp_tenant_id']
    (ltp_tenant_id, ltp_code)       [name: 'uq_ltp_tenant_code', unique]
    (ltp_tenant_id, ltp_is_active)  [name: 'idx_ltp_tenant_active']
    (ltp_tenant_id, ltp_category_code) [name: 'idx_ltp_tenant_category']
  }

  Note: 'Leave type definitions per tenant; seeded + configurable.'
}

// Entitlement and accrual policy per leave type
Table lea_leave_policy {
  lpl_id                          bigint       [pk, increment]
  lpl_tenant_id                   bigint       [not null, ref: > sys_tenant.ten_id]
  lpl_ltp_id                      bigint       [not null, ref: > lea_leave_type.ltp_id]

  lpl_accrual_model_code          varchar(50)  [not null]   // NONE, ANNUAL, MONTHLY
  lpl_days_per_period             numeric(5,2) [null]
  lpl_max_annual_entitlement      numeric(5,2) [null]
  lpl_carry_forward_allowed       boolean      [not null, default: false]
  lpl_max_carry_forward_days      numeric(5,2) [null]
  lpl_pro_rata_joiners_rule_code  varchar(50)  [null]
  lpl_pro_rata_leavers_rule_code  varchar(50)  [null]
  lpl_effective_from              date         [not null]
  lpl_effective_to                date         [null]

  lpl_created_at                  timestamptz  [not null, default: `now()`]
  lpl_created_by                  bigint       [null]
  lpl_updated_at                  timestamptz  [null]
  lpl_updated_by                  bigint       [null]
  lpl_deleted_at                  timestamptz  [null]
  lpl_deleted_by                  bigint       [null]

  indexes {
    (lpl_tenant_id)                           [name: 'idx_lpl_tenant_id']
    (lpl_ltp_id)                              [name: 'idx_lpl_ltp_id']
    (lpl_tenant_id, lpl_ltp_id, lpl_effective_from) [name: 'idx_lpl_tenant_type_from']
  }

  Note: 'Policies can be historized via effective_from / effective_to.'
}

// Leave accounting period (e.g., year)
Table lea_leave_period {
  lpd_id             bigint       [pk, increment]
  lpd_tenant_id      bigint       [not null, ref: > sys_tenant.ten_id]

  lpd_code           varchar(50)  [not null]   // e.g. 2025, 2025_FY
  lpd_period_type_code varchar(50) [not null]  // CALENDAR, FISCAL, etc.
  lpd_start_date     date         [not null]
  lpd_end_date       date         [not null]
  lpd_is_active      boolean      [not null, default: false]

  lpd_created_at     timestamptz  [not null, default: `now()`]
  lpd_created_by     bigint       [null]
  lpd_updated_at     timestamptz  [null]
  lpd_updated_by     bigint       [null]
  lpd_deleted_at     timestamptz  [null]
  lpd_deleted_by     bigint       [null]

  indexes {
    (lpd_tenant_id)                  [name: 'idx_lpd_tenant_id']
    (lpd_tenant_id, lpd_code)        [name: 'uq_lpd_tenant_code', unique]
    (lpd_tenant_id, lpd_is_active)   [name: 'idx_lpd_tenant_active']
  }

  Note: 'Typically one active period per tenant; enforce in app/constraints.'
}

// Per-employee, per-type, per-period leave balance
Table lea_leave_balance {
  lba_id              bigint        [pk, increment]
  lba_tenant_id       bigint        [not null, ref: > sys_tenant.ten_id]
  lba_emp_id          bigint        [not null, ref: > pid_employee.emp_id]
  lba_ltp_id          bigint        [not null, ref: > lea_leave_type.ltp_id]
  lba_lpd_id          bigint        [not null, ref: > lea_leave_period.lpd_id]

  lba_opening_balance numeric(7,2)  [not null, default: 0]
  lba_accrued         numeric(7,2)  [not null, default: 0]
  lba_taken           numeric(7,2)  [not null, default: 0]
  lba_adjustment_total numeric(7,2) [not null, default: 0]
  lba_closing_balance numeric(7,2)  [not null, default: 0]
  lba_last_recalc_at  timestamptz   [null]

  lba_created_at      timestamptz   [not null, default: `now()`]
  lba_created_by      bigint        [null]
  lba_updated_at      timestamptz   [null]
  lba_updated_by      bigint        [null]
  lba_deleted_at      timestamptz   [null]
  lba_deleted_by      bigint        [null]

  indexes {
    (lba_tenant_id)                                  [name: 'idx_lba_tenant_id']
    (lba_emp_id)                                     [name: 'idx_lba_emp_id']
    (lba_ltp_id)                                     [name: 'idx_lba_ltp_id']
    (lba_lpd_id)                                     [name: 'idx_lba_lpd_id']
    (lba_tenant_id, lba_emp_id, lba_ltp_id, lba_lpd_id) [name: 'uq_lba_emp_type_period', unique]
  }

  Note: 'One row per employee + leaveType + period; totals derived from policy, usage & adjustments.'
}

// Auditable balance adjustment entries
Table lea_leave_bal_adj {
  lad_id          bigint        [pk, increment]
  lad_tenant_id   bigint        [not null, ref: > sys_tenant.ten_id]
  lad_lba_id      bigint        [not null, ref: > lea_leave_balance.lba_id]

  lad_amount      numeric(7,2)  [not null]  // + or - days
  lad_reason_code varchar(50)   [null]
  lad_comment     text          [null]
  lad_adjusted_at timestamptz   [not null, default: `now()`]

  lad_created_at  timestamptz   [not null, default: `now()`]
  lad_created_by  bigint        [null]
  lad_updated_at  timestamptz   [null]
  lad_updated_by  bigint        [null]
  lad_deleted_at  timestamptz   [null]
  lad_deleted_by  bigint        [null]

  indexes {
    (lad_tenant_id)  [name: 'idx_lad_tenant_id']
    (lad_lba_id)     [name: 'idx_lad_lba_id']
  }

  Note: 'Keeps a detailed audit log of manual balance changes; supports recon and compliance.'
}

// Leave request header
Table lea_leave_request {
  lrq_id                 bigint        [pk, increment]
  lrq_tenant_id          bigint        [not null, ref: > sys_tenant.ten_id]
  lrq_emp_id             bigint        [not null, ref: > pid_employee.emp_id]
  lrq_ltp_id             bigint        [not null, ref: > lea_leave_type.ltp_id]
  lrq_lpd_id             bigint        [not null, ref: > lea_leave_period.lpd_id]

  lrq_request_datetime   timestamptz   [not null]
  lrq_start_date         date          [not null]
  lrq_end_date           date          [not null]
  lrq_total_duration_units numeric(7,2) [not null]   // total units requested
  lrq_reason             text          [null]
  lrq_attachment_ref     varchar(255)  [null]
  lrq_status_code        varchar(50    ) [not null]  // DRAFT, PENDING, APPROVED, REJECTED, CANCELLED
  lrq_current_stage_code varchar(50)   [null]        // MANAGER, HR, etc.

  lrq_created_at         timestamptz   [not null, default: `now()`]
  lrq_created_by         bigint        [null]
  lrq_updated_at         timestamptz   [null]
  lrq_updated_by         bigint        [null]
  lrq_deleted_at         timestamptz   [null]
  lrq_deleted_by         bigint        [null]

  indexes {
    (lrq_tenant_id)                        [name: 'idx_lrq_tenant_id']
    (lrq_emp_id)                           [name: 'idx_lrq_emp_id']
    (lrq_ltp_id)                           [name: 'idx_lrq_ltp_id']
    (lrq_lpd_id)                           [name: 'idx_lrq_lpd_id']
    (lrq_tenant_id, lrq_status_code)       [name: 'idx_lrq_tenant_status']
    (lrq_tenant_id, lrq_emp_id, lrq_status_code) [name: 'idx_lrq_tenant_emp_status']
  }

  Note: 'Core leave request record; detailed days/segments live in lea_leave_request_day.'
}

// Per-day breakdown of a leave request
Table lea_leave_request_day {
  lrd_id              bigint        [pk, increment]
  lrd_tenant_id       bigint        [not null, ref: > sys_tenant.ten_id]
  lrd_lrq_id          bigint        [not null, ref: > lea_leave_request.lrq_id]

  lrd_date            date          [not null]
  lrd_unit_type_code  varchar(50)   [not null]       // FULL_DAY, HALF_DAY, HOURS, etc.
  lrd_units           numeric(5,2)  [not null]       // units for this day
  lrd_segment_notes   text          [null]

  lrd_created_at      timestamptz   [not null, default: `now()`]
  lrd_created_by      bigint        [null]
  lrd_updated_at      timestamptz   [null]
  lrd_updated_by      bigint        [null]
  lrd_deleted_at      timestamptz   [null]
  lrd_deleted_by      bigint        [null]

  indexes {
    (lrd_tenant_id)                   [name: 'idx_lrd_tenant_id']
    (lrd_lrq_id)                      [name: 'idx_lrd_lrq_id']
    (lrd_lrq_id, lrd_date)            [name: 'uq_lrd_lrq_date', unique]
  }

  Note: 'Allows mixed patterns (full days, half days, hours) within one request.'
}

// Workflow rules per leave type/category
Table lea_leave_workflow_rule {
  lwr_id                 bigint        [pk, increment]
  lwr_tenant_id          bigint        [not null, ref: > sys_tenant.ten_id]
  lwr_ltp_id             bigint        [null, ref: > lea_leave_type.ltp_id] // nullable if scoped by category only

  lwr_scope_type_code    varchar(50)   [not null]   // TYPE, CATEGORY, TENANT_DEFAULT, etc.
  lwr_scope_value_code   varchar(50)   [null]       // e.g. leave category code when scope_type = CATEGORY
  lwr_is_active          boolean       [not null, default: true]
  lwr_effective_from     date          [not null]
  lwr_effective_to       date          [null]
  lwr_special_routing_flags jsonb      [null]       // e.g. { "notify_wellness_champion": true }

  lwr_created_at         timestamptz   [not null, default: `now()`]
  lwr_created_by         bigint        [null]
  lwr_updated_at         timestamptz   [null]
  lwr_updated_by         bigint        [null]
  lwr_deleted_at         timestamptz   [null]
  lwr_deleted_by         bigint        [null]

  indexes {
    (lwr_tenant_id)                         [name: 'idx_lwr_tenant_id']
    (lwr_ltp_id)                            [name: 'idx_lwr_ltp_id']
    (lwr_tenant_id, lwr_scope_type_code, lwr_scope_value_code, lwr_effective_from) [name: 'idx_lwr_scope_from']
    (lwr_tenant_id, lwr_is_active)          [name: 'idx_lwr_tenant_active']
  }

  Note: 'Configures patterns like manager-only, manager+HR, with optional special routing.'
}

// Steps within a workflow rule (e.g. step 1 manager, step 2 HR)
Table lea_leave_workflow_step {
  lws_id               bigint        [pk, increment]
  lws_tenant_id        bigint        [not null, ref: > sys_tenant.ten_id]
  lws_lwr_id           bigint        [not null, ref: > lea_leave_workflow_rule.lwr_id]

  lws_step_number      int           [not null]        // 1, 2, ...
  lws_approver_type_code varchar(50) [not null]        // MANAGER, HR, ROLE, etc.
  lws_approver_rol_id  bigint        [null, ref: > sys_role.rol_id] // used when approver_type = ROLE
  lws_is_final_step    boolean       [not null, default: false]
  lws_step_name        varchar(100)  [null]

  lws_created_at       timestamptz   [not null, default: `now()`]
  lws_created_by       bigint        [null]
  lws_updated_at       timestamptz   [null]
  lws_updated_by       bigint        [null]
  lws_deleted_at       timestamptz   [null]
  lws_deleted_by       bigint        [null]

  indexes {
    (lws_tenant_id)                          [name: 'idx_lws_tenant_id']
    (lws_lwr_id)                             [name: 'idx_lws_lwr_id']
    (lws_tenant_id, lws_lwr_id, lws_step_number) [name: 'uq_lws_rule_step', unique]
  }

  Note: 'Defines ordered approval steps per workflow rule.'
}

// Approval decisions on leave requests
Table lea_leave_approval {
  lap_id                 bigint        [pk, increment]
  lap_tenant_id          bigint        [not null, ref: > sys_tenant.ten_id]
  lap_lrq_id             bigint        [not null, ref: > lea_leave_request.lrq_id]
  lap_lws_id             bigint        [null, ref: > lea_leave_workflow_step.lws_id]

  lap_decision_status_code varchar(50)  [not null]     // APPROVED, REJECTED, CANCELLED
  lap_decision_datetime    timestamptz  [not null]
  lap_decision_comment     text         [null]

  lap_created_at          timestamptz   [not null, default: `now()`]
  lap_created_by          bigint        [null]         // could reference approver user/employee
  lap_updated_at          timestamptz   [null]
  lap_updated_by          bigint        [null]
  lap_deleted_at          timestamptz   [null]
  lap_deleted_by          bigint        [null]

  indexes {
    (lap_tenant_id)                 [name: 'idx_lap_tenant_id']
    (lap_lrq_id)                    [name: 'idx_lap_lrq_id']
    (lap_lws_id)                    [name: 'idx_lap_lws_id']
  }

  Note: 'One row per decision per step; lap_created_by typically holds the approver.'
}

// Staffing / capacity rules per Org Unit
Table lea_roster_rule {
  lrr_id                 bigint        [pk, increment]
  lrr_tenant_id          bigint        [not null, ref: > sys_tenant.ten_id]
  lrr_unt_id             bigint        [not null, ref: > org_unit.unt_id]

  lrr_min_staff_on_duty  numeric(5,2)  [null]    // absolute count or percentage depending on scope
  lrr_max_simultaneous_leaves numeric(5,2) [null]
  lrr_scope_code         varchar(50)   [not null] // ALL_LEAVE, CATEGORY, TYPE, etc.
  lrr_is_active          boolean       [not null, default: true]
  lrr_effective_from     date          [not null]
  lrr_effective_to       date          [null]

  lrr_created_at         timestamptz   [not null, default: `now()`]
  lrr_created_by         bigint        [null]
  lrr_updated_at         timestamptz   [null]
  lrr_updated_by         bigint        [null]
  lrr_deleted_at         timestamptz   [null]
  lrr_deleted_by         bigint        [null]

  indexes {
    (lrr_tenant_id)                      [name: 'idx_lrr_tenant_id']
    (lrr_unt_id)                         [name: 'idx_lrr_unt_id']
    (lrr_tenant_id, lrr_unt_id, lrr_is_active) [name: 'idx_lrr_active_by_unit']
  }

  Note: 'Used when validating leave to protect minimum staffing levels.'
}

// Recovery Index snapshots (rest/recovery signal)
Table lea_recovery_index {
  rix_id                    bigint        [pk, increment]
  rix_tenant_id             bigint        [not null, ref: > sys_tenant.ten_id]
  rix_emp_id                bigint        [not null, ref: > pid_employee.emp_id]

  rix_time_window_type_code varchar(50)   [not null]   // MONTHLY, QUARTERLY, YEARLY, etc.
  rix_time_window_key       varchar(50)   [not null]   // e.g. 2025-01, 2025_Q1
  rix_score                 numeric(5,2)  [not null]
  rix_classification_code   varchar(50)   [null]       // GREEN, AMBER, RED, etc.
  rix_metrics_summary_json  jsonb         [null]       // aggregates used in calculation
  rix_computed_at           timestamptz   [not null]

  rix_created_at            timestamptz   [not null, default: `now()`]
  rix_created_by            bigint        [null]
  rix_updated_at            timestamptz   [null]
  rix_updated_by            bigint        [null]
  rix_deleted_at            timestamptz   [null]
  rix_deleted_by            bigint        [null]

  indexes {
    (rix_tenant_id)                                  [name: 'idx_rix_tenant_id']
    (rix_emp_id)                                     [name: 'idx_rix_emp_id']
    (rix_tenant_id, rix_emp_id, rix_time_window_type_code, rix_time_window_key) [name: 'uq_rix_emp_window', unique]
  }

  Note: 'Computed from historical leave usage; feeds wellbeing views & gamification rings.'
}
```

---

### Foreign Key Relationships (Readable Summary)

| From table                | From column           | To table                  | To column | Notes                                              |
| ------------------------- | --------------------- | ------------------------- | --------- | -------------------------------------------------- |
| `lea_leave_type`          | `ltp_tenant_id`       | `sys_tenant`              | `ten_id`  | Tenant scoping                                     |
| `lea_leave_policy`        | `lpl_tenant_id`       | `sys_tenant`              | `ten_id`  | Tenant scoping                                     |
| `lea_leave_policy`        | `lpl_ltp_id`          | `lea_leave_type`          | `ltp_id`  | Policy per leave type                              |
| `lea_leave_period`        | `lpd_tenant_id`       | `sys_tenant`              | `ten_id`  | Tenant scoping                                     |
| `lea_leave_balance`       | `lba_tenant_id`       | `sys_tenant`              | `ten_id`  | Tenant scoping                                     |
| `lea_leave_balance`       | `lba_emp_id`          | `pid_employee`            | `emp_id`  | Employee owning the balance                        |
| `lea_leave_balance`       | `lba_ltp_id`          | `lea_leave_type`          | `ltp_id`  | Leave type                                         |
| `lea_leave_balance`       | `lba_lpd_id`          | `lea_leave_period`        | `lpd_id`  | Period                                             |
| `lea_leave_bal_adj`       | `lad_tenant_id`       | `sys_tenant`              | `ten_id`  | Tenant scoping                                     |
| `lea_leave_bal_adj`       | `lad_lba_id`          | `lea_leave_balance`       | `lba_id`  | Adjusts a specific balance                         |
| `lea_leave_request`       | `lrq_tenant_id`       | `sys_tenant`              | `ten_id`  | Tenant scoping                                     |
| `lea_leave_request`       | `lrq_emp_id`          | `pid_employee`            | `emp_id`  | Requesting employee                                |
| `lea_leave_request`       | `lrq_ltp_id`          | `lea_leave_type`          | `ltp_id`  | Requested leave type                               |
| `lea_leave_request`       | `lrq_lpd_id`          | `lea_leave_period`        | `lpd_id`  | Period for accounting                              |
| `lea_leave_request_day`   | `lrd_tenant_id`       | `sys_tenant`              | `ten_id`  | Tenant scoping                                     |
| `lea_leave_request_day`   | `lrd_lrq_id`          | `lea_leave_request`       | `lrq_id`  | Per-day breakdown for a leave request              |
| `lea_leave_workflow_rule` | `lwr_tenant_id`       | `sys_tenant`              | `ten_id`  | Tenant scoping                                     |
| `lea_leave_workflow_rule` | `lwr_ltp_id`          | `lea_leave_type`          | `ltp_id`  | Optional direct link to leave type                 |
| `lea_leave_workflow_step` | `lws_tenant_id`       | `sys_tenant`              | `ten_id`  | Tenant scoping                                     |
| `lea_leave_workflow_step` | `lws_lwr_id`          | `lea_leave_workflow_rule` | `lwr_id`  | Steps belong to a rule                             |
| `lea_leave_workflow_step` | `lws_approver_rol_id` | `sys_role`                | `rol_id`  | Role-based approver (when approver_type = ROLE)    |
| `lea_leave_approval`      | `lap_tenant_id`       | `sys_tenant`              | `ten_id`  | Tenant scoping                                     |
| `lea_leave_approval`      | `lap_lrq_id`          | `lea_leave_request`       | `lrq_id`  | Approval for a given request                       |
| `lea_leave_approval`      | `lap_lws_id`          | `lea_leave_workflow_step` | `lws_id`  | Approval at a specific step                        |
| `lea_roster_rule`         | `lrr_tenant_id`       | `sys_tenant`              | `ten_id`  | Tenant scoping                                     |
| `lea_roster_rule`         | `lrr_unt_id`          | `org_unit`                | `unt_id`  | Rules per org unit                                 |
| `lea_recovery_index`      | `rix_tenant_id`       | `sys_tenant`              | `ten_id`  | Tenant scoping                                     |
| `lea_recovery_index`      | `rix_emp_id`          | `pid_employee`            | `emp_id`  | Recovery index per employee                        |
| `pid_employee` (stub)     | `emp_tenant_id`       | `sys_tenant`              | `ten_id`  | Employee tenant scoping (from People domain)       |
| `org_unit` (stub)         | `unt_tenant_id`       | `sys_tenant`              | `ten_id`  | Org unit tenant scoping (from Work Lattice domain) |

---

### Key Design Choices

I’ve kept **strict tenant scoping** across the entire Rhythms domain: every leave-related table carries its own `<prefix>_tenant_id` FK to `sys_tenant`, even when it could be inferred through a parent (e.g. `lea_leave_request_day`). This makes row-level security and tenant-partitioned indexing much simpler and avoids subtle cross-tenant bugs when joining child tables in isolation.

The model separates **headers vs line-level details** where it materially improves clarity and querying: balances vs balance adjustments, leave request vs per-day breakdown, workflow rule vs steps, and request vs approvals. That keeps each entity focused and supports clean auditability (e.g. reconstructing a balance from adjustments, or seeing exactly which step approved/rejected a request), while still being pragmatic enough for reporting and API usage.

For flexible configuration fields (workflow routing flags, Recovery Index metrics), I chose `jsonb` columns rather than premature micro-tables. Codes like `*_status_code`, `*_scope_code`, and `*_type_code` are simple `varchar(50)` so you can start with application-level enums or a small lookup table later. The indexes are tuned for the most common access patterns you’re likely to hit in PeopleWell: by tenant+employee+period/type for balances and Recovery Index, by tenant+status for operational leave queues, and by rule+step number for workflow evaluation.
