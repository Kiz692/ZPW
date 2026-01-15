/**
 * Wellness Profile Types
 * TypeScript types for Wellness Profile entities
 */

export interface WellnessProfile {
  id: string;
  tenantId: string;
  employeeId: string;
  consentFlag: boolean;
  preferredChannel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'APP';
  engagementTags?: string[];
  lastSyncDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateWellnessProfileRequest {
  employeeId: string;
  consentFlag: boolean;
  preferredChannel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'APP';
  engagementTags?: string[];
}

export interface UpdateWellnessProfileRequest extends Partial<CreateWellnessProfileRequest> {}
