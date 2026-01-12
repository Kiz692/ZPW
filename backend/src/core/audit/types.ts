/**
 * Audit Log Types
 * Defines audit action types and entity types for People Core
 */

export enum AuditActorType {
  EMPLOYEE = 'EMPLOYEE',
  SERVICE = 'SERVICE',
  SYSTEM = 'SYSTEM',
}

export enum AuditEntityType {
  PERSON = 'PERSON',
  EMPLOYEE = 'EMPLOYEE',
  CONTRACT = 'CONTRACT',
  PERSON_CONTACT = 'PERSON_CONTACT',
  PERSON_IDENTIFIER = 'PERSON_IDENTIFIER',
  DEPENDENT = 'DEPENDENT',
  QUALIFICATION = 'QUALIFICATION',
  EMPLOYMENT_HISTORY = 'EMPLOYMENT_HISTORY',
  STATUS_HISTORY = 'STATUS_HISTORY',
  WELLNESS_PROFILE = 'WELLNESS_PROFILE',
  WELLNESS_PROFILE_TAG = 'WELLNESS_PROFILE_TAG',
}

export enum AuditAction {
  // Person actions
  PER_CREATED = 'PER_CREATED',
  PER_UPDATED = 'PER_UPDATED',
  PER_DELETED = 'PER_DELETED',
  
  // Employee actions
  EMP_CREATED = 'EMP_CREATED',
  EMP_UPDATED = 'EMP_UPDATED',
  EMP_DELETED = 'EMP_DELETED',
  EMP_STATUS_CHANGED = 'EMP_STATUS_CHANGED',
  
  // Contract actions
  CTR_CREATED = 'CTR_CREATED',
  CTR_UPDATED = 'CTR_UPDATED',
  CTR_DELETED = 'CTR_DELETED',
  
  // Contact actions
  PCO_CREATED = 'PCO_CREATED',
  PCO_UPDATED = 'PCO_UPDATED',
  PCO_DELETED = 'PCO_DELETED',
  
  // Identifier actions
  IDN_CREATED = 'IDN_CREATED',
  IDN_UPDATED = 'IDN_UPDATED',
  IDN_DELETED = 'IDN_DELETED',
  
  // Dependent actions
  DEP_CREATED = 'DEP_CREATED',
  DEP_UPDATED = 'DEP_UPDATED',
  DEP_DELETED = 'DEP_DELETED',
  
  // Qualification actions
  QLF_CREATED = 'QLF_CREATED',
  QLF_UPDATED = 'QLF_UPDATED',
  QLF_DELETED = 'QLF_DELETED',
  
  // Employment history actions
  PEH_CREATED = 'PEH_CREATED',
  PEH_UPDATED = 'PEH_UPDATED',
  PEH_DELETED = 'PEH_DELETED',
  
  // Status history actions
  ESH_CREATED = 'ESH_CREATED',
  ESH_UPDATED = 'ESH_UPDATED',
  ESH_DELETED = 'ESH_DELETED',
  
  // Wellness profile actions
  WEP_CREATED = 'WEP_CREATED',
  WEP_UPDATED = 'WEP_UPDATED',
  WEP_DELETED = 'WEP_DELETED',
  WEP_CONSENT_CHANGED = 'WEP_CONSENT_CHANGED',
  
  // Wellness profile tag actions
  WPT_CREATED = 'WPT_CREATED',
  WPT_UPDATED = 'WPT_UPDATED',
  WPT_DELETED = 'WPT_DELETED',
}

export interface AuditEvent {
  tenantId?: number;
  actorId: number;
  actorType: AuditActorType;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: number;
  metadata?: Record<string, unknown>;
}
