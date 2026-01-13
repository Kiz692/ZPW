/**
 * Person Validation Schemas
 * Zod schemas for person entity validation
 */

import { z } from "zod";

export const personCreateSchema = z.object({
  perFirstName: z.string().min(1).max(100),
  perMiddleName: z.string().max(100).optional(),
  perLastName: z.string().min(1).max(150),
  perDisplayName: z.string().max(255).optional(),
  perGenderCode: z.string().max(50).optional(),
  perDateOfBirth: z.coerce.date().optional(),
  perNationalityCode: z.string().max(10).optional(),
});

export const personUpdateSchema = personCreateSchema.partial();

export const personQuerySchema = z.object({
  search: z.string().min(2).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

export type PersonCreateInput = z.infer<typeof personCreateSchema>;
export type PersonUpdateInput = z.infer<typeof personUpdateSchema>;
export type PersonQueryInput = z.infer<typeof personQuerySchema>;
