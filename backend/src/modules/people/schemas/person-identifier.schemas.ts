/**
 * Person Identifier Validation Schemas
 * Zod schemas for person identifier validation
 */

import { z } from 'zod';

const identifierTypeCodes = z.enum(['NATIONAL_ID', 'PASSPORT', 'TAX_PIN', 'DRIVERS_LICENSE', 'OTHER']);

export const personIdentifierCreateSchema = z.object({
  idnPerId: z.number().int().positive(),
  idnIdentifierTypeCode: identifierTypeCodes,
  idnIdentifierValue: z.string().min(1).max(100),
  idnCountryCode: z.string().max(10).optional(),
  idnValidFrom: z.coerce.date().optional(),
  idnValidTo: z.coerce.date().optional(),
}).refine(
  (data) => !data.idnValidFrom || !data.idnValidTo || data.idnValidFrom <= data.idnValidTo,
  { message: 'Valid from date must be before or equal to valid to date', path: ['idnValidTo'] }
);

export const personIdentifierUpdateSchema = z.object({
  idnIdentifierTypeCode: identifierTypeCodes.optional(),
  idnIdentifierValue: z.string().min(1).max(100).optional(),
  idnCountryCode: z.string().max(10).optional(),
  idnValidFrom: z.coerce.date().optional(),
  idnValidTo: z.coerce.date().optional(),
});

export type PersonIdentifierCreateInput = z.infer<typeof personIdentifierCreateSchema>;
export type PersonIdentifierUpdateInput = z.infer<typeof personIdentifierUpdateSchema>;
