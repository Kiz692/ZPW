/**
 * Status History Repository
 * Data access layer for PID_EMP_STATUS_HISTORY table (tenant-scoped)
 */

import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../../core/db/client.js";
import { pidEmpStatusHistory } from "../../../core/db/schema/people.js";

export type StatusHistory = typeof pidEmpStatusHistory.$inferSelect;
export type StatusHistoryInsert = typeof pidEmpStatusHistory.$inferInsert;
export type StatusHistoryUpdate = Partial<StatusHistoryInsert>;

export class StatusHistoryRepository {
  async findById(id: number, tenantId: number): Promise<StatusHistory | null> {
    const [result] = await db
      .select()
      .from(pidEmpStatusHistory)
      .where(
        and(
          eq(pidEmpStatusHistory.eshId, id),
          eq(pidEmpStatusHistory.eshTenantId, tenantId),
          isNull(pidEmpStatusHistory.eshDeletedAt),
        ),
      )
      .limit(1);

    return result || null;
  }

  async findByEmployeeId(
    employeeId: number,
    tenantId: number,
  ): Promise<StatusHistory[]> {
    return await db
      .select()
      .from(pidEmpStatusHistory)
      .where(
        and(
          eq(pidEmpStatusHistory.eshEmpId, employeeId),
          eq(pidEmpStatusHistory.eshTenantId, tenantId),
          isNull(pidEmpStatusHistory.eshDeletedAt),
        ),
      )
      .orderBy(pidEmpStatusHistory.eshEffectiveDate);
  }

  async create(
    data: StatusHistoryInsert,
    userId?: number,
  ): Promise<StatusHistory> {
    const now = new Date();
    const insertData: StatusHistoryInsert = {
      ...data,
      eshCreatedAt: now,
      eshCreatedBy: userId,
    };

    const [result] = await db
      .insert(pidEmpStatusHistory)
      .values(insertData)
      .returning();
    return result;
  }

  async update(
    id: number,
    data: StatusHistoryUpdate,
    tenantId: number,
    userId?: number,
  ): Promise<StatusHistory | null> {
    const now = new Date();
    const updateData: StatusHistoryUpdate = {
      ...data,
      eshUpdatedAt: now,
      eshUpdatedBy: userId,
    };

    const [result] = await db
      .update(pidEmpStatusHistory)
      .set(updateData)
      .where(
        and(
          eq(pidEmpStatusHistory.eshId, id),
          eq(pidEmpStatusHistory.eshTenantId, tenantId),
          isNull(pidEmpStatusHistory.eshDeletedAt),
        ),
      )
      .returning();

    return result || null;
  }

  async softDelete(
    id: number,
    tenantId: number,
    userId?: number,
  ): Promise<boolean> {
    const now = new Date();
    const [result] = await db
      .update(pidEmpStatusHistory)
      .set({
        eshDeletedAt: now,
        eshDeletedBy: userId,
      })
      .where(
        and(
          eq(pidEmpStatusHistory.eshId, id),
          eq(pidEmpStatusHistory.eshTenantId, tenantId),
          isNull(pidEmpStatusHistory.eshDeletedAt),
        ),
      )
      .returning();

    return result !== undefined;
  }
}
