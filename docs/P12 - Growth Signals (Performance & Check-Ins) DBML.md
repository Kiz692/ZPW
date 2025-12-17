```dbml
// Domain: Growth Signals (Performance & Check-Ins)

// --------------------------------------------------------
// System / Shared stubs (for FK references)
// --------------------------------------------------------

Table sys_tenant {
  ten_id   bigint [pk, increment]
  ten_name varchar(200) [not null]

  Note: 'Tenant table (stub; full definition lives in System / Shared domain).'
}

Table pid_employee {
  emp_id        bigint [pk, increment]
  emp_tenant_id bigint [not null, ref: > sys_tenant.ten_id]

  Note: 'Employee table (stub; full definition lives in People & Identity domain).'
}

Table org_job_role {
  jbr_id        bigint       [pk, increment]
  jbr_tenant_id bigint       [not null, ref: > sys_tenant.ten_id]
  jbr_code      varchar(50)  [not null]
  jbr_name      varchar(200) [not null]

  indexes {
    (jbr_tenant_id)              [name: 'idx_jbr_tenant_id']
    (jbr_tenant_id, jbr_code)    [name: 'uq_jbr_tenant_code', unique]
  }

  Note: 'Job role table (stub; full definition lives in Work Lattice domain).'
}

// --------------------------------------------------------
// Performance & Check-Ins (Growth Signals)
// --------------------------------------------------------

// Performance cycle (e.g. 2025_H1)
Table prf_perf_cycle {
  pcl_id          bigint       [pk, increment]
  pcl_tenant_id   bigint       [not null, ref: > sys_tenant.ten_id]

  pcl_code        varchar(50)  [not null]   // e.g. 2025_H1
  pcl_name        varchar(200) [not null]
  pcl_start_date  date         [not null]
  pcl_end_date    date         [not null]
  pcl_status_code varchar(50)  [not null]   // PLANNED, ACTIVE, CLOSED, etc.

  pcl_created_at  timestamptz  [not null, default: `now()`]
  pcl_created_by  bigint       [null]
  pcl_updated_at  timestamptz  [null]
  pcl_updated_by  bigint       [null]
  pcl_deleted_at  timestamptz  [null]
  pcl_deleted_by  bigint       [null]

  indexes {
    (pcl_tenant_id)                    [name: 'idx_pcl_tenant_id']
    (pcl_tenant_id, pcl_code)          [name: 'uq_pcl_tenant_code', unique]
    (pcl_tenant_id, pcl_status_code)   [name: 'idx_pcl_tenant_status']
  }

  Note: 'Performance cycle window per tenant.'
}

// Appraisal template definition
Table prf_perf_template {
  ptm_id         bigint       [pk, increment]
  ptm_tenant_id  bigint       [not null, ref: > sys_tenant.ten_id]

  ptm_name       varchar(200) [not null]
  ptm_description text        [null]
  ptm_is_active  boolean      [not null, default: true]

  ptm_created_at timestamptz  [not null, default: `now()`]
  ptm_created_by bigint       [null]
  ptm_updated_at timestamptz  [null]
  ptm_updated_by bigint       [null]
  ptm_deleted_at timestamptz  [null]
  ptm_deleted_by bigint       [null]

  indexes {
    (ptm_tenant_id)               [name: 'idx_ptm_tenant_id']
    (ptm_tenant_id, ptm_name)     [name: 'uq_ptm_tenant_name', unique]
  }

  Note: 'Top-level appraisal template (sections & questions hang off this).'
}

// Assignment of templates to scopes (job role, org unit, etc.)
Table prf_perf_template_assign {
  pta_id               bigint       [pk, increment]
  pta_tenant_id        bigint       [not null, ref: > sys_tenant.ten_id]
  pta_ptm_id           bigint       [not null, ref: > prf_perf_template.ptm_id]
  pta_jbr_id           bigint       [null, ref: > org_job_role.jbr_id] // used when scope_type = JOB_ROLE

  pta_scope_type_code  varchar(50)  [not null]   // JOB_ROLE, ORG_UNIT, TENANT_DEFAULT, etc.
  pta_scope_value      varchar(100) [null]       // e.g. org unit code, grade code
  pta_effective_from   date         [not null]
  pta_effective_to     date         [null]
  pta_priority         int          [not null, default: 100]

  pta_created_at       timestamptz  [not null, default: `now()`]
  pta_created_by       bigint       [null]
  pta_updated_at       timestamptz  [null]
  pta_updated_by       bigint       [null]
  pta_deleted_at       timestamptz  [null]
  pta_deleted_by       bigint       [null]

  indexes {
    (pta_tenant_id)                              [name: 'idx_pta_tenant_id']
    (pta_ptm_id)                                 [name: 'idx_pta_ptm_id']
    (pta_jbr_id)                                 [name: 'idx_pta_jbr_id']
    (pta_tenant_id, pta_scope_type_code, pta_scope_value, pta_jbr_id, pta_effective_from)
        [name: 'idx_pta_scope_from']
  }

  Note: 'Determines which template applies to which population (job roles, org units, etc.).'
}

// Sections within a template (e.g. KPIs, OKRs, Values)
Table prf_perf_section {
  psc_id               bigint       [pk, increment]
  psc_tenant_id        bigint       [not null, ref: > sys_tenant.ten_id]
  psc_ptm_id           bigint       [not null, ref: > prf_perf_template.ptm_id]

  psc_section_type_code varchar(50) [not null]   // KPIS, OKRS, VALUES, NARRATIVE, etc.
  psc_label            varchar(200) [not null]
  psc_is_scoring       boolean      [not null, default: true]
  psc_weight_pct       numeric(5,2) [null]       // contribution to overall score
  psc_sequence         int          [not null]   // order within template

  psc_created_at       timestamptz  [not null, default: `now()`]
  psc_created_by       bigint       [null]
  psc_updated_at       timestamptz  [null]
  psc_updated_by       bigint       [null]
  psc_deleted_at       timestamptz  [null]
  psc_deleted_by       bigint       [null]

  indexes {
    (psc_tenant_id)                                [name: 'idx_psc_tenant_id']
    (psc_ptm_id)                                   [name: 'idx_psc_ptm_id']
    (psc_tenant_id, psc_ptm_id, psc_sequence)      [name: 'uq_psc_template_sequence', unique]
  }

  Note: 'Logical sections within a template; used for scoring and grouping.'
}

// Questions in narrative/behavioural sections
Table prf_perf_question {
  pqs_id                 bigint       [pk, increment]
  pqs_tenant_id          bigint       [not null, ref: > sys_tenant.ten_id]
  pqs_psc_id             bigint       [not null, ref: > prf_perf_section.psc_id]

  pqs_text               text         [not null]
  pqs_help_text          text         [null]
  pqs_response_type_code varchar(50)  [not null]   // RATING_1_5, TEXT, etc.
  pqs_inner_weight       numeric(5,2) [null]       // weight within section
  pqs_is_active          boolean      [not null, default: true]
  pqs_sequence           int          [not null, default: 1]

  pqs_created_at         timestamptz  [not null, default: `now()`]
  pqs_created_by         bigint       [null]
  pqs_updated_at         timestamptz  [null]
  pqs_updated_by         bigint       [null]
  pqs_deleted_at         timestamptz  [null]
  pqs_deleted_by         bigint       [null]

  indexes {
    (pqs_tenant_id)                                  [name: 'idx_pqs_tenant_id']
    (pqs_psc_id)                                     [name: 'idx_pqs_psc_id']
    (pqs_tenant_id, pqs_psc_id, pqs_sequence)        [name: 'uq_pqs_section_sequence', unique]
  }

  Note: 'Questions used for self/manager/final narrative or behaviour ratings.'
}

// Overall rating bands (e.g. Outstanding, Solid, Needs Support)
Table prf_rating_band {
  rbd_id         bigint       [pk, increment]
  rbd_tenant_id  bigint       [not null, ref: > sys_tenant.ten_id]

  rbd_name       varchar(100) [not null]
  rbd_description text        [null]
  rbd_is_active  boolean      [not null, default: true]

  rbd_created_at timestamptz  [not null, default: `now()`]
  rbd_created_by bigint       [null]
  rbd_updated_at timestamptz  [null]
  rbd_updated_by bigint       [null]
  rbd_deleted_at timestamptz  [null]
  rbd_deleted_by bigint       [null]

  indexes {
    (rbd_tenant_id)                [name: 'idx_rbd_tenant_id']
    (rbd_tenant_id, rbd_name)      [name: 'uq_rbd_tenant_name', unique]
  }

  Note: 'Tenant-specific performance rating banding schemes.'
}

// Score ranges within a rating band
Table prf_rating_band_range {
  rbr_id         bigint       [pk, increment]
  rbr_tenant_id  bigint       [not null, ref: > sys_tenant.ten_id]
  rbr_rbd_id     bigint       [not null, ref: > prf_rating_band.rbd_id]

  rbr_code       varchar(50)  [not null]    // e.g. A, B, C or OUTSTANDING, etc.
  rbr_label      varchar(100) [not null]
  rbr_min_score  numeric(5,2) [not null]
  rbr_max_score  numeric(5,2) [not null]
  rbr_sequence   int          [not null]
  rbr_is_active  boolean      [not null, default: true]

  rbr_created_at timestamptz  [not null, default: `now()`]
  rbr_created_by bigint       [null]
  rbr_updated_at timestamptz  [null]
  rbr_updated_by bigint       [null]
  rbr_deleted_at timestamptz  [null]
  rbr_deleted_by bigint       [null]

  indexes {
    (rbr_tenant_id)                          [name: 'idx_rbr_tenant_id']
    (rbr_rbd_id)                             [name: 'idx_rbr_rbd_id']
    (rbr_tenant_id, rbr_rbd_id, rbr_code)    [name: 'uq_rbr_band_code', unique]
    (rbr_tenant_id, rbr_rbd_id, rbr_sequence) [name: 'idx_rbr_band_seq']
  }

  Note: 'Maps overall scores to named rating labels for a given scheme.'
}

// Appraisal instance per employee per cycle
Table prf_perf_appraisal {
  pap_id                 bigint        [pk, increment]
  pap_tenant_id          bigint        [not null, ref: > sys_tenant.ten_id]
  pap_emp_id             bigint        [not null, ref: > pid_employee.emp_id]
  pap_pcl_id             bigint        [not null, ref: > prf_perf_cycle.pcl_id]
  pap_ptm_id             bigint        [not null, ref: > prf_perf_template.ptm_id]
  pap_rbd_id             bigint        [null, ref: > prf_rating_band.rbd_id]

  pap_status_code        varchar(50)   [not null]   // DRAFT, IN_PROGRESS, IN_REVIEW, FINALIZED, etc.
  pap_self_completed_at  timestamptz   [null]
  pap_manager_completed_at timestamptz [null]
  pap_finalized_at       timestamptz   [null]
  pap_overall_score      numeric(5,2)  [null]
  pap_overall_rating_code varchar(50)  [null]       // e.g. OUTSTANDING, SOLID, etc.
  pap_is_locked          boolean       [not null, default: false]

  pap_created_at         timestamptz   [not null, default: `now()`]
  pap_created_by         bigint        [null]
  pap_updated_at         timestamptz   [null]
  pap_updated_by         bigint        [null]
  pap_deleted_at         timestamptz   [null]
  pap_deleted_by         bigint        [null]

  indexes {
    (pap_tenant_id)                                    [name: 'idx_pap_tenant_id']
    (pap_emp_id)                                       [name: 'idx_pap_emp_id']
    (pap_pcl_id)                                       [name: 'idx_pap_pcl_id']
    (pap_ptm_id)                                       [name: 'idx_pap_ptm_id']
    (pap_rbd_id)                                       [name: 'idx_pap_rbd_id']
    (pap_tenant_id, pap_emp_id, pap_pcl_id)            [name: 'uq_pap_emp_cycle', unique]
    (pap_tenant_id, pap_status_code)                   [name: 'idx_pap_tenant_status']
  }

  Note: 'Core appraisal record per employee per cycle, referencing template and rating band scheme.'
}

// Answers per appraisal-question pair
Table prf_perf_answer {
  pan_id             bigint        [pk, increment]
  pan_tenant_id      bigint        [not null, ref: > sys_tenant.ten_id]
  pan_pap_id         bigint        [not null, ref: > prf_perf_appraisal.pap_id]
  pan_pqs_id         bigint        [not null, ref: > prf_perf_question.pqs_id]

  pan_self_rating    numeric(5,2)  [null]
  pan_self_comment   text          [null]
  pan_manager_rating numeric(5,2)  [null]
  pan_manager_comment text         [null]
  pan_final_rating   numeric(5,2)  [null]
  pan_final_comment  text          [null]

  pan_created_at     timestamptz   [not null, default: `now()`]
  pan_created_by     bigint        [null]
  pan_updated_at     timestamptz   [null]
  pan_updated_by     bigint        [null]
  pan_deleted_at     timestamptz   [null]
  pan_deleted_by     bigint        [null]

  indexes {
    (pan_tenant_id)                         [name: 'idx_pan_tenant_id']
    (pan_pap_id)                            [name: 'idx_pan_pap_id']
    (pan_pqs_id)                            [name: 'idx_pan_pqs_id']
    (pan_tenant_id, pan_pap_id, pan_pqs_id) [name: 'uq_pan_appraisal_question', unique]
  }

  Note: 'Stores self, manager, and final ratings/comments for each question in an appraisal.'
}

// KPI/OKR/performance items inside an appraisal
Table prf_perf_item {
  pit_id              bigint        [pk, increment]
  pit_tenant_id       bigint        [not null, ref: > sys_tenant.ten_id]
  pit_pap_id          bigint        [not null, ref: > prf_perf_appraisal.pap_id]
  pit_psc_id          bigint        [null, ref: > prf_perf_section.psc_id]

  pit_item_type_code  varchar(50)   [not null]    // KPI, OKR, DEV_PLAN, etc.
  pit_title           varchar(255)  [not null]
  pit_description     text          [null]
  pit_role_context    varchar(50)   [null]        // INDIVIDUAL, TEAM, MANAGER, etc.
  pit_target_or_measure text        [null]
  pit_weight_pct      numeric(5,2)  [null]

  pit_self_rating     numeric(5,2)  [null]
  pit_self_comment    text          [null]
  pit_manager_rating  numeric(5,2)  [null]
  pit_manager_comment text          [null]
  pit_final_rating    numeric(5,2)  [null]
  pit_final_comment   text          [null]
  pit_sequence        int           [null]

  pit_created_at      timestamptz   [not null, default: `now()`]
  pit_created_by      bigint        [null]
  pit_updated_at      timestamptz   [null]
  pit_updated_by      bigint        [null]
  pit_deleted_at      timestamptz   [null]
  pit_deleted_by      bigint        [null]

  indexes {
    (pit_tenant_id)             [name: 'idx_pit_tenant_id']
    (pit_pap_id)                [name: 'idx_pit_pap_id']
    (pit_psc_id)                [name: 'idx_pit_psc_id']
  }

  Note: 'Unified representation for KPIs, OKRs, and similar items with their own ratings.'
}

// Growth / wellness / development actions agreed in appraisals
Table prf_perf_action {
  pac_id             bigint        [pk, increment]
  pac_tenant_id      bigint        [not null, ref: > sys_tenant.ten_id]
  pac_pap_id         bigint        [not null, ref: > prf_perf_appraisal.pap_id]
  pac_owner_emp_id   bigint        [not null, ref: > pid_employee.emp_id]

  pac_action_type_code varchar(50) [not null]    // DEVELOPMENT, WELLNESS, ROLE_CHANGE, etc.
  pac_description    text          [not null]
  pac_target_date    date          [null]
  pac_status_code    varchar(50)   [not null]    // OPEN, IN_PROGRESS, COMPLETED, CANCELLED

  pac_created_at     timestamptz   [not null, default: `now()`]
  pac_created_by     bigint        [null]
  pac_updated_at     timestamptz   [null]
  pac_updated_by     bigint        [null]
  pac_deleted_at     timestamptz   [null]
  pac_deleted_by     bigint        [null]

  indexes {
    (pac_tenant_id)                    [name: 'idx_pac_tenant_id']
    (pac_pap_id)                       [name: 'idx_pac_pap_id']
    (pac_owner_emp_id)                 [name: 'idx_pac_owner_emp_id']
    (pac_tenant_id, pac_status_code)   [name: 'idx_pac_tenant_status']
  }

  Note: 'Track follow-up actions from appraisals with owners and due dates.'
}

// 1:1 check-ins with wellbeing signals
Table prf_checkin {
  chk_id               bigint        [pk, increment]
  chk_tenant_id        bigint        [not null, ref: > sys_tenant.ten_id]
  chk_subject_emp_id   bigint        [not null, ref: > pid_employee.emp_id]  // employee being checked in on
  chk_manager_emp_id   bigint        [not null, ref: > pid_employee.emp_id]  // manager/coach running the check-in

  chk_datetime         timestamptz   [not null]
  chk_summary          text          [null]
  chk_energy_score     numeric(3,1)  [null]   // e.g. 1.0-10.0
  chk_workload_score   numeric(3,1)  [null]
  chk_stress_score     numeric(3,1)  [null]

  chk_created_at       timestamptz   [not null, default: `now()`]
  chk_created_by       bigint        [null]
  chk_updated_at       timestamptz   [null]
  chk_updated_by       bigint        [null]
  chk_deleted_at       timestamptz   [null]
  chk_deleted_by       bigint        [null]

  indexes {
    (chk_tenant_id)                                     [name: 'idx_chk_tenant_id']
    (chk_subject_emp_id)                                [name: 'idx_chk_subject_emp_id']
    (chk_manager_emp_id)                                [name: 'idx_chk_manager_emp_id']
    (chk_tenant_id, chk_subject_emp_id, chk_datetime)   [name: 'idx_chk_subject_time']
    (chk_tenant_id, chk_manager_emp_id, chk_datetime)   [name: 'idx_chk_manager_time']
  }

  Note: '1:1 check-ins capturing short narrative plus simple wellbeing scores.'
}
```

