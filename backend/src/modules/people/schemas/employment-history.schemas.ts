/**
 * Employment History Validation Schemas
 * Zod schemas for employment history validation
 */

import { z } from 'zod';

export const employmentHistoryCreateSchema = z.object({
  pehPerId: z.number().int().positive(),
  pehEmployerName: z.string().min(1).max(255),
  pehRoleTitle: z.string().max(255).optional(),
  pehStartDate: z.coerce.date().optional(),
  pehEndDate: z.coerce.date().optional(),
  pehSummary: z.string().optional(),
}).refine(
  (data) => !data.pehStartDate || !data.pehEndDate || data.pehStartDate <= data.pehEndDate,
  { message: 'Start date must be before or equal to end date', path: ['pehEndDate'] }
);

export const employmentHistoryUpdateSchema = z.object({
  pehEmployerName: z.string().min(1).max(255).optional(),
  pehRoleTitle: z.string().max(255).optional(),
  pehStartDate: z.coerce.date().optional(),
  pehEndDate: z.coerce.date().optional(),
  pehSummary: z.string().optional(),
});

export type EmploymentHistoryCreateInput = z.infer<typeof employmentHistoryCreateSchema>;
export type EmploymentHistoryUpdateInput = z.infer<typeof employmentHistoryUpdateSchema>;
