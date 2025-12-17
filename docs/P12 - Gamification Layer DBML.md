```dbml
// Domain: Gamification Layer

// --------------------------------------------------------
// System / Shared stubs (for FK references)
// --------------------------------------------------------

Table sys_tenant {
  ten_id   bigint       [pk, increment]
  ten_name varchar(200) [not null]

  Note: 'Tenant table (stub; full definition lives in System / Shared domain).'
}

Table pid_employee {
  emp_id        bigint [pk, increment]
  emp_tenant_id bigint [not null, ref: > sys_tenant.ten_id]

  indexes {
    (emp_tenant_id) [name: 'idx_emp_tenant_id']
  }

  Note: 'Employee table (stub; full definition lives in People & Identity domain).'
}

Table org_unit {
  unt_id        bigint       [pk, increment]
  unt_tenant_id bigint       [not null, ref: > sys_tenant.ten_id]
  unt_code      varchar(50)  [not null]
  unt_name      varchar(200) [not null]

  indexes {
    (unt_tenant_id)               [name: 'idx_unt_tenant_id']
    (unt_tenant_id, unt_code)     [name: 'uq_unt_tenant_code', unique]
  }

  Note: 'Org unit table (stub; full definition lives in Work Lattice domain).'
}

// --------------------------------------------------------
// Gamification tables
// --------------------------------------------------------

// 1. Gamification profile per employee
Table gam_profile {
  gpr_id                 bigint       [pk, increment]
  gpr_tenant_id          bigint       [not null, ref: > sys_tenant.ten_id]
  gpr_emp_id             bigint       [not null, ref: > pid_employee.emp_id]
  gpr_gld_id             bigint       [null, ref: > gam_level_def.gld_id]

  gpr_current_points     integer      [not null, default: 0]
  gpr_current_level_code varchar(50)  [null]        // optional denormalized copy of GLD_CODE
  gpr_last_level_change_at timestamptz [null]
  gpr_show_visuals_flag  boolean      [not null, default: true]

  gpr_created_at         timestamptz  [not null, default: `now()`]
  gpr_created_by         bigint       [null]
  gpr_updated_at         timestamptz  [null]
  gpr_updated_by         bigint       [null]
  gpr_deleted_at         timestamptz  [null]
  gpr_deleted_by         bigint       [null]

  indexes {
    (gpr_tenant_id)                       [name: 'idx_gpr_tenant_id']
    (gpr_emp_id)                          [name: 'idx_gpr_emp_id']
    (gpr_tenant_id, gpr_emp_id)           [name: 'uq_gpr_tenant_emp', unique]
    (gpr_gld_id)                          [name: 'idx_gpr_gld_id']
  }

  Note: 'Gamification state per employee per tenant (points, level, visuals).'
}

// 2. Points transactions (earn/adjustment)
Table gam_points_txn {
  gpt_id                  bigint       [pk, increment]
  gpt_tenant_id           bigint       [not null, ref: > sys_tenant.ten_id]
  gpt_gpr_id              bigint       [not null, ref: > gam_profile.gpr_id]

  gpt_txn_type_code       varchar(50)  [not null]   // EARN, ADJUSTMENT
  gpt_event_category_code varchar(50)  [not null]   // ONBOARDING, LEAVE_PLANNING, etc.
  gpt_points_delta        integer      [not null]
  gpt_txn_at              timestamptz  [not null]

  gpt_source_domain       varchar(100) [not null]   // e.g. LEAVE_REQUEST, PAP_APPRAISAL
  gpt_source_id           varchar(100) [not null]   // opaque ID of source entity
  gpt_comment             text         [null]

  gpt_created_at          timestamptz  [not null, default: `now()`]
  gpt_created_by          bigint       [null]
  gpt_updated_at          timestamptz  [null]
  gpt_updated_by          bigint       [null]
  gpt_deleted_at          timestamptz  [null]
  gpt_deleted_by          bigint       [null]

  indexes {
    (gpt_tenant_id)                             [name: 'idx_gpt_tenant_id']
    (gpt_gpr_id)                                [name: 'idx_gpt_gpr_id']
    (gpt_tenant_id, gpt_gpr_id, gpt_txn_at)     [name: 'idx_gpt_profile_time']
    (gpt_tenant_id, gpt_event_category_code)    [name: 'idx_gpt_tenant_category']
  }

  Note: 'Immutable log of points earn/adjustment events for profiles; used for audit and recalculation.'
}

// 3. Tenant-level points rules
Table gam_points_rule {
  grl_id             bigint       [pk, increment]
  grl_tenant_id      bigint       [not null, ref: > sys_tenant.ten_id]

  grl_template_code  varchar(100) [not null]   // ONBOARDING_COMPLETE, TIMELY_SELF_REVIEW, etc.
  grl_enabled        boolean      [not null, default: true]
  grl_points_awarded integer      [not null]
  grl_condition_scope jsonb       [null]       // optional JSON with thresholds, filters, etc.
  grl_effective_from date         [not null]
  grl_effective_to   date         [null]

  grl_created_at     timestamptz  [not null, default: `now()`]
  grl_created_by     bigint       [null]
  grl_updated_at     timestamptz  [null]
  grl_updated_by     bigint       [null]
  grl_deleted_at     timestamptz  [null]
  grl_deleted_by     bigint       [null]

  indexes {
    (grl_tenant_id)                        [name: 'idx_grl_tenant_id']
    (grl_tenant_id, grl_template_code)     [name: 'uq_grl_tenant_template', unique]
    (grl_tenant_id, grl_enabled)           [name: 'idx_grl_tenant_enabled']
  }

  Note: 'Configures how many points to award for specific behaviours per tenant.'
}

// 4. Level definitions (Getting Started, Steady, Thriving)
Table gam_level_def {
  gld_id         bigint       [pk, increment]
  gld_tenant_id  bigint       [not null, ref: > sys_tenant.ten_id]

  gld_code       varchar(50)  [not null]     // LEVEL_1, LEVEL_2, etc.
  gld_name       varchar(100) [not null]
  gld_description text        [null]
  gld_min_points integer      [not null]
  gld_max_points integer      [not null]
  gld_sequence   int          [not null]

  gld_created_at timestamptz  [not null, default: `now()`]
  gld_created_by bigint       [null]
  gld_updated_at timestamptz  [null]
  gld_updated_by bigint       [null]
  gld_deleted_at timestamptz  [null]
  gld_deleted_by bigint       [null]

  indexes {
    (gld_tenant_id)                     [name: 'idx_gld_tenant_id']
    (gld_tenant_id, gld_code)           [name: 'uq_gld_tenant_code', unique]
    (gld_tenant_id, gld_sequence)       [name: 'idx_gld_tenant_sequence']
  }

  Note: 'Per-tenant points thresholds for levels (used by profiles & reporting).'
}

// 5. Challenge definitions (Quarter of Recovery, Check-in Cadence, etc.)
Table gam_challenge_def {
  gcd_id               bigint       [pk, increment]
  gcd_tenant_id        bigint       [not null, ref: > sys_tenant.ten_id]

  gcd_code             varchar(50)  [not null]
  gcd_name             varchar(200) [not null]
  gcd_description      text         [null]
  gcd_challenge_type_code varchar(50) [not null]   // PLANNED_BREAKS, CHECKIN_CADENCE, etc.
  gcd_eligibility_config jsonb      [null]         // which teams/org units eligible
  gcd_target_definition text        [null]         // human-readable success criteria
  gcd_is_active        boolean      [not null, default: true]
  gcd_start_date       date         [null]        // optional global window
  gcd_end_date         date         [null]

  gcd_created_at       timestamptz  [not null, default: `now()`]
  gcd_created_by       bigint       [null]
  gcd_updated_at       timestamptz  [null]
  gcd_updated_by       bigint       [null]
  gcd_deleted_at       timestamptz  [null]
  gcd_deleted_by       bigint       [null]

  indexes {
    (gcd_tenant_id)                      [name: 'idx_gcd_tenant_id']
    (gcd_tenant_id, gcd_code)            [name: 'uq_gcd_tenant_code', unique]
    (gcd_tenant_id, gcd_is_active)       [name: 'idx_gcd_tenant_active']
  }

  Note: 'Templates for team-based wellbeing challenges.'
}

// 6. Team challenge participation snapshots
Table gam_challenge_participation {
  gcp_id            bigint        [pk, increment]
  gcp_tenant_id     bigint        [not null, ref: > sys_tenant.ten_id]
  gcp_gcd_id        bigint        [not null, ref: > gam_challenge_def.gcd_id]
  gcp_unt_id        bigint        [not null, ref: > org_unit.unt_id]

  gcp_start_date    date          [not null]
  gcp_end_date      date          [null]
  gcp_eligible_count  integer     [not null, default: 0]
  gcp_completed_count integer     [not null, default: 0]
  gcp_completion_pct numeric(5,2) [null]     // cached, derived %
  gcp_status_code   varchar(50   ) [not null] // NOT_STARTED, IN_PROGRESS, COMPLETED
  gcp_summary       text          [null]

  gcp_created_at    timestamptz   [not null, default: `now()`]
  gcp_created_by    bigint        [null]
  gcp_updated_at    timestamptz   [null]
  gcp_updated_by    bigint        [null]
  gcp_deleted_at    timestamptz   [null]
  gcp_deleted_by    bigint        [null]

  indexes {
    (gcp_tenant_id)                                 [name: 'idx_gcp_tenant_id']
    (gcp_gcd_id)                                    [name: 'idx_gcp_gcd_id']
    (gcp_unt_id)                                    [name: 'idx_gcp_unt_id']
    (gcp_tenant_id, gcp_gcd_id, gcp_unt_id, gcp_start_date) [name: 'uq_gcp_tenant_challenge_team_start', unique]
  }

  Note: 'Aggregated participation/completion stats per team and challenge instance.'
}

// 7. Manager health stewardship scorecard
Table gam_manager_scorecard {
  gms_id                    bigint        [pk, increment]
  gms_tenant_id             bigint        [not null, ref: > sys_tenant.ten_id]
  gms_emp_id                bigint        [not null, ref: > pid_employee.emp_id] // manager employee

  gms_time_window_type_code varchar(50)   [not null]   // MONTH, QUARTER, YEAR, etc.
  gms_time_window_key       varchar(50)   [not null]   // 2025-01, 2025_Q1, etc.

  gms_team_size             integer       [not null, default: 0]
  gms_pct_with_planned_breaks numeric(5,2) [null]      // %
  gms_checkin_cadence       numeric(5,2)  [null]       // avg check-ins per person per period
  gms_recovery_green_count  integer       [null]
  gms_recovery_amber_count  integer       [null]
  gms_recovery_red_count    integer       [null]
  gms_stewardship_score     numeric(5,2)  [null]
  gms_computed_at           timestamptz   [not null]

  gms_created_at            timestamptz   [not null, default: `now()`]
  gms_created_by            bigint        [null]
  gms_updated_at            timestamptz   [null]
  gms_updated_by            bigint        [null]
  gms_deleted_at            timestamptz   [null]
  gms_deleted_by            bigint        [null]

  indexes {
    (gms_tenant_id)                                       [name: 'idx_gms_tenant_id']
    (gms_emp_id)                                          [name: 'idx_gms_emp_id']
    (gms_tenant_id, gms_emp_id, gms_time_window_type_code, gms_time_window_key)
        [name: 'uq_gms_manager_window', unique]
  }

  Note: 'Snapshot of a manager’s wellbeing stewardship for a given time window.'
}

// 8. Badge definitions
Table gam_badge {
  gbd_id                 bigint       [pk, increment]
  gbd_tenant_id          bigint       [not null, ref: > sys_tenant.ten_id]

  gbd_code               varchar(50)  [not null]
  gbd_name               varchar(200) [not null]
  gbd_description        text         [null]
  gbd_category_code      varchar(50)  [not null]  // RECOVERY, REFLECTION, WELLNESS, etc.
  gbd_criteria_description text       [null]
  gbd_is_active          boolean      [not null, default: true]

  gbd_created_at         timestamptz  [not null, default: `now()`]
  gbd_created_by         bigint       [null]
  gbd_updated_at         timestamptz  [null]
  gbd_updated_by         bigint       [null]
  gbd_deleted_at         timestamptz  [null]
  gbd_deleted_by         bigint       [null]

  indexes {
    (gbd_tenant_id)                     [name: 'idx_gbd_tenant_id']
    (gbd_tenant_id, gbd_code)           [name: 'uq_gbd_tenant_code', unique]
    (gbd_tenant_id, gbd_is_active)      [name: 'idx_gbd_tenant_active']
  }

  Note: 'Badges representing key wellbeing behaviours/achievements.'
}

// 9. Badge awards to employees
Table gam_badge_award {
  gba_id             bigint       [pk, increment]
  gba_tenant_id      bigint       [not null, ref: > sys_tenant.ten_id]
  gba_gbd_id         bigint       [not null, ref: > gam_badge.gbd_id]
  gba_emp_id         bigint       [not null, ref: > pid_employee.emp_id]
  gba_gpr_id         bigint       [null, ref: > gam_profile.gpr_id]

  gba_awarded_at     timestamptz  [not null]
  gba_award_source_code varchar(50) [not null]  // AUTO_RULE, MANAGER, HR
  gba_message        text         [null]

  gba_created_at     timestamptz  [not null, default: `now()`]
  gba_created_by     bigint       [null]
  gba_updated_at     timestamptz  [null]
  gba_updated_by     bigint       [null]
  gba_deleted_at     timestamptz  [null]
  gba_deleted_by     bigint       [null]

  indexes {
    (gba_tenant_id)                   [name: 'idx_gba_tenant_id']
    (gba_emp_id)                      [name: 'idx_gba_emp_id']
    (gba_gbd_id)                      [name: 'idx_gba_gbd_id']
    (gba_gpr_id)                      [name: 'idx_gba_gpr_id']
    (gba_tenant_id, gba_emp_id, gba_awarded_at) [name: 'idx_gba_emp_time']
  }

  Note: 'History of employees earning badges; optionally linked to their profile.'
}

// 10. Visual ring snapshots (Recovery / Reflection / Wellness)
Table gam_visual_state {
  gvs_id                   bigint        [pk, increment]
  gvs_tenant_id            bigint        [not null, ref: > sys_tenant.ten_id]
  gvs_emp_id               bigint        [not null, ref: > pid_employee.emp_id]
  gvs_gpr_id               bigint        [null, ref: > gam_profile.gpr_id]

  gvs_time_window_type_code varchar(50)  [not null]   // DAY, WEEK, MONTH, etc.
  gvs_time_window_key       varchar(50)  [not null]   // e.g. 2025-01-15, 2025-W05, 2025-01
  gvs_recovery_ring_value   numeric(5,2) [null]       // 0–100
  gvs_reflection_ring_value numeric(5,2) [null]
  gvs_wellness_ring_value   numeric(5,2) [null]
  gvs_computed_at           timestamptz  [not null]

  gvs_created_at            timestamptz  [not null, default: `now()`]
  gvs_created_by            bigint       [null]
  gvs_updated_at            timestamptz  [null]
  gvs_updated_by            bigint       [null]
  gvs_deleted_at            timestamptz  [null]
  gvs_deleted_by            bigint       [null]

  indexes {
    (gvs_tenant_id)                                           [name: 'idx_gvs_tenant_id']
    (gvs_emp_id)                                              [name: 'idx_gvs_emp_id']
    (gvs_gpr_id)                                              [name: 'idx_gvs_gpr_id']
    (gvs_tenant_id, gvs_emp_id, gvs_time_window_type_code, gvs_time_window_key)
        [name: 'uq_gvs_emp_window', unique]
  }

  Note: 'Cached ring values per employee & time window; computed from Leave, Perf, Gamification.'
}
```

