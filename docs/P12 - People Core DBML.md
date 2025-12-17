```dbml
// Domain: People & Identity (People Core)

// --------------------------------------------------------
// System / Shared stubs (for FK references)
// --------------------------------------------------------

Table sys_tenant {
  ten_id        bigint [pk, increment]
  ten_name      varchar(200) [not null]

  Note: 'Tenant table (stub; full definition in System/Shared domain).'
}

// --------------------------------------------------------
// People & Identity tables
// --------------------------------------------------------

// Global person identity (no tenant)
Table pid_person {
  per_id              bigint [pk, increment]
  per_first_name      varchar(100)  [not null]
  per_middle_name     varchar(100)  [null]
  per_last_name       varchar(150)  [not null]
  per_gender_code     varchar(50)   [null] // e.g. M/F/X or configured codes
  per_date_of_birth   date          [null]
  per_nationality_code varchar(10)  [null] // e.g. ISO-3166 alpha-3 or tenant-configured

  per_created_at      timestamptz   [not null, default: `now()`]
  per_created_by      bigint        [null]
  per_updated_at      timestamptz   [null]
  per_updated_by      bigint        [null]
  per_deleted_at      timestamptz   [null]
  per_deleted_by      bigint        [null]

  Note: 'Global person identity shared across tenants/platforms.'
}

// Person contacts (email, phone, address etc.) – global
Table pid_person_contact {
  pco_id            bigint       [pk, increment]
  pco_per_id        bigint       [not null, ref: > pid_person.per_id]
  pco_contact_type_code varchar(50)  [not null] // EMAIL, MOBILE, PHONE, ADDRESS, OTHER
  pco_contact_value varchar(255)    [not null]
  pco_is_primary    boolean      [not null, default: false]
  pco_label         varchar(50)  [null] // e.g. WORK, HOME
  pco_country_code  varchar(10)  [null] // for phone/address context

  pco_created_at    timestamptz  [not null, default: `now()`]
  pco_created_by    bigint       [null]
  pco_updated_at    timestamptz  [null]
  pco_updated_by    bigint       [null]
  pco_deleted_at    timestamptz  [null]
  pco_deleted_by    bigint       [null]

  indexes {
    (pco_per_id) [name: 'idx_pco_per_id']
    (pco_contact_type_code, pco_is_primary) [name: 'idx_pco_type_primary']
  }

  Note: 'Multiple contact methods per person; primary flag per type.'
}

// Official identifiers (National ID, Passport, Tax PIN etc.) – global
Table pid_person_identifier {
  idn_id                    bigint      [pk, increment]
  idn_per_id                bigint      [not null, ref: > pid_person.per_id]
  idn_identifier_type_code  varchar(50) [not null] // NATIONAL_ID, PASSPORT, TAX_PIN, etc.
  idn_identifier_value      varchar(100) [not null]
  idn_country_code          varchar(10) [null]
  idn_valid_from            date        [null]
  idn_valid_to              date        [null]

  idn_created_at            timestamptz [not null, default: `now()`]
  idn_created_by            bigint      [null]
  idn_updated_at            timestamptz [null]
  idn_updated_by            bigint      [null]
  idn_deleted_at            timestamptz [null]
  idn_deleted_by            bigint      [null]

  indexes {
    (idn_per_id) [name: 'idx_idn_per_id']
    (idn_identifier_type_code, idn_identifier_value) [name: 'uq_idn_type_value', unique]
  }

  Note: 'Multiple identifiers per person; type+value pair is globally unique.'
}

// Employee per tenant – tenant-scoped
Table pid_employee {
  emp_id                        bigint      [pk, increment]
  emp_tenant_id                 bigint      [not null, ref: > sys_tenant.ten_id]
  emp_per_id                    bigint      [not null, ref: > pid_person.per_id]
  emp_employee_number           varchar(50) [not null] // tenant-specific employee code
  emp_hire_date                 date        [null]
  emp_employment_type_code      varchar(50) [null] // PERMANENT, FIXED_TERM, CASUAL, INTERN, CONSULTANT
  emp_current_status_code       varchar(50) [null] // PLANNED, ACTIVE, PROBATION, SUSPENDED, EXITED
  emp_current_status_effective_date date    [null]

  emp_created_at                timestamptz [not null, default: `now()`]
  emp_created_by                bigint      [null]
  emp_updated_at                timestamptz [null]
  emp_updated_by                bigint      [null]
  emp_deleted_at                timestamptz [null]
  emp_deleted_by                bigint      [null]

  indexes {
    (emp_tenant_id) [name: 'idx_emp_tenant_id']
    (emp_per_id)    [name: 'idx_emp_per_id']
    (emp_tenant_id, emp_employee_number) [name: 'uq_emp_tenant_number', unique]
  }

  Note: 'Employee record per tenant, linked to global person.'
}

// Employment contract – per employee per tenant
Table pid_emp_contract {
  ctr_id                    bigint       [pk, increment]
  ctr_tenant_id             bigint       [not null, ref: > sys_tenant.ten_id]
  ctr_emp_id                bigint       [not null, ref: > pid_employee.emp_id]
  ctr_contract_type_code    varchar(50)  [not null] // PERMANENT, FIXED_TERM, INTERNSHIP etc.
  ctr_start_date            date         [not null]
  ctr_end_date              date         [null]
  ctr_probation_end_date    date         [null]
  ctr_standard_hours_per_week decimal(5,2) [null]
  ctr_standard_days_per_week  decimal(3,2) [null]
  ctr_status_code           varchar(50)  [not null] // DRAFT, ACTIVE, ENDED etc.
  ctr_prm_pas_id            bigint       [null, ref: > org_position_assignment.pas_id] // primary position assignment (cross-domain)

  ctr_created_at            timestamptz  [not null, default: `now()`]
  ctr_created_by            bigint       [null]
  ctr_updated_at            timestamptz  [null]
  ctr_updated_by            bigint       [null]
  ctr_deleted_at            timestamptz  [null]
  ctr_deleted_by            bigint       [null]

  indexes {
    (ctr_tenant_id) [name: 'idx_ctr_tenant_id']
    (ctr_emp_id)    [name: 'idx_ctr_emp_id']
    (ctr_prm_pas_id) [name: 'idx_ctr_prm_pas_id']
  }

  Note: 'Supports multiple contracts over time per employee; links to primary position assignment.'
}

// Employment status history – per employee per tenant
Table pid_emp_status_history {
  esh_id              bigint       [pk, increment]
  esh_tenant_id       bigint       [not null, ref: > sys_tenant.ten_id]
  esh_emp_id          bigint       [not null, ref: > pid_employee.emp_id]
  esh_status_code     varchar(50)  [not null] // ACTIVE, PROBATION, SUSPENDED, EXITED, etc.
  esh_effective_date  date         [not null]
  esh_reason_code     varchar(50)  [null]
  esh_reason_note     text         [null]

  esh_created_at      timestamptz  [not null, default: `now()`]
  esh_created_by      bigint       [null]
  esh_updated_at      timestamptz  [null]
  esh_updated_by      bigint       [null]
  esh_deleted_at      timestamptz  [null]
  esh_deleted_by      bigint       [null]

  indexes {
    (esh_tenant_id) [name: 'idx_esh_tenant_id']
    (esh_emp_id, esh_effective_date) [name: 'idx_esh_emp_date']
  }

  Note: 'Chronological employment status timeline per employee.'
}

// Dependents – per employee per tenant
Table pid_dependent {
  dep_id                    bigint       [pk, increment]
  dep_tenant_id             bigint       [not null, ref: > sys_tenant.ten_id]
  dep_emp_id                bigint       [not null, ref: > pid_employee.emp_id]
  dep_name                  varchar(200) [null] // may be omitted depending on privacy model
  dep_relationship_code     varchar(50)  [not null] // SPOUSE, CHILD, PARENT, OTHER
  dep_date_of_birth         date         [null]
  dep_included_in_health_cover boolean   [not null, default: false]
  dep_wellness_eligible     boolean      [not null, default: false]

  dep_created_at            timestamptz  [not null, default: `now()`]
  dep_created_by            bigint       [null]
  dep_updated_at            timestamptz  [null]
  dep_updated_by            bigint       [null]
  dep_deleted_at            timestamptz  [null]
  dep_deleted_by            bigint       [null]

  indexes {
    (dep_tenant_id) [name: 'idx_dep_tenant_id']
    (dep_emp_id)    [name: 'idx_dep_emp_id']
  }

  Note: 'Dependents used for wellness and high-level eligibility, not full benefits admin.'
}

// Qualifications – per person (global)
Table pid_qualification {
  qlf_id                    bigint       [pk, increment]
  qlf_per_id                bigint       [not null, ref: > pid_person.per_id]
  qlf_qualification_type_code varchar(50) [not null] // EDUCATION, PROFESSIONAL etc.
  qlf_institution           varchar(255) [null]
  qlf_qualification_name    varchar(255) [not null]
  qlf_level_code            varchar(50)  [null] // DIPLOMA, DEGREE, MASTERS etc.
  qlf_completion_year       int          [null]

  qlf_created_at            timestamptz  [not null, default: `now()`]
  qlf_created_by            bigint       [null]
  qlf_updated_at            timestamptz  [null]
  qlf_updated_by            bigint       [null]
  qlf_deleted_at            timestamptz  [null]
  qlf_deleted_by            bigint       [null]

  indexes {
    (qlf_per_id) [name: 'idx_qlf_per_id']
  }

  Note: 'High-level education & professional qualifications for context in performance & development.'
}

// Prior employment history – per person (global)
Table pid_employment_history {
  peh_id              bigint       [pk, increment]
  peh_per_id          bigint       [not null, ref: > pid_person.per_id]
  peh_employer_name   varchar(255) [not null]
  peh_role_title      varchar(255) [null]
  peh_start_date      date         [null]
  peh_end_date        date         [null]
  peh_summary         text         [null]

  peh_created_at      timestamptz  [not null, default: `now()`]
  peh_created_by      bigint       [null]
  peh_updated_at      timestamptz  [null]
  peh_updated_by      bigint       [null]
  peh_deleted_at      timestamptz  [null]
  peh_deleted_by      bigint       [null]

  indexes {
    (peh_per_id) [name: 'idx_peh_per_id']
  }

  Note: 'Prior employment summaries for contextual use in PeopleWell and performance reviews.'
}

// Wellness profile – per employee per tenant
Table pid_wellness_profile {
  wep_id                  bigint       [pk, increment]
  wep_tenant_id           bigint       [not null, ref: > sys_tenant.ten_id]
  wep_emp_id              bigint       [not null, ref: > pid_employee.emp_id]
  wep_consent_flag        boolean      [not null, default: false]
  wep_preferred_channel_code varchar(50) [null] // EMAIL, SMS, WHATSAPP, APP etc.
  wep_last_zhep_sync_at   timestamptz  [null]

  wep_created_at          timestamptz  [not null, default: `now()`]
  wep_created_by          bigint       [null]
  wep_updated_at          timestamptz  [null]
  wep_updated_by          bigint       [null]
  wep_deleted_at          timestamptz  [null]
  wep_deleted_by          bigint       [null]

  indexes {
    (wep_tenant_id) [name: 'idx_wep_tenant_id']
    (wep_emp_id)    [name: 'uq_wep_emp_id', unique]
  }

  Note: 'Per-employee wellness engagement profile (consent, channels, sync marker).'
}

// Wellness profile tags – per wellness profile per tenant
Table pid_wellness_profile_tag {
  wpt_id              bigint       [pk, increment]
  wpt_tenant_id       bigint       [not null, ref: > sys_tenant.ten_id]
  wpt_wep_id          bigint       [not null, ref: > pid_wellness_profile.wep_id]
  wpt_tag_code        varchar(100) [not null] // arbitrary, opaque engagement tags
  wpt_source_system   varchar(50)  [not null] // e.g. ZHEP, MANUAL
  wpt_first_seen_at   timestamptz  [not null]
  wpt_last_updated_at timestamptz  [not null]
  wpt_is_active       boolean      [not null, default: true]

  wpt_created_at      timestamptz  [not null, default: `now()`]
  wpt_created_by      bigint       [null]
  wpt_updated_at      timestamptz  [null]
  wpt_updated_by      bigint       [null]
  wpt_deleted_at      timestamptz  [null]
  wpt_deleted_by      bigint       [null]

  indexes {
    (wpt_tenant_id) [name: 'idx_wpt_tenant_id']
    (wpt_wep_id)    [name: 'idx_wpt_wep_id']
    (wpt_tenant_id, wpt_wep_id, wpt_tag_code) [name: 'uq_wpt_profile_tag', unique]
  }

  Note: 'Engagement/wellness tags attached to a wellness profile, with history and source.'
}

// --------------------------------------------------------
// Cross-domain stub – Org Position Assignment
// (Full definition lives in Org & Jobs / Work Lattice domain.)
// --------------------------------------------------------

Table org_position_assignment {
  pas_id bigint [pk, increment]

  Note: 'Stub for cross-domain FK from pid_emp_contract. Full definition in Org & Jobs domain.'
}
```