---

### Foreign Key Relationships (Readable Summary)

| From table                 | From column          | To table             | To column | Notes                                             |
| -------------------------- | -------------------- | -------------------- | --------- | ------------------------------------------------- |
| `pid_employee` (stub)      | `emp_tenant_id`      | `sys_tenant`         | `ten_id`  | Employee tenant scoping (People domain)           |
| `org_job_role` (stub)      | `jbr_tenant_id`      | `sys_tenant`         | `ten_id`  | Job role tenant scoping (Work Lattice)            |
| `prf_perf_cycle`           | `pcl_tenant_id`      | `sys_tenant`         | `ten_id`  | Tenant scoping                                    |
| `prf_perf_template`        | `ptm_tenant_id`      | `sys_tenant`         | `ten_id`  | Tenant scoping                                    |
| `prf_perf_template_assign` | `pta_tenant_id`      | `sys_tenant`         | `ten_id`  | Tenant scoping                                    |
| `prf_perf_template_assign` | `pta_ptm_id`         | `prf_perf_template`  | `ptm_id`  | Assignment belongs to a template                  |
| `prf_perf_template_assign` | `pta_jbr_id`         | `org_job_role`       | `jbr_id`  | Scope by job role when `scope_type = JOB_ROLE`    |
| `prf_perf_section`         | `psc_tenant_id`      | `sys_tenant`         | `ten_id`  | Tenant scoping                                    |
| `prf_perf_section`         | `psc_ptm_id`         | `prf_perf_template`  | `ptm_id`  | Sections belong to template                       |
| `prf_perf_question`        | `pqs_tenant_id`      | `sys_tenant`         | `ten_id`  | Tenant scoping                                    |
| `prf_perf_question`        | `pqs_psc_id`         | `prf_perf_section`   | `psc_id`  | Questions belong to section                       |
| `prf_rating_band`          | `rbd_tenant_id`      | `sys_tenant`         | `ten_id`  | Tenant scoping                                    |
| `prf_rating_band_range`    | `rbr_tenant_id`      | `sys_tenant`         | `ten_id`  | Tenant scoping                                    |
| `prf_rating_band_range`    | `rbr_rbd_id`         | `prf_rating_band`    | `rbd_id`  | Ranges belong to a rating band scheme             |
| `prf_perf_appraisal`       | `pap_tenant_id`      | `sys_tenant`         | `ten_id`  | Tenant scoping                                    |
| `prf_perf_appraisal`       | `pap_emp_id`         | `pid_employee`       | `emp_id`  | Appraised employee                                |
| `prf_perf_appraisal`       | `pap_pcl_id`         | `prf_perf_cycle`     | `pcl_id`  | Cycle for this appraisal                          |
| `prf_perf_appraisal`       | `pap_ptm_id`         | `prf_perf_template`  | `ptm_id`  | Template used                                     |
| `prf_perf_appraisal`       | `pap_rbd_id`         | `prf_rating_band`    | `rbd_id`  | Rating band scheme used                           |
| `prf_perf_answer`          | `pan_tenant_id`      | `sys_tenant`         | `ten_id`  | Tenant scoping                                    |
| `prf_perf_answer`          | `pan_pap_id`         | `prf_perf_appraisal` | `pap_id`  | Answer belongs to an appraisal                    |
| `prf_perf_answer`          | `pan_pqs_id`         | `prf_perf_question`  | `pqs_id`  | Answer corresponds to a question                  |
| `prf_perf_item`            | `pit_tenant_id`      | `sys_tenant`         | `ten_id`  | Tenant scoping                                    |
| `prf_perf_item`            | `pit_pap_id`         | `prf_perf_appraisal` | `pap_id`  | Item belongs to an appraisal                      |
| `prf_perf_item`            | `pit_psc_id`         | `prf_perf_section`   | `psc_id`  | Optional section link (e.g. KPIs vs OKRs section) |
| `prf_perf_action`          | `pac_tenant_id`      | `sys_tenant`         | `ten_id`  | Tenant scoping                                    |
| `prf_perf_action`          | `pac_pap_id`         | `prf_perf_appraisal` | `pap_id`  | Action originated from an appraisal               |
| `prf_perf_action`          | `pac_owner_emp_id`   | `pid_employee`       | `emp_id`  | Employee owning the action                        |
| `prf_checkin`              | `chk_tenant_id`      | `sys_tenant`         | `ten_id`  | Tenant scoping                                    |
| `prf_checkin`              | `chk_subject_emp_id` | `pid_employee`       | `emp_id`  | Employee being checked in on                      |
| `prf_checkin`              | `chk_manager_emp_id` | `pid_employee`       | `emp_id`  | Manager/coach running the check-in                |

