/**
 * Dependent Types
 */

export interface Dependent {
  id: string;
  employeeId: string;
  name?: string;
  relationship: string;
  dateOfBirth: string;
  includedInHealthCover: boolean;
  wellnessEligible: boolean;
}

export interface CreateDependentRequest {
  employeeId: string;
  name?: string;
  relationship: string;
  dateOfBirth: string;
  includedInHealthCover: boolean;
  wellnessEligible: boolean;
}