---

### Foreign Key Relationships (Readable Summary)

| From table                    | From column     | To table            | To column | Notes                                            |
| ----------------------------- | --------------- | ------------------- | --------- | ------------------------------------------------ |
| `pid_employee`                | `emp_tenant_id` | `sys_tenant`        | `ten_id`  | Employee tenant scoping (stub)                   |
| `org_unit`                    | `unt_tenant_id` | `sys_tenant`        | `ten_id`  | Org unit tenant scoping (stub)                   |
| `gam_profile`                 | `gpr_tenant_id` | `sys_tenant`        | `ten_id`  | Profile tenant scoping                           |
| `gam_profile`                 | `gpr_emp_id`    | `pid_employee`      | `emp_id`  | One profile per employee per tenant              |
| `gam_profile`                 | `gpr_gld_id`    | `gam_level_def`     | `gld_id`  | Current level definition                         |
| `gam_points_txn`              | `gpt_tenant_id` | `sys_tenant`        | `ten_id`  | Transaction tenant scoping                       |
| `gam_points_txn`              | `gpt_gpr_id`    | `gam_profile`       | `gpr_id`  | Transactions belong to a profile                 |
| `gam_points_rule`             | `grl_tenant_id` | `sys_tenant`        | `ten_id`  | Rule tenant scoping                              |
| `gam_level_def`               | `gld_tenant_id` | `sys_tenant`        | `ten_id`  | Level tenant scoping                             |
| `gam_challenge_def`           | `gcd_tenant_id` | `sys_tenant`        | `ten_id`  | Challenge definition tenant scoping              |
| `gam_challenge_participation` | `gcp_tenant_id` | `sys_tenant`        | `ten_id`  | Participation tenant scoping                     |
| `gam_challenge_participation` | `gcp_gcd_id`    | `gam_challenge_def` | `gcd_id`  | Participation instance of a challenge definition |
| `gam_challenge_participation` | `gcp_unt_id`    | `org_unit`          | `unt_id`  | Participation tracked per team/org unit          |
| `gam_manager_scorecard`       | `gms_tenant_id` | `sys_tenant`        | `ten_id`  | Scorecard tenant scoping                         |
| `gam_manager_scorecard`       | `gms_emp_id`    | `pid_employee`      | `emp_id`  | Manager for whom scorecard is computed           |
| `gam_badge`                   | `gbd_tenant_id` | `sys_tenant`        | `ten_id`  | Badge definition tenant scoping                  |
| `gam_badge_award`             | `gba_tenant_id` | `sys_tenant`        | `ten_id`  | Badge award tenant scoping                       |
| `gam_badge_award`             | `gba_gbd_id`    | `gam_badge`         | `gbd_id`  | Which badge was awarded                          |
| `gam_badge_award`             | `gba_emp_id`    | `pid_employee`      | `emp_id`  | Employee who received the badge                  |
| `gam_badge_award`             | `gba_gpr_id`    | `gam_profile`       | `gpr_id`  | Optional link to profile (for convenience)       |
| `gam_visual_state`            | `gvs_tenant_id` | `sys_tenant`        | `ten_id`  | Visual state tenant scoping                      |
| `gam_visual_state`            | `gvs_emp_id`    | `pid_employee`      | `emp_id`  | Employee whose rings are represented             |
| `gam_visual_state`            | `gvs_gpr_id`    | `gam_profile`       | `gpr_id`  | Optional link to profile underlying the visual   |

