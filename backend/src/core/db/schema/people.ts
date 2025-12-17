import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  boolean,
  date,
  timestamp,
  text,
  decimal,
  integer,
  unique,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';

// ========================================================
// System / Shared stubs (for FK references)
// ========================================================

export const sysTenant = pgTable('sys_tenant', {
  tenId: bigserial('ten_id', { mode: 'number' }).primaryKey(),
  tenName: varchar('ten_name', { length: 200 }).notNull(),
});

// ========================================================
// Global person identity (no tenant)
// ========================================================

export const pidPerson = pgTable(
  'pid_person',
  {
    perId: bigserial('per_id', { mode: 'number' }).primaryKey(),
    perFirstName: varchar('per_first_name', { length: 100 }).notNull(),
    perMiddleName: varchar('per_middle_name', { length: 100 }),
    perLastName: varchar('per_last_name', { length: 150 }).notNull(),
    perDisplayName: varchar('per_display_name', { length: 255 }),
    perGenderCode: varchar('per_gender_code', { length: 50 }),
    perDateOfBirth: date('per_date_of_birth'),
    perNationalityCode: varchar('per_nationality_code', { length: 10 }),

    // Audit columns
    perCreatedAt: timestamp('per_created_at', { withTimezone: true }).notNull().defaultNow(),
    perCreatedBy: bigint('per_created_by', { mode: 'number' }),
    perUpdatedAt: timestamp('per_updated_at', { withTimezone: true }),
    perUpdatedBy: bigint('per_updated_by', { mode: 'number' }),
    perDeletedAt: timestamp('per_deleted_at', { withTimezone: true }),
    perDeletedBy: bigint('per_deleted_by', { mode: 'number' }),
  },
  (table) => ({
    idxPerLastFirst: index('idx_per_last_first').on(table.perLastName, table.perFirstName),
    idxPerDisplayName: index('idx_per_display_name').on(table.perDisplayName),
  })
);

// ========================================================
// Cross-domain stub – Org Position Assignment
// (Full definition lives in Org & Jobs / Work Lattice domain.)
// ========================================================

export const orgPositionAssignment = pgTable('org_position_assignment', {
  pasId: bigserial('pas_id', { mode: 'number' }).primaryKey(),
});

// ========================================================
// Person contacts (email, phone, address etc.) – global
// ========================================================

export const pidPersonContact = pgTable(
  'pid_person_contact',
  {
    pcoId: bigserial('pco_id', { mode: 'number' }).primaryKey(),
    pcoPerId: bigint('pco_per_id', { mode: 'number' }).notNull(),
    pcoContactTypeCode: varchar('pco_contact_type_code', { length: 50 }).notNull(), // EMAIL, MOBILE, PHONE, ADDRESS, OTHER
    pcoContactValue: varchar('pco_contact_value', { length: 255 }).notNull(),
    pcoIsPrimary: boolean('pco_is_primary').notNull().default(false),
    pcoLabel: varchar('pco_label', { length: 50 }),
    pcoCountryCode: varchar('pco_country_code', { length: 10 }),

    // Audit columns
    pcoCreatedAt: timestamp('pco_created_at', { withTimezone: true }).notNull().defaultNow(),
    pcoCreatedBy: bigint('pco_created_by', { mode: 'number' }),
    pcoUpdatedAt: timestamp('pco_updated_at', { withTimezone: true }),
    pcoUpdatedBy: bigint('pco_updated_by', { mode: 'number' }),
    pcoDeletedAt: timestamp('pco_deleted_at', { withTimezone: true }),
    pcoDeletedBy: bigint('pco_deleted_by', { mode: 'number' }),
  },
  (table) => ({
    fkPcoPer: foreignKey({
      columns: [table.pcoPerId],
      foreignColumns: [pidPerson.perId],
    }),
    idxPcoPerId: index('idx_pco_per_id').on(table.pcoPerId),
    idxPcoPersonTypePrimary: index('idx_pco_person_type_primary').on(
      table.pcoPerId,
      table.pcoContactTypeCode,
      table.pcoIsPrimary
    ),
  })
);

// ========================================================
// Official identifiers – global
// ========================================================

