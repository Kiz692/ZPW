/**
 * Test Data Factories
 * Generate test data for People Core entities
 */

import type {
  PersonInsert,
  EmployeeInsert,
  ContractInsert,
  PersonContactInsert,
  PersonIdentifierInsert,
  DependentInsert,
  QualificationInsert,
  EmploymentHistoryInsert,
  StatusHistoryInsert,
  WellnessProfileInsert,
  WellnessProfileTagInsert,
} from '../../modules/people/repositories/index.js';

export class TestFactories {
  /**
   * Create test person data
   */
  static createPerson(overrides: Partial<PersonInsert> = {}): PersonInsert {
    return {
      perFirstName: 'John',
      perLastName: 'Doe',
      perMiddleName: 'Middle',
      perDisplayName: 'John Middle Doe',
      perGenderCode: 'MALE',
      perDateOfBirth: new Date('1990-01-01'),
      perNationalityCode: 'KE',
      ...overrides,
    };
  }

  /**
   * Create test employee data
   */
  static createEmployee(
    tenantId: number,
    personId: number,
    overrides: Partial<EmployeeInsert> = {}
  ): EmployeeInsert {
    return {
      empTenantId: tenantId,
      empPerId: personId,
      empEmployeeNumber: `EMP${Date.now()}`,
      empHireDate: new Date('2024-01-01'),
      empEmploymentTypeCode: 'PERMANENT',
      empCurrentStatusCode: 'ACTIVE',
      empCurrentStatusEffectiveDate: new Date('2024-01-01'),
      ...overrides,
    };
  }

  /**
   * Create test contract data
   */
  static createContract(
    tenantId: number,
    employeeId: number,
    overrides: Partial<ContractInsert> = {}
  ): ContractInsert {
    return {
      ctrTenantId: tenantId,
      ctrEmpId: employeeId,
      ctrContractTypeCode: 'PERMANENT',
      ctrStartDate: new Date('2024-01-01'),
      ctrStatusCode: 'ACTIVE',
      ctrStandardHoursPerWeek: 40,
      ctrStandardDaysPerWeek: 5,
      ...overrides,
    };
  }

  /**
   * Create test person contact data
   */
  static createPersonContact(
    personId: number,
    overrides: Partial<PersonContactInsert> = {}
  ): PersonContactInsert {
    return {
      pcoPerId: personId,
      pcoContactTypeCode: 'EMAIL',
      pcoContactValue: `test${Date.now()}@example.com`,
      pcoIsPrimary: true,
      ...overrides,
    };
  }

  /**
   * Create test person identifier data
   */
  static createPersonIdentifier(
    personId: number,
    overrides: Partial<PersonIdentifierInsert> = {}
  ): PersonIdentifierInsert {
    return {
      idnPerId: personId,
      idnIdentifierTypeCode: 'NATIONAL_ID',
      idnIdentifierValue: `ID${Date.now()}`,
      idnCountryCode: 'KE',
      ...overrides,
    };
  }

  /**
   * Create test dependent data
   */
  static createDependent(
    tenantId: number,
    employeeId: number,
    overrides: Partial<DependentInsert> = {}
  ): DependentInsert {
    return {
      depTenantId: tenantId,
      depEmpId: employeeId,
      depName: 'Dependent Name',
      depRelationshipCode: 'CHILD',
      depDateOfBirth: new Date('2010-01-01'),
      depIncludedInHealthCover: true,
      depWellnessEligible: true,
      ...overrides,
    };
  }

  /**
   * Create test qualification data
   */
  static createQualification(
    personId: number,
    overrides: Partial<QualificationInsert> = {}
  ): QualificationInsert {
    return {
      qlfPerId: personId,
      qlfQualificationTypeCode: 'EDUCATION',
      qlfInstitution: 'Test University',
      qlfQualificationName: 'Bachelor of Science',
      qlfLevelCode: 'DEGREE',
      qlfCompletionYear: 2015,
      ...overrides,
    };
  }

  /**
   * Create test employment history data
   */
  static createEmploymentHistory(
    personId: number,
    overrides: Partial<EmploymentHistoryInsert> = {}
  ): EmploymentHistoryInsert {
    return {
      pehPerId: personId,
      pehEmployerName: 'Previous Employer',
      pehRoleTitle: 'Software Engineer',
      pehStartDate: new Date('2020-01-01'),
      pehEndDate: new Date('2023-12-31'),
      pehSummary: 'Worked on various projects',
      ...overrides,
    };
  }

  /**
   * Create test status history data
   */
  static createStatusHistory(
    tenantId: number,
    employeeId: number,
    overrides: Partial<StatusHistoryInsert> = {}
  ): StatusHistoryInsert {
    return {
      eshTenantId: tenantId,
      eshEmpId: employeeId,
      eshStatusCode: 'ACTIVE',
      eshEffectiveDate: new Date('2024-01-01'),
      eshReasonCode: 'HIRED',
      ...overrides,
    };
  }

  /**
   * Create test wellness profile data
   */
  static createWellnessProfile(
    tenantId: number,
    employeeId: number,
    overrides: Partial<WellnessProfileInsert> = {}
  ): WellnessProfileInsert {
    return {
      wepTenantId: tenantId,
      wepEmpId: employeeId,
      wepConsentFlag: true,
      wepPreferredChannelCode: 'EMAIL',
      ...overrides,
    };
  }

  /**
   * Create test wellness profile tag data
   */
  static createWellnessProfileTag(
    tenantId: number,
    wellnessProfileId: number,
    overrides: Partial<WellnessProfileTagInsert> = {}
  ): WellnessProfileTagInsert {
    return {
      wptTenantId: tenantId,
      wptWepId: wellnessProfileId,
      wptTagCode: `TAG${Date.now()}`,
      wptSourceSystem: 'MANUAL',
      wptFirstSeenAt: new Date(),
      wptLastUpdatedAt: new Date(),
      wptIsActive: true,
      ...overrides,
    };
  }

  /**
   * Create test tenant
   */
  static createTenant(name = 'Test Tenant'): { tenId: number; tenName: string } {
    return {
      tenId: 1,
      tenName: name,
    };
  }
}
