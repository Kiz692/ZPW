/**
 * Contract Types
 * TypeScript types for Employment Contract entities
 */

export interface EmploymentContract {
  id: string;
  tenantId: string;
  employeeId: string;
  contractType: string;
  startDate: string;
  endDate?: string;
  probationEndDate?: string;
  standardHoursPerWeek?: number;
  standardDaysPerWeek?: number;
  status: 'DRAFT' | 'ACTIVE' | 'ENDED';
  primaryPositionAssignmentId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateContractRequest {
  employeeId: string;
  contractType: string;
  startDate: string;
  endDate?: string;
  probationEndDate?: string;
  standardHoursPerWeek?: number;
  standardDaysPerWeek?: number;
  status?: 'DRAFT' | 'ACTIVE' | 'ENDED';
  primaryPositionAssignmentId?: string;
}

export interface UpdateContractRequest extends Partial<CreateContractRequest> {}