export const pidPersonIdentifier = pgTable(
  'pid_person_identifier',
  {
    idnId: bigserial('idn_id', { mode: 'number' }).primaryKey(),
    idnPerId: bigint('idn_per_id', { mode: 'number' }).notNull(),
    idnIdentifierTypeCode: varchar('idn_identifier_type_code', { length: 50 }).notNull(), // NATIONAL_ID, PASSPORT, TAX_PIN, etc.
    idnIdentifierValue: varchar('idn_identifier_value', { length: 100 }).notNull(),
    idnCountryCode: varchar('idn_country_code', { length: 10 }),
    idnValidFrom: date('idn_valid_from'),
    idnValidTo: date('idn_valid_to'),

    // Audit columns
    idnCreatedAt: timestamp('idn_created_at', { withTimezone: true }).notNull().defaultNow(),
    idnCreatedBy: bigint('idn_created_by', { mode: 'number' }),
    idnUpdatedAt: timestamp('idn_updated_at', { withTimezone: true }),
    idnUpdatedBy: bigint('idn_updated_by', { mode: 'number' }),
    idnDeletedAt: timestamp('idn_deleted_at', { withTimezone: true }),
    idnDeletedBy: bigint('idn_deleted_by', { mode: 'number' }),
  },
  (table) => ({
    fkIdnPer: foreignKey({
      columns: [table.idnPerId],
      foreignColumns: [pidPerson.perId],
    }),
    uqIdnTypeCountryValue: unique('uq_idn_type_country_value').on(
      table.idnIdentifierTypeCode,
      table.idnCountryCode,
      table.idnIdentifierValue
    ),
    idxIdnPerId: index('idx_idn_per_id').on(table.idnPerId),
  })
);

// ========================================================
// Employee per tenant – tenant-scoped
// ========================================================

export const pidEmployee = pgTable(
  'pid_employee',
  {
    empId: bigserial('emp_id', { mode: 'number' }).primaryKey(),
    empTenantId: bigint('emp_tenant_id', { mode: 'number' }).notNull(),
    empPerId: bigint('emp_per_id', { mode: 'number' }).notNull(),
    empEmployeeNumber: varchar('emp_employee_number', { length: 50 }).notNull(), // tenant-specific employee code
    empHireDate: date('emp_hire_date'),
    empEmploymentTypeCode: varchar('emp_employment_type_code', { length: 50 }), // PERMANENT, FIXED_TERM, CASUAL, INTERN, CONSULTANT
    empCurrentStatusCode: varchar('emp_current_status_code', { length: 50 }), // PLANNED, ACTIVE, PROBATION, SUSPENDED, EXITED
    empCurrentStatusEffectiveDate: date('emp_current_status_effective_date'),

    // Audit columns
    empCreatedAt: timestamp('emp_created_at', { withTimezone: true }).notNull().defaultNow(),
    empCreatedBy: bigint('emp_created_by', { mode: 'number' }),
    empUpdatedAt: timestamp('emp_updated_at', { withTimezone: true }),
    empUpdatedBy: bigint('emp_updated_by', { mode: 'number' }),
    empDeletedAt: timestamp('emp_deleted_at', { withTimezone: true }),
    empDeletedBy: bigint('emp_deleted_by', { mode: 'number' }),
  },
  (table) => ({
    fkEmpTenant: foreignKey({
      columns: [table.empTenantId],
      foreignColumns: [sysTenant.tenId],
    }),
    fkEmpPerson: foreignKey({
      columns: [table.empPerId],
      foreignColumns: [pidPerson.perId],
    }),
    uqEmpTenantNumber: unique('uq_emp_tenant_number').on(table.empTenantId, table.empEmployeeNumber),
    uqEmpTenantPerson: unique('uq_emp_tenant_person').on(table.empTenantId, table.empPerId),
    idxEmpTenantId: index('idx_emp_tenant_id').on(table.empTenantId),
  })
);

// ========================================================
// Employment contract – per employee per tenant
// ========================================================

