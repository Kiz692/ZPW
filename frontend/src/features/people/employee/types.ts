/**
 * Employee Types
 * TypeScript types for Employee entities
 */

export interface Employee {
  id: string;
  tenantId: string;
  personId: string;
  employeeNumber: string;
  hireDate: string;
  employmentType: string;
  currentStatus: string;
  currentStatusEffectiveDate: string;
  person?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  statusHistory?: EmploymentStatusHistory[];
  createdAt: string;
  updatedAt?: string;
}

export interface EmploymentStatusHistory {
  id: string;
  employeeId: string;
  fromStatus?: string;
  toStatus: string;
  effectiveDate: string;
  reason?: string;
  comments?: string;
  createdAt: string;
}

export interface CreateEmployeeRequest {
  personId: string;
  employeeNumber: string;
  hireDate: string;
  employmentType: string;
  currentStatus?: string;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {}

export interface UpdateEmployeeStatusRequest {
  toStatus: string;
  effectiveDate: string;
  reason?: string;
  comments?: string;
}
