```dbml
// Domain: Work Lattice (Org & Jobs)

// --------------------------------------------------------
// System / Shared stubs (for FK references)
// --------------------------------------------------------

Table sys_tenant {
  ten_id    bigint [pk, increment]
  ten_name  varchar(200) [not null]

  Note: 'Tenant table (stub; full definition lives in System / Shared domain).'
}

// People & Identity stub for FK to employee
Table pid_employee {
  emp_id         bigint [pk, increment]
  emp_tenant_id  bigint [not null, ref: > sys_tenant.ten_id]

  Note: 'Employee table (stub; full definition lives in People & Identity domain).'
}

// --------------------------------------------------------
// Org & Jobs – Work Lattice tables
// --------------------------------------------------------

// Organisational units (company, department, team, cost centre)
Table org_unit {
  unt_id              bigint       [pk, increment]
  unt_tenant_id       bigint       [not null, ref: > sys_tenant.ten_id]

  unt_code            varchar(50)  [not null]   // unique per tenant
  unt_name            varchar(200) [not null]
  unt_type_code       varchar(50)  [not null]   // COMPANY, DEPARTMENT, TEAM, COST_CENTER, etc.
  unt_parent_unt_id   bigint       [null, ref: > org_unit.unt_id]
  unt_effective_from  date         [not null]
  unt_effective_to    date         [null]

  unt_created_at      timestamptz  [not null, default: `now()`]
  unt_created_by      bigint       [null]
  unt_updated_at      timestamptz  [null]
  unt_updated_by      bigint       [null]
  unt_deleted_at      timestamptz  [null]
  unt_deleted_by      bigint       [null]

  indexes {
    (unt_tenant_id)                       [name: 'idx_unt_tenant_id']
    (unt_tenant_id, unt_code)             [name: 'uq_unt_tenant_code', unique]
    (unt_parent_unt_id)                   [name: 'idx_unt_parent_unt_id']
    (unt_tenant_id, unt_type_code)        [name: 'idx_unt_tenant_type']
  }

  Note: 'Org units form a tenant-scoped hierarchy via unt_parent_unt_id.'
}

// Abstract job roles (title, family, level, summary)
Table org_job_role {
  jbr_id           bigint       [pk, increment]
  jbr_tenant_id    bigint       [not null, ref: > sys_tenant.ten_id]

  jbr_code         varchar(50)  [not null]   // unique per tenant
  jbr_name         varchar(200) [not null]
  jbr_family       varchar(100) [null]       // e.g. ENGINEERING, SALES
  jbr_level_band   varchar(50)  [null]       // e.g. L1, L2, SENIOR
  jbr_summary      text         [null]

  jbr_created_at   timestamptz  [not null, default: `now()`]
  jbr_created_by   bigint       [null]
  jbr_updated_at   timestamptz  [null]
  jbr_updated_by   bigint       [null]
  jbr_deleted_at   timestamptz  [null]
  jbr_deleted_by   bigint       [null]

  indexes {
    (jbr_tenant_id)                 [name: 'idx_jbr_tenant_id']
    (jbr_tenant_id, jbr_code)       [name: 'uq_jbr_tenant_code', unique]
    (jbr_tenant_id, jbr_family)     [name: 'idx_jbr_tenant_family']
  }

  Note: 'Canonical job roles reused across positions, perf templates, L&D planning.'
}

// Job requirements per role (experience, qualification band)
Table org_job_requirement {
  jre_id                     bigint      [pk, increment]
  jre_tenant_id              bigint      [not null, ref: > sys_tenant.ten_id]
  jre_jbr_id                 bigint      [not null, ref: > org_job_role.jbr_id]

  jre_min_qual_level_code    varchar(50) [null] // e.g. DEGREE, DIPLOMA
  jre_desired_years_exp      int         [null] // desired total years

  jre_created_at             timestamptz [not null, default: `now()`]
  jre_created_by             bigint      [null]
  jre_updated_at             timestamptz [null]
  jre_updated_by             bigint      [null]
  jre_deleted_at             timestamptz [null]
  jre_deleted_by             bigint      [null]

  indexes {
    (jre_tenant_id)                 [name: 'idx_jre_tenant_id']
    (jre_jbr_id)                    [name: 'idx_jre_jbr_id']
    (jre_tenant_id, jre_jbr_id)     [name: 'uq_jre_role', unique] // enforce 1:1 Role↔Requirement
  }

  Note: 'One requirement row per job role, extended by skills in org_job_skill.'
}

// Skills under a job requirement (normalized, many per requirement)
Table org_job_skill {
  jsk_id            bigint       [pk, increment]
  jsk_tenant_id     bigint       [not null, ref: > sys_tenant.ten_id]
  jsk_jre_id        bigint       [not null, ref: > org_job_requirement.jre_id]

  jsk_skill_code    varchar(100) [not null] // e.g. JAVA, STAKEHOLDER_MGMT
  jsk_level_code    varchar(50)  [null]     // e.g. BASIC, INTERMEDIATE, ADVANCED
  jsk_is_mandatory  boolean      [not null, default: true]

  jsk_created_at    timestamptz  [not null, default: `now()`]
  jsk_created_by    bigint       [null]
  jsk_updated_at    timestamptz  [null]
  jsk_updated_by    bigint       [null]
  jsk_deleted_at    timestamptz  [null]
  jsk_deleted_by    bigint       [null]

  indexes {
    (jsk_tenant_id)                        [name: 'idx_jsk_tenant_id']
    (jsk_jre_id)                           [name: 'idx_jsk_jre_id']
    (jsk_tenant_id, jsk_jre_id, jsk_skill_code) [name: 'uq_jsk_req_skill', unique]
  }

  Note: 'Optional skill-level matrix per requirement; tenant can configure own skill codes.'
}

// Concrete positions/seats linked to OrgUnit & JobRole
Table org_position {
  pos_id                bigint       [pk, increment]
  pos_tenant_id         bigint       [not null, ref: > sys_tenant.ten_id]

  pos_code              varchar(50)  [not null]   // unique per tenant
  pos_title             varchar(200) [not null]   // can override job role title
  pos_unt_id            bigint       [not null, ref: > org_unit.unt_id]
  pos_jbr_id            bigint       [not null, ref: > org_job_role.jbr_id]
  pos_primary_pos_id    bigint       [null, ref: > org_position.pos_id] // reports-to
  pos_secondary_pos_id  bigint       [null, ref: > org_position.pos_id] // dotted line

  pos_effective_from    date         [not null]
  pos_effective_to      date         [null]

  pos_created_at        timestamptz  [not null, default: `now()`]
  pos_created_by        bigint       [null]
  pos_updated_at        timestamptz  [null]
  pos_updated_by        bigint       [null]
  pos_deleted_at        timestamptz  [null]
  pos_deleted_by        bigint       [null]

  indexes {
    (pos_tenant_id)                   [name: 'idx_pos_tenant_id']
    (pos_tenant_id, pos_code)         [name: 'uq_pos_tenant_code', unique]
    (pos_unt_id)                      [name: 'idx_pos_unt_id']
    (pos_jbr_id)                      [name: 'idx_pos_jbr_id']
    (pos_primary_pos_id)              [name: 'idx_pos_primary_pos']
    (pos_secondary_pos_id)            [name: 'idx_pos_secondary_pos']
  }

  Note: 'Positions hold the org hierarchy via primary/secondary reports-to links.'
}

// Employee–Position assignments (with history & primary/secondary type)
Table org_position_assignment {
  pas_id                     bigint       [pk, increment]
  pas_tenant_id              bigint       [not null, ref: > sys_tenant.ten_id]
  pas_emp_id                 bigint       [not null, ref: > pid_employee.emp_id]
  pas_pos_id                 bigint       [not null, ref: > org_position.pos_id]

  pas_assignment_type_code   varchar(50)  [not null] // PRIMARY, SECONDARY, TEMP, etc.
  pas_start_date             date         [not null]
  pas_end_date               date         [null]
  pas_is_current             boolean      [not null, default: true]

  pas_created_at             timestamptz  [not null, default: `now()`]
  pas_created_by             bigint       [null]
  pas_updated_at             timestamptz  [null]
  pas_updated_by             bigint       [null]
  pas_deleted_at             timestamptz  [null]
  pas_deleted_by             bigint       [null]

  indexes {
    (pas_tenant_id)                        [name: 'idx_pas_tenant_id']
    (pas_emp_id)                           [name: 'idx_pas_emp_id']
    (pas_pos_id)                           [name: 'idx_pas_pos_id']
    (pas_tenant_id, pas_emp_id, pas_is_current) [name: 'idx_pas_tenant_emp_current']
    (pas_tenant_id, pas_emp_id, pas_pos_id, pas_start_date) [name: 'idx_pas_emp_pos_start']
  }

  Note: 'Supports multiple concurrent assignments (e.g. primary + secondary) and full history.'
}
```