---

### Key Design Choices

I kept the same **multi-tenant pattern** as your other domains: every gamification table has its own `<prefix>_tenant_id` FK to `sys_tenant`, even where tenancy could be inferred via parent relationships. That keeps row-level security, partitioning, and ad-hoc querying consistent, and avoids surprises when you query child tables directly (e.g. `gam_points_txn`) without joining back to profiles.

Where the model had “conceptual” or derived fields, I treated them pragmatically: `gcp_completion_pct`, `gms_*` metrics, and ring values in `gam_visual_state` are derived from other domains but stored as cached snapshots for reporting and UI performance. `gpr_current_level_code` is kept as an optional denormalized copy of the level code (the canonical relationship is `gpr_gld_id` → `gam_level_def`), which makes UI queries simpler while still allowing you to recompute it reliably if needed.

Finally, I modeled flexible configuration fields (`grl_condition_scope`, `gcd_eligibility_config`) as `jsonb` so that you can evolve rule/eligibility structures without schema churn, while still using simple code fields for core enums (txn type, challenge type, badge category, status codes). The structure keeps runtime data (profiles, transactions, awards, visual states) clearly separated from configuration (points rules, levels, challenges) and higher-level aggregates (manager scorecards, challenge participation), which should make both implementation and analytics much easier to manage.