---

### Key Design Choices

I kept **strict tenant scoping** across the whole Growth Signals domain: every performance/check-in table has its own `<prefix>_tenant_id` FK to `sys_tenant`, even where the tenant could be inferred via a parent (e.g. questions via sections). This mirrors the Rhythms approach and makes row-level security, partitioning, and ad-hoc queries against child tables far safer and simpler.

The model separates **configuration vs runtime** entities cleanly: cycles, templates, sections, questions, rating bands, and template assignments are all config; appraisals, answers, items, actions, and check-ins are runtime. Template assignment is kept generic (`scope_type_code` + `scope_value` + optional `job_role_id`) so you can support job-role, org-unit, and tenant-default scoping without over-fragmenting tables. Similarly, KPI and OKR items are unified into a single `prf_perf_item` with `item_type_code`, which plays nicer with reporting and UI while still allowing type-specific behaviour.

For ratings, I used numeric scores (`numeric(5,2)`) everywhere (answers, items, overall scores) to support fractional ratings if you ever need them (e.g. 3.5). Narrative comments are colocated on the same rows for answers and items rather than split into separate tables, trading a bit of repetition for much simpler querying and projection into UIs. Finally, check-ins are modeled with separate subject/manager employee FKs and numeric wellbeing scores, making it straightforward to aggregate by either “as manager” or “as individual” and to feed downstream domains like Gamification and Recovery Index.