---

### Foreign Key Relationships (Readable Summary)

| From table                 | From column      | To table                  | To column | Notes                                |
| -------------------------- | ---------------- | ------------------------- | --------- | ------------------------------------ |
| `pid_person_contact`       | `pco_per_id`     | `pid_person`              | `per_id`  | Person → PersonContact               |
| `pid_person_identifier`    | `idn_per_id`     | `pid_person`              | `per_id`  | Person → PersonIdentifier            |
| `pid_employee`             | `emp_tenant_id`  | `sys_tenant`              | `ten_id`  | Tenant-scoping                       |
| `pid_employee`             | `emp_per_id`     | `pid_person`              | `per_id`  | Person → Employee                    |
| `pid_emp_contract`         | `ctr_tenant_id`  | `sys_tenant`              | `ten_id`  | Tenant-scoping                       |
| `pid_emp_contract`         | `ctr_emp_id`     | `pid_employee`            | `emp_id`  | Employee → EmploymentContract        |
| `pid_emp_contract`         | `ctr_prm_pas_id` | `org_position_assignment` | `pas_id`  | Cross-domain to Work Lattice         |
| `pid_emp_status_history`   | `esh_tenant_id`  | `sys_tenant`              | `ten_id`  | Tenant-scoping                       |
| `pid_emp_status_history`   | `esh_emp_id`     | `pid_employee`            | `emp_id`  | Employee → StatusHistory             |
| `pid_dependent`            | `dep_tenant_id`  | `sys_tenant`              | `ten_id`  | Tenant-scoping                       |
| `pid_dependent`            | `dep_emp_id`     | `pid_employee`            | `emp_id`  | Employee → Dependent                 |
| `pid_qualification`        | `qlf_per_id`     | `pid_person`              | `per_id`  | Person → Qualification               |
| `pid_employment_history`   | `peh_per_id`     | `pid_person`              | `per_id`  | Person → EmploymentHistory           |
| `pid_wellness_profile`     | `wep_tenant_id`  | `sys_tenant`              | `ten_id`  | Tenant-scoping                       |
| `pid_wellness_profile`     | `wep_emp_id`     | `pid_employee`            | `emp_id`  | Employee → WellnessProfile           |
| `pid_wellness_profile_tag` | `wpt_tenant_id`  | `sys_tenant`              | `ten_id`  | Tenant-scoping                       |
| `pid_wellness_profile_tag` | `wpt_wep_id`     | `pid_wellness_profile`    | `wep_id`  | WellnessProfile → WellnessProfileTag |

