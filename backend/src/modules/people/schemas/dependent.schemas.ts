/**
 * Dependent Validation Schemas
 * Zod schemas for dependent validation
 */

import { z } from "zod";

const relationshipCodes = z.enum(["SPOUSE", "CHILD", "PARENT", "OTHER"]);

export const dependentCreateSchema = z.object({
  depTenantId: z.number().int().positive(),
  depEmpId: z.number().int().positive(),
  depName: z.string().max(200).optional(),
  depRelationshipCode: relationshipCodes,
  depDateOfBirth: z.coerce.date().optional(),
  depIncludedInHealthCover: z.boolean().default(false),
  depWellnessEligible: z.boolean().default(false),
});

export const dependentUpdateSchema = z.object({
  depName: z.string().max(200).optional(),
  depRelationshipCode: relationshipCodes.optional(),
  depDateOfBirth: z.coerce.date().optional(),
  depIncludedInHealthCover: z.boolean().optional(),
  depWellnessEligible: z.boolean().optional(),
});

export type DependentCreateInput = z.infer<typeof dependentCreateSchema>;
export type DependentUpdateInput = z.infer<typeof dependentUpdateSchema>;
