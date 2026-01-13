/**
 * Qualification Validation Schemas
 * Zod schemas for qualification validation
 */

import { z } from "zod";

const qualificationTypeCodes = z.enum([
  "EDUCATION",
  "PROFESSIONAL",
  "CERTIFICATION",
  "OTHER",
]);
const levelCodes = z.enum([
  "DIPLOMA",
  "DEGREE",
  "BACHELORS",
  "MASTERS",
  "DOCTORATE",
  "CERTIFICATE",
  "OTHER",
]);

export const qualificationCreateSchema = z.object({
  qlfPerId: z.number().int().positive(),
  qlfQualificationTypeCode: qualificationTypeCodes,
  qlfInstitution: z.string().max(255).optional(),
  qlfQualificationName: z.string().min(1).max(255),
  qlfLevelCode: levelCodes.optional(),
  qlfCompletionYear: z.number().int().min(1900).max(2100).optional(),
});

export const qualificationUpdateSchema = z.object({
  qlfQualificationTypeCode: qualificationTypeCodes.optional(),
  qlfInstitution: z.string().max(255).optional(),
  qlfQualificationName: z.string().min(1).max(255).optional(),
  qlfLevelCode: levelCodes.optional(),
  qlfCompletionYear: z.number().int().min(1900).max(2100).optional(),
});

export type QualificationCreateInput = z.infer<
  typeof qualificationCreateSchema
>;
export type QualificationUpdateInput = z.infer<
  typeof qualificationUpdateSchema
>;