export const pidEmpContract = pgTable(
  'pid_emp_contract',
  {
    ctrId: bigserial('ctr_id', { mode: 'number' }).primaryKey(),
    ctrTenantId: bigint('ctr_tenant_id', { mode: 'number' }).notNull(),
    ctrEmpId: bigint('ctr_emp_id', { mode: 'number' }).notNull(),
    ctrContractTypeCode: varchar('ctr_contract_type_code', { length: 50 }).notNull(), // PERMANENT, FIXED_TERM, INTERNSHIP etc.
    ctrStartDate: date('ctr_start_date').notNull(),
    ctrEndDate: date('ctr_end_date'),
    ctrProbationEndDate: date('ctr_probation_end_date'),
    ctrStandardHoursPerWeek: decimal('ctr_standard_hours_per_week', { precision: 5, scale: 2 }),
    ctrStandardDaysPerWeek: decimal('ctr_standard_days_per_week', { precision: 3, scale: 2 }),
    ctrStatusCode: varchar('ctr_status_code', { length: 50 }).notNull(), // DRAFT, ACTIVE, ENDED etc.
    ctrPrmPasId: bigint('ctr_prm_pas_id', { mode: 'number' }), // primary position assignment (cross-domain)

    // Audit columns
    ctrCreatedAt: timestamp('ctr_created_at', { withTimezone: true }).notNull().defaultNow(),
    ctrCreatedBy: bigint('ctr_created_by', { mode: 'number' }),
    ctrUpdatedAt: timestamp('ctr_updated_at', { withTimezone: true }),
    ctrUpdatedBy: bigint('ctr_updated_by', { mode: 'number' }),
    ctrDeletedAt: timestamp('ctr_deleted_at', { withTimezone: true }),
    ctrDeletedBy: bigint('ctr_deleted_by', { mode: 'number' }),
  },
  (table) => ({
    fkCtrTenant: foreignKey({
      columns: [table.ctrTenantId],
      foreignColumns: [sysTenant.tenId],
    }),
    fkCtrEmp: foreignKey({
      columns: [table.ctrEmpId],
      foreignColumns: [pidEmployee.empId],
    }),
    fkCtrPrmPas: foreignKey({
      columns: [table.ctrPrmPasId],
      foreignColumns: [orgPositionAssignment.pasId],
    }),
    idxCtrTenantId: index('idx_ctr_tenant_id').on(table.ctrTenantId),
    idxCtrEmpId: index('idx_ctr_emp_id').on(table.ctrEmpId),
    idxCtrPrmPasId: index('idx_ctr_prm_pas_id').on(table.ctrPrmPasId),
    idxCtrTenantEmpStatus: index('idx_ctr_tenant_emp_status').on(
      table.ctrTenantId,
      table.ctrEmpId,
      table.ctrStatusCode
    ),
  })
);

// ========================================================
// Employment status history – per employee per tenant
// ========================================================

export const pidEmpStatusHistory = pgTable(
  'pid_emp_status_history',
  {
    eshId: bigserial('esh_id', { mode: 'number' }).primaryKey(),
    eshTenantId: bigint('esh_tenant_id', { mode: 'number' }).notNull(),
    eshEmpId: bigint('esh_emp_id', { mode: 'number' }).notNull(),
    eshStatusCode: varchar('esh_status_code', { length: 50 }).notNull(), // ACTIVE, PROBATION, SUSPENDED, EXITED, etc.
    eshEffectiveDate: date('esh_effective_date').notNull(),
    eshReasonCode: varchar('esh_reason_code', { length: 50 }),
    eshReasonNote: text('esh_reason_note'),

    // Audit columns
    eshCreatedAt: timestamp('esh_created_at', { withTimezone: true }).notNull().defaultNow(),
    eshCreatedBy: bigint('esh_created_by', { mode: 'number' }),
    eshUpdatedAt: timestamp('esh_updated_at', { withTimezone: true }),
    eshUpdatedBy: bigint('esh_updated_by', { mode: 'number' }),
    eshDeletedAt: timestamp('esh_deleted_at', { withTimezone: true }),
    eshDeletedBy: bigint('esh_deleted_by', { mode: 'number' }),
  },
  (table) => ({
    fkEshTenant: foreignKey({
      columns: [table.eshTenantId],
      foreignColumns: [sysTenant.tenId],
    }),
    fkEshEmp: foreignKey({
      columns: [table.eshEmpId],
      foreignColumns: [pidEmployee.empId],
    }),
    idxEshTenantId: index('idx_esh_tenant_id').on(table.eshTenantId),
    idxEshTenantEmpDate: index('idx_esh_tenant_emp_date').on(
      table.eshTenantId,
      table.eshEmpId,
      table.eshEffectiveDate
    ),
  })
);

// ========================================================
// Dependents – per employee per tenant
// ========================================================

