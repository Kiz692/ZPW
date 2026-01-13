/**
 * Employment History Types
 */

export interface EmploymentHistory {
  id: string;
  personId: string;
  employerName: string;
  roleTitle: string;
  startDate: string;
  endDate?: string;
  summary?: string;
}

export interface CreateEmploymentHistoryRequest {
  personId: string;
  employerName: string;
  roleTitle: string;
  startDate: string;
  endDate?: string;
  summary?: string;
}
