/**
 * Wellness Profile Tag Validation Schemas
 * Zod schemas for wellness profile tag validation
 */

import { z } from "zod";

const sourceSystemCodes = z.enum(["ZHEP", "MANUAL", "SYSTEM", "IMPORT"]);

export const wellnessProfileTagCreateSchema = z.object({
  wptTenantId: z.number().int().positive(),
  wptWepId: z.number().int().positive(),
  wptTagCode: z.string().min(1).max(100),
  wptSourceSystem: sourceSystemCodes,
  wptFirstSeenAt: z.coerce.date(),
  wptLastUpdatedAt: z.coerce.date(),
  wptIsActive: z.boolean().default(true),
});

export const wellnessProfileTagUpdateSchema = z.object({
  wptTagCode: z.string().min(1).max(100).optional(),
  wptSourceSystem: sourceSystemCodes.optional(),
  wptLastUpdatedAt: z.coerce.date().optional(),
  wptIsActive: z.boolean().optional(),
});

export type WellnessProfileTagCreateInput = z.infer<
  typeof wellnessProfileTagCreateSchema
>;
export type WellnessProfileTagUpdateInput = z.infer<
  typeof wellnessProfileTagUpdateSchema
>;
