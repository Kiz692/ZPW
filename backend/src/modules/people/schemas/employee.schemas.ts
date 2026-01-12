/**
 * Employee Validation Schemas
 * Zod schemas for employee entity validation
 */

import { z } from 'zod';

const employmentTypeCodes = z.enum(['PERMANENT', 'FIXED_TERM', 'CASUAL', 'INTERN', 'CONSULTANT']);
const statusCodes = z.enum(['PLANNED', 'ACTIVE', 'PROBATION', 'SUSPENDED', 'EXITED']);

export const employeeCreateSchema = z.object({
  personId: z.number().int().positive().optional(),
  personData: z.object({
    perFirstName: z.string().min(1).max(100),
    perMiddleName: z.string().max(100).optional(),
    perLastName: z.string().min(1).max(150),
    perGenderCode: z.string().max(50).optional(),
    perDateOfBirth: z.coerce.date().optional(),
    perNationalityCode: z.string().max(10).optional(),
  }).optional(),
  empEmployeeNumber: z.string().min(1).max(50),
  empHireDate: z.coerce.date().optional(),
  empEmploymentTypeCode: employmentTypeCodes.optional(),
  empCurrentStatusCode: statusCodes.optional(),
  empCurrentStatusEffectiveDate: z.coerce.date().optional(),
}).refine(
  (data) => data.personId !== undefined || data.personData !== undefined,
  { message: 'Either personId or personData must be provided' }
);

export const employeeUpdateSchema = z.object({
  empEmployeeNumber: z.string().min(1).max(50).optional(),
  empHireDate: z.coerce.date().optional(),
  empEmploymentTypeCode: employmentTypeCodes.optional(),
  empCurrentStatusCode: statusCodes.optional(),
  empCurrentStatusEffectiveDate: z.coerce.date().optional(),
});

export const employeeStatusUpdateSchema = z.object({
  statusCode: statusCodes,
  effectiveDate: z.coerce.date(),
  reasonCode: z.string().max(50).optional(),
  reasonNote: z.string().optional(),
});

export const employeeQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
export type EmployeeStatusUpdateInput = z.infer<typeof employeeStatusUpdateSchema>;
export type EmployeeQueryInput = z.infer<typeof employeeQuerySchema>;
