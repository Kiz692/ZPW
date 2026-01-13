/**
 * Contract Repository
 * Data access layer for PID_EMP_CONTRACT table (tenant-scoped)
 */

import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../../core/db/client.js";
import { pidEmpContract } from "../../../core/db/schema/people.js";

export type Contract = typeof pidEmpContract.$inferSelect;
export type ContractInsert = typeof pidEmpContract.$inferInsert;
export type ContractUpdate = Partial<ContractInsert>;

export class ContractRepository {
  /**
   * Find contract by ID (tenant-scoped)
   */
  async findById(id: number, tenantId: number): Promise<Contract | null> {
    const [result] = await db
      .select()
      .from(pidEmpContract)
      .where(
        and(
          eq(pidEmpContract.ctrId, id),
          eq(pidEmpContract.ctrTenantId, tenantId),
          isNull(pidEmpContract.ctrDeletedAt),
        ),
      )
      .limit(1);

    return result || null;
  }

  /**
   * Find all contracts for an employee
   */
  async findByEmployeeId(
    employeeId: number,
    tenantId: number,
  ): Promise<Contract[]> {
    return await db
      .select()
      .from(pidEmpContract)
      .where(
        and(
          eq(pidEmpContract.ctrEmpId, employeeId),
          eq(pidEmpContract.ctrTenantId, tenantId),
          isNull(pidEmpContract.ctrDeletedAt),
        ),
      )
      .orderBy(pidEmpContract.ctrStartDate);
  }

  /**
   * Find active contract for an employee
   */
  async findActiveContract(
    employeeId: number,
    tenantId: number,
  ): Promise<Contract | null> {
    const [result] = await db
      .select()
      .from(pidEmpContract)
      .where(
        and(
          eq(pidEmpContract.ctrEmpId, employeeId),
          eq(pidEmpContract.ctrTenantId, tenantId),
          eq(pidEmpContract.ctrStatusCode, "ACTIVE"),
          isNull(pidEmpContract.ctrDeletedAt),
        ),
      )
      .limit(1);

    return result || null;
  }

  /**
   * Create contract
   */
  async create(data: ContractInsert, userId?: number): Promise<Contract> {
    const now = new Date();
    const insertData: ContractInsert = {
      ...data,
      ctrCreatedAt: now,
      ctrCreatedBy: userId,
    };

    const [result] = await db
      .insert(pidEmpContract)
      .values(insertData)
      .returning();
    return result;
  }

  /**
   * Update contract
   */
  async update(
    id: number,
    data: ContractUpdate,
    tenantId: number,
    userId?: number,
  ): Promise<Contract | null> {
    const now = new Date();
    const updateData: ContractUpdate = {
      ...data,
      ctrUpdatedAt: now,
      ctrUpdatedBy: userId,
    };

    const [result] = await db
      .update(pidEmpContract)
      .set(updateData)
      .where(
        and(
          eq(pidEmpContract.ctrId, id),
          eq(pidEmpContract.ctrTenantId, tenantId),
          isNull(pidEmpContract.ctrDeletedAt),
        ),
      )
      .returning();

    return result || null;
  }

  /**
   * Soft delete contract
   */
  async softDelete(
    id: number,
    tenantId: number,
    userId?: number,
  ): Promise<boolean> {
    const now = new Date();
    const [result] = await db
      .update(pidEmpContract)
      .set({
        ctrDeletedAt: now,
        ctrDeletedBy: userId,
      })
      .where(
        and(
          eq(pidEmpContract.ctrId, id),
          eq(pidEmpContract.ctrTenantId, tenantId),
          isNull(pidEmpContract.ctrDeletedAt),
        ),
      )
      .returning();

    return result !== undefined;
  }
}
