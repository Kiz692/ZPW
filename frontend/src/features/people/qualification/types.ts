/**
 * Qualification Types
 */

export interface Qualification {
  id: string;
  personId: string;
  qualificationType: 'EDUCATION' | 'PROFESSIONAL';
  institutionName: string;
  qualificationName: string;
  qualificationLevel: string;
  completionYear: number;
  notes?: string;
}

export interface CreateQualificationRequest {
  personId: string;
  qualificationType: 'EDUCATION' | 'PROFESSIONAL';
  institutionName: string;
  qualificationName: string;
  qualificationLevel: string;
  completionYear: number;
  notes?: string;
}
