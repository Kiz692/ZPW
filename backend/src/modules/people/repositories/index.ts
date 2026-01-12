/**
 * People Core Repositories
 * Export all repository classes
 */

export { PersonRepository } from './person.repository.js';
export { EmployeeRepository } from './employee.repository.js';
export { ContractRepository } from './contract.repository.js';
export { PersonContactRepository } from './person-contact.repository.js';
export { PersonIdentifierRepository } from './person-identifier.repository.js';
export { DependentRepository } from './dependent.repository.js';
export { QualificationRepository } from './qualification.repository.js';
export { EmploymentHistoryRepository } from './employment-history.repository.js';
export { StatusHistoryRepository } from './status-history.repository.js';
export { WellnessProfileRepository } from './wellness-profile.repository.js';
export { WellnessProfileTagRepository } from './wellness-profile-tag.repository.js';

export type { Person, PersonInsert, PersonUpdate } from './person.repository.js';
export type { Employee, EmployeeInsert, EmployeeUpdate } from './employee.repository.js';
export type { Contract, ContractInsert, ContractUpdate } from './contract.repository.js';
export type { PersonContact, PersonContactInsert, PersonContactUpdate } from './person-contact.repository.js';
export type { PersonIdentifier, PersonIdentifierInsert, PersonIdentifierUpdate } from './person-identifier.repository.js';
export type { Dependent, DependentInsert, DependentUpdate } from './dependent.repository.js';
export type { Qualification, QualificationInsert, QualificationUpdate } from './qualification.repository.js';
export type { EmploymentHistory, EmploymentHistoryInsert, EmploymentHistoryUpdate } from './employment-history.repository.js';
export type { StatusHistory, StatusHistoryInsert, StatusHistoryUpdate } from './status-history.repository.js';
export type { WellnessProfile, WellnessProfileInsert, WellnessProfileUpdate } from './wellness-profile.repository.js';
export type { WellnessProfileTag, WellnessProfileTagInsert, WellnessProfileTagUpdate } from './wellness-profile-tag.repository.js';
