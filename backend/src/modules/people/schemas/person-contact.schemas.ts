/**
 * Person Contact Validation Schemas
 * Zod schemas for person contact validation
 */

import { z } from 'zod';

const contactTypeCodes = z.enum(['EMAIL', 'MOBILE', 'PHONE', 'ADDRESS', 'OTHER']);

const emailSchema = z.string().email();
const phoneSchema = z.string().regex(/^[\d\s\-\+\(\)]+$/);

export const personContactCreateSchema = z.object({
  pcoPerId: z.number().int().positive(),
  pcoContactTypeCode: contactTypeCodes,
  pcoContactValue: z.string().min(1).max(255),
  pcoIsPrimary: z.boolean().default(false),
  pcoLabel: z.string().max(50).optional(),
  pcoCountryCode: z.string().max(10).optional(),
}).refine(
  (data) => {
    if (data.pcoContactTypeCode === 'EMAIL') {
      return emailSchema.safeParse(data.pcoContactValue).success;
    }
    if (data.pcoContactTypeCode === 'MOBILE' || data.pcoContactTypeCode === 'PHONE') {
      return phoneSchema.safeParse(data.pcoContactValue).success;
    }
    return true;
  },
  { message: 'Invalid contact format for the specified contact type' }
);

export const personContactUpdateSchema = z.object({
  pcoContactTypeCode: contactTypeCodes.optional(),
  pcoContactValue: z.string().min(1).max(255).optional(),
  pcoIsPrimary: z.boolean().optional(),
  pcoLabel: z.string().max(50).optional(),
  pcoCountryCode: z.string().max(10).optional(),
});

export type PersonContactCreateInput = z.infer<typeof personContactCreateSchema>;
export type PersonContactUpdateInput = z.infer<typeof personContactUpdateSchema>;
