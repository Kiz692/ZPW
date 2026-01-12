/**
 * Wellness Profile Validation Schemas
 * Zod schemas for wellness profile validation
 */

import { z } from 'zod';

const channelCodes = z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'APP', 'OTHER']);

export const wellnessProfileUpsertSchema = z.object({
  wepTenantId: z.number().int().positive(),
  wepEmpId: z.number().int().positive(),
  wepConsentFlag: z.boolean().default(false),
  wepPreferredChannelCode: channelCodes.optional(),
  wepLastZhepSyncAt: z.coerce.date().optional(),
});

export const wellnessProfileUpdateSchema = z.object({
  wepConsentFlag: z.boolean().optional(),
  wepPreferredChannelCode: channelCodes.optional(),
  wepLastZhepSyncAt: z.coerce.date().optional(),
});

export const wellnessProfileConsentUpdateSchema = z.object({
  wepConsentFlag: z.boolean(),
});

export type WellnessProfileUpsertInput = z.infer<typeof wellnessProfileUpsertSchema>;
export type WellnessProfileUpdateInput = z.infer<typeof wellnessProfileUpdateSchema>;
export type WellnessProfileConsentUpdateInput = z.infer<typeof wellnessProfileConsentUpdateSchema>;