export const pidDependent = pgTable(
  'pid_dependent',
  {
    depId: bigserial('dep_id', { mode: 'number' }).primaryKey(),
    depTenantId: bigint('dep_tenant_id', { mode: 'number' }).notNull(),
    depEmpId: bigint('dep_emp_id', { mode: 'number' }).notNull(),
    depName: varchar('dep_name', { length: 200 }),
    depRelationshipCode: varchar('dep_relationship_code', { length: 50 }).notNull(), // SPOUSE, CHILD, PARENT, OTHER
    depDateOfBirth: date('dep_date_of_birth'),
    depIncludedInHealthCover: boolean('dep_included_in_health_cover').notNull().default(false),
    depWellnessEligible: boolean('dep_wellness_eligible').notNull().default(false),

    // Audit columns
    depCreatedAt: timestamp('dep_created_at', { withTimezone: true }).notNull().defaultNow(),
    depCreatedBy: bigint('dep_created_by', { mode: 'number' }),
    depUpdatedAt: timestamp('dep_updated_at', { withTimezone: true }),
    depUpdatedBy: bigint('dep_updated_by', { mode: 'number' }),
    depDeletedAt: timestamp('dep_deleted_at', { withTimezone: true }),
    depDeletedBy: bigint('dep_deleted_by', { mode: 'number' }),
  },
  (table) => ({
    fkDepTenant: foreignKey({
      columns: [table.depTenantId],
      foreignColumns: [sysTenant.tenId],
    }),
    fkDepEmp: foreignKey({
      columns: [table.depEmpId],
      foreignColumns: [pidEmployee.empId],
    }),
    idxDepTenantEmp: index('idx_dep_tenant_emp').on(table.depTenantId, table.depEmpId),
  })
);

// ========================================================
// Qualifications – per person (global)
// ========================================================

export const pidQualification = pgTable(
  'pid_qualification',
  {
    qlfId: bigserial('qlf_id', { mode: 'number' }).primaryKey(),
    qlfPerId: bigint('qlf_per_id', { mode: 'number' }).notNull(),
    qlfQualificationTypeCode: varchar('qlf_qualification_type_code', { length: 50 }).notNull(), // EDUCATION, PROFESSIONAL etc.
    qlfInstitution: varchar('qlf_institution', { length: 255 }),
    qlfQualificationName: varchar('qlf_qualification_name', { length: 255 }).notNull(),
    qlfLevelCode: varchar('qlf_level_code', { length: 50 }), // DIPLOMA, DEGREE, MASTERS etc.
    qlfCompletionYear: integer('qlf_completion_year'),

    // Audit columns
    qlfCreatedAt: timestamp('qlf_created_at', { withTimezone: true }).notNull().defaultNow(),
    qlfCreatedBy: bigint('qlf_created_by', { mode: 'number' }),
    qlfUpdatedAt: timestamp('qlf_updated_at', { withTimezone: true }),
    qlfUpdatedBy: bigint('qlf_updated_by', { mode: 'number' }),
    qlfDeletedAt: timestamp('qlf_deleted_at', { withTimezone: true }),
    qlfDeletedBy: bigint('qlf_deleted_by', { mode: 'number' }),
  },
  (table) => ({
    fkQlfPer: foreignKey({
      columns: [table.qlfPerId],
      foreignColumns: [pidPerson.perId],
    }),
    idxQlfPerId: index('idx_qlf_per_id').on(table.qlfPerId),
  })
);

// ========================================================
// Prior employment history – per person (global)
// ========================================================

export const pidEmploymentHistory = pgTable(
  'pid_employment_history',
  {
    pehId: bigserial('peh_id', { mode: 'number' }).primaryKey(),
    pehPerId: bigint('peh_per_id', { mode: 'number' }).notNull(),
    pehEmployerName: varchar('peh_employer_name', { length: 255 }).notNull(),
    pehRoleTitle: varchar('peh_role_title', { length: 255 }),
    pehStartDate: date('peh_start_date'),
    pehEndDate: date('peh_end_date'),
    pehSummary: text('peh_summary'),

    // Audit columns
    pehCreatedAt: timestamp('peh_created_at', { withTimezone: true }).notNull().defaultNow(),
    pehCreatedBy: bigint('peh_created_by', { mode: 'number' }),
    pehUpdatedAt: timestamp('peh_updated_at', { withTimezone: true }),
    pehUpdatedBy: bigint('peh_updated_by', { mode: 'number' }),
    pehDeletedAt: timestamp('peh_deleted_at', { withTimezone: true }),
    pehDeletedBy: bigint('peh_deleted_by', { mode: 'number' }),
  },
  (table) => ({
    fkPehPer: foreignKey({
      columns: [table.pehPerId],
      foreignColumns: [pidPerson.perId],
    }),
    idxPehPerId: index('idx_peh_per_id').on(table.pehPerId),
  })
);

