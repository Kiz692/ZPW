/**
 * Data Verification Helpers
 * Functions to verify data exists in database and counts match expectations
 */

import { db } from "../../core/db/client.js";
import { sql } from "drizzle-orm";
import {
  pidPerson,
  pidEmployee,
  pidEmpContract,
  pidEmpStatusHistory,
} from "../../core/db/schema/people.js";
import { eq, and, isNull } from "drizzle-orm";

/**
 * Get count of persons in database
 */
export async function getPersonCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(pidPerson)
    .where(isNull(pidPerson.perDeletedAt));

  return Number(result[0]?.count || 0);
}

/**
 * Get count of employees for a tenant
 */
export async function getEmployeeCount(tenantId: number): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(pidEmployee)
    .where(
      and(
        eq(pidEmployee.empTenantId, tenantId),
        isNull(pidEmployee.empDeletedAt),
      ),
    );

  return Number(result[0]?.count || 0);
}

/**
 * Get count of contracts for a tenant
 */
export async function getContractCount(tenantId: number): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(pidEmpContract)
    .where(eq(pidEmpContract.ctrTenantId, tenantId));

  return Number(result[0]?.count || 0);
}

/**
 * Get count of status history records for an employee
 */
export async function getStatusHistoryCount(
  employeeId: number,
  tenantId: number,
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(pidEmpStatusHistory)
    .where(
      and(
        eq(pidEmpStatusHistory.eshEmpId, employeeId),
        eq(pidEmpStatusHistory.eshTenantId, tenantId),
      ),
    );

  return Number(result[0]?.count || 0);
}

/**
 * Verify employee exists in database
 */
export async function verifyEmployeeExists(
  employeeId: number,
  tenantId: number,
): Promise<boolean> {
  const result = await db
    .select()
    .from(pidEmployee)
    .where(
      and(
        eq(pidEmployee.empId, employeeId),
        eq(pidEmployee.empTenantId, tenantId),
        isNull(pidEmployee.empDeletedAt),
      ),
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Verify person exists in database
 */
export async function verifyPersonExists(personId: number): Promise<boolean> {
  const result = await db
    .select()
    .from(pidPerson)
    .where(and(eq(pidPerson.perId, personId), isNull(pidPerson.perDeletedAt)))
    .limit(1);

  return result.length > 0;
}

/**
 * Verify contract exists in database
 */
export async function verifyContractExists(
  contractId: number,
  tenantId: number,
): Promise<boolean> {
  const result = await db
    .select()
    .from(pidEmpContract)
    .where(
      and(
        eq(pidEmpContract.ctrId, contractId),
        eq(pidEmpContract.ctrTenantId, tenantId),
      ),
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Verify tenant isolation - employee should NOT exist for different tenant
 */
export async function verifyTenantIsolation(
  employeeId: number,
  correctTenantId: number,
  wrongTenantId: number,
): Promise<{ existsInCorrectTenant: boolean; existsInWrongTenant: boolean }> {
  const [correctResult] = await db
    .select()
    .from(pidEmployee)
    .where(
      and(
        eq(pidEmployee.empId, employeeId),
        eq(pidEmployee.empTenantId, correctTenantId),
        isNull(pidEmployee.empDeletedAt),
      ),
    )
    .limit(1);

  const [wrongResult] = await db
    .select()
    .from(pidEmployee)
    .where(
      and(
        eq(pidEmployee.empId, employeeId),
        eq(pidEmployee.empTenantId, wrongTenantId),
        isNull(pidEmployee.empDeletedAt),
      ),
    )
    .limit(1);

  return {
    existsInCorrectTenant: !!correctResult,
    existsInWrongTenant: !!wrongResult,
  };
}

/**
 * Get employee by ID directly from database
 */
export async function getEmployeeFromDb(employeeId: number, tenantId: number) {
  const [result] = await db
    .select()
    .from(pidEmployee)
    .where(
      and(
        eq(pidEmployee.empId, employeeId),
        eq(pidEmployee.empTenantId, tenantId),
        isNull(pidEmployee.empDeletedAt),
      ),
    )
    .limit(1);

  return result || null;
}

/**
 * Get all status history records for an employee
 */
export async function getStatusHistoryFromDb(
  employeeId: number,
  tenantId: number,
) {
  return await db
    .select()
    .from(pidEmpStatusHistory)
    .where(
      and(
        eq(pidEmpStatusHistory.eshEmpId, employeeId),
        eq(pidEmpStatusHistory.eshTenantId, tenantId),
      ),
    )
    .orderBy(pidEmpStatusHistory.eshEffectiveDate);
}