---

### Foreign Key Relationships (Readable Summary)

| From table                | From column            | To table              | To column | Notes                                     |
| ------------------------- | ---------------------- | --------------------- | --------- | ----------------------------------------- |
| `org_unit`                | `unt_tenant_id`        | `sys_tenant`          | `ten_id`  | Tenant scoping for org units              |
| `org_unit`                | `unt_parent_unt_id`    | `org_unit`            | `unt_id`  | Org unit hierarchy (parent–child)         |
| `org_job_role`            | `jbr_tenant_id`        | `sys_tenant`          | `ten_id`  | Tenant scoping for job roles              |
| `org_job_requirement`     | `jre_tenant_id`        | `sys_tenant`          | `ten_id`  | Tenant scoping for requirements           |
| `org_job_requirement`     | `jre_jbr_id`           | `org_job_role`        | `jbr_id`  | Each requirement belongs to a job role    |
| `org_job_skill`           | `jsk_tenant_id`        | `sys_tenant`          | `ten_id`  | Tenant scoping for skills                 |
| `org_job_skill`           | `jsk_jre_id`           | `org_job_requirement` | `jre_id`  | Skills grouped under a requirement        |
| `org_position`            | `pos_tenant_id`        | `sys_tenant`          | `ten_id`  | Tenant scoping for positions              |
| `org_position`            | `pos_unt_id`           | `org_unit`            | `unt_id`  | Position belongs to an org unit           |
| `org_position`            | `pos_jbr_id`           | `org_job_role`        | `jbr_id`  | Position instantiates a job role          |
| `org_position`            | `pos_primary_pos_id`   | `org_position`        | `pos_id`  | Primary reports-to position               |
| `org_position`            | `pos_secondary_pos_id` | `org_position`        | `pos_id`  | Secondary (dotted-line) reports-to        |
| `org_position_assignment` | `pas_tenant_id`        | `sys_tenant`          | `ten_id`  | Tenant scoping for assignments            |
| `org_position_assignment` | `pas_emp_id`           | `pid_employee`        | `emp_id`  | Employee in People domain                 |
| `org_position_assignment` | `pas_pos_id`           | `org_position`        | `pos_id`  | Assigned position                         |
| `pid_employee` (stub)     | `emp_tenant_id`        | `sys_tenant`          | `ten_id`  | Employee tenant scoping (from PeopleCore) |

---

### Key Design Choices

* **Strict tenant scoping**: All `ORG_*` tables include a `*_tenant_id` FK to `sys_tenant`, with indexes on `(tenant_id)` and `(tenant_id, code)` where there is a natural business key. This keeps cross-tenant isolation clear and supports RLS and fast, tenant-filtered queries.

* **Normalized but pragmatic role & requirement model**: Job roles (`org_job_role`) stay clean and reusable, while requirements (`org_job_requirement`) are in a 1:1 relation to roles (enforced by a unique index on `jre_jbr_id`). Skills are broken out into `org_job_skill` for future-proofing (search/filter by skill) but still kept simple with code fields so you don’t need a full-blown skill registry on day one.

* **Org structure + assignment history ready for reporting**: Org units self-reference for hierarchy, positions link to units and roles, and `org_position_assignment` provides a full audit trail of who sat in which position when, including primary/secondary assignment types. The indexes on `(tenant_id, emp_id, pas_is_current)` and `(tenant_id, emp_id, pos_id, start_date)` are tuned for “current team”, “who reports to whom now”, and “history for this employee/position” queries, which you’ll need heavily for ESS/MSS, performance, and analytics.