---

### Key Design Choices (Short)

* **Global vs tenant-scoped split:** `pid_person`, `pid_person_contact`, `pid_person_identifier`, `pid_qualification` and `pid_employment_history` are global, reflecting a single person identity reused across tenants. All employment-related tables (`pid_employee`, contracts, status history, dependents, wellness profile & tags) are **tenant-scoped** via `*_tenant_id` referencing `sys_tenant`, matching your multi-tenant strategy and simplifying row-level security.

* **Audit & codes:** Every business table includes standard audit columns (`*_created_at`, `*_updated_at`, optional soft delete) so you can layer in governance later without schema churn. Statuses and types are modelled as `*_code` `varchar(50)` fields, leaving you free to implement either per-domain lookup tables or check constraints without changing the core structure.

* **Indexes & uniqueness:** FKs and tenant columns are indexed for typical access patterns, and a few pragmatic uniqueness constraints are added where the domain strongly implies them—for example `(emp_tenant_id, emp_employee_number)` to enforce unique employee numbers per tenant, `(idn_identifier_type_code, idn_identifier_value)` to avoid duplicate official IDs, and `(wpt_tenant_id, wpt_wep_id, wpt_tag_code)` so a tag is not duplicated on the same wellness profile. This keeps the model normalized but still friendly for real-world querying and reporting.