// ========================================================
// Wellness profile – per employee per tenant
// ========================================================

export const pidWellnessProfile = pgTable(
  'pid_wellness_profile',
  {
    wepId: bigserial('wep_id', { mode: 'number' }).primaryKey(),
    wepTenantId: bigint('wep_tenant_id', { mode: 'number' }).notNull(),
    wepEmpId: bigint('wep_emp_id', { mode: 'number' }).notNull(),
    wepConsentFlag: boolean('wep_consent_flag').notNull().default(false),
    wepPreferredChannelCode: varchar('wep_preferred_channel_code', { length: 50 }), // EMAIL, SMS, WHATSAPP, APP etc.
    wepLastZhepSyncAt: timestamp('wep_last_zhep_sync_at', { withTimezone: true }),

    // Audit columns
    wepCreatedAt: timestamp('wep_created_at', { withTimezone: true }).notNull().defaultNow(),
    wepCreatedBy: bigint('wep_created_by', { mode: 'number' }),
    wepUpdatedAt: timestamp('wep_updated_at', { withTimezone: true }),
    wepUpdatedBy: bigint('wep_updated_by', { mode: 'number' }),
    wepDeletedAt: timestamp('wep_deleted_at', { withTimezone: true }),
    wepDeletedBy: bigint('wep_deleted_by', { mode: 'number' }),
  },
  (table) => ({
    fkWepTenant: foreignKey({
      columns: [table.wepTenantId],
      foreignColumns: [sysTenant.tenId],
    }),
    fkWepEmp: foreignKey({
      columns: [table.wepEmpId],
      foreignColumns: [pidEmployee.empId],
    }),
    uqWepEmpId: unique('uq_wep_emp_id').on(table.wepEmpId),
    idxWepTenantId: index('idx_wep_tenant_id').on(table.wepTenantId),
  })
);

// ========================================================
// Wellness profile tags – per wellness profile per tenant
// ========================================================

export const pidWellnessProfileTag = pgTable(
  'pid_wellness_profile_tag',
  {
    wptId: bigserial('wpt_id', { mode: 'number' }).primaryKey(),
    wptTenantId: bigint('wpt_tenant_id', { mode: 'number' }).notNull(),
    wptWepId: bigint('wpt_wep_id', { mode: 'number' }).notNull(),
    wptTagCode: varchar('wpt_tag_code', { length: 100 }).notNull(), // arbitrary, opaque engagement tags
    wptSourceSystem: varchar('wpt_source_system', { length: 50 }).notNull(), // e.g. ZHEP, MANUAL
    wptFirstSeenAt: timestamp('wpt_first_seen_at', { withTimezone: true }).notNull(),
    wptLastUpdatedAt: timestamp('wpt_last_updated_at', { withTimezone: true }).notNull(),
    wptIsActive: boolean('wpt_is_active').notNull().default(true),

    // Audit columns
    wptCreatedAt: timestamp('wpt_created_at', { withTimezone: true }).notNull().defaultNow(),
    wptCreatedBy: bigint('wpt_created_by', { mode: 'number' }),
    wptUpdatedAt: timestamp('wpt_updated_at', { withTimezone: true }),
    wptUpdatedBy: bigint('wpt_updated_by', { mode: 'number' }),
    wptDeletedAt: timestamp('wpt_deleted_at', { withTimezone: true }),
    wptDeletedBy: bigint('wpt_deleted_by', { mode: 'number' }),
  },
  (table) => ({
    fkWptTenant: foreignKey({
      columns: [table.wptTenantId],
      foreignColumns: [sysTenant.tenId],
    }),
    fkWptWep: foreignKey({
      columns: [table.wptWepId],
      foreignColumns: [pidWellnessProfile.wepId],
    }),
    uqWptProfileTag: unique('uq_wpt_profile_tag').on(table.wptTenantId, table.wptWepId, table.wptTagCode),
    idxWptTenantId: index('idx_wpt_tenant_id').on(table.wptTenantId),
    idxWptWepId: index('idx_wpt_wep_id').on(table.wptWepId),
  })
);

