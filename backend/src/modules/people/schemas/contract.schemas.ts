/**
 * Contract Validation Schemas
 * Zod schemas for employment contract validation
 */

import { z } from 'zod';

const contractTypeCodes = z.enum(['PERMANENT', 'FIXED_TERM', 'INTERNSHIP', 'CONSULTANT', 'CASUAL']);
const contractStatusCodes = z.enum(['DRAFT', 'ACTIVE', 'ENDED', 'CANCELLED']);

export const contractCreateSchema = z.object({
  ctrTenantId: z.number().int().positive(),
  ctrEmpId: z.number().int().positive(),
  ctrContractTypeCode: contractTypeCodes,
  ctrStartDate: z.coerce.date(),
  ctrEndDate: z.coerce.date().optional(),
  ctrProbationEndDate: z.coerce.date().optional(),
  ctrStandardHoursPerWeek: z.number().positive().max(168).optional(),
  ctrStandardDaysPerWeek: z.number().positive().max(7).optional(),
  ctrStatusCode: contractStatusCodes,
  ctrPrmPasId: z.number().int().positive().optional(),
}).refine(
  (data) => !data.ctrEndDate || data.ctrStartDate <= data.ctrEndDate,
  { message: 'Start date must be before or equal to end date', path: ['ctrEndDate'] }
);

export const contractUpdateSchema = z.object({
  ctrContractTypeCode: contractTypeCodes.optional(),
  ctrStartDate: z.coerce.date().optional(),
  ctrEndDate: z.coerce.date().optional(),
  ctrProbationEndDate: z.coerce.date().optional(),
  ctrStandardHoursPerWeek: z.number().positive().max(168).optional(),
  ctrStandardDaysPerWeek: z.number().positive().max(7).optional(),
  ctrStatusCode: contractStatusCodes.optional(),
  ctrPrmPasId: z.number().int().positive().optional(),
});

export type ContractCreateInput = z.infer<typeof contractCreateSchema>;
export type ContractUpdateInput = z.infer<typeof contractUpdateSchema>;
