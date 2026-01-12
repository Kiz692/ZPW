/**
 * Status History Validation Schemas
 * Zod schemas for status history validation (read-only, auto-created)
 */

import { z } from 'zod';

const statusCodes = z.enum(['PLANNED', 'ACTIVE', 'PROBATION', 'SUSPENDED', 'EXITED']);

export const statusHistoryCreateSchema = z.object({
  eshTenantId: z.number().int().positive(),
  eshEmpId: z.number().int().positive(),
  eshStatusCode: statusCodes,
  eshEffectiveDate: z.coerce.date(),
  eshReasonCode: z.string().max(50).optional(),
  eshReasonNote: z.string().optional(),
});

export const statusHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

export type StatusHistoryCreateInput = z.infer<typeof statusHistoryCreateSchema>;
export type StatusHistoryQueryInput = z.infer<typeof statusHistoryQuerySchema>;
