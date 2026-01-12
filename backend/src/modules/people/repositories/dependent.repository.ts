/**
 * Dependent Repository
 * Data access layer for PID_DEPENDENT table (tenant-scoped)
 */

import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../../../core/db/client.js';
import { pidDependent } from '../../../core/db/schema/people.js';

export type Dependent = typeof pidDependent.$inferSelect;
export type DependentInsert = typeof pidDependent.$inferInsert;
export type DependentUpdate = Partial<DependentInsert>;

export class DependentRepository {
  async findById(id: number, tenantId: number): Promise<Dependent | null> {
    const [result] = await db
      .select()
      .from(pidDependent)
      .where(
        and(
          eq(pidDependent.depId, id),
          eq(pidDependent.depTenantId, tenantId),
          isNull(pidDependent.depDeletedAt)
        )
      )
      .limit(1);

    return result || null;
  }

  async findByEmployeeId(employeeId: number, tenantId: number): Promise<Dependent[]> {
    return await db
      .select()
      .from(pidDependent)
      .where(
        and(
          eq(pidDependent.depEmpId, employeeId),
          eq(pidDependent.depTenantId, tenantId),
          isNull(pidDependent.depDeletedAt)
        )
      );
  }

  async create(data: DependentInsert, userId?: number): Promise<Dependent> {
    const now = new Date();
    const insertData: DependentInsert = {
      ...data,
      depCreatedAt: now,
      depCreatedBy: userId,
    };

    const [result] = await db.insert(pidDependent).values(insertData).returning();
    return result;
  }

  async update(id: number, data: DependentUpdate, tenantId: number, userId?: number): Promise<Dependent | null> {
    const now = new Date();
    const updateData: DependentUpdate = {
      ...data,
      depUpdatedAt: now,
      depUpdatedBy: userId,
    };

    const [result] = await db
      .update(pidDependent)
      .set(updateData)
      .where(
        and(
          eq(pidDependent.depId, id),
          eq(pidDependent.depTenantId, tenantId),
          isNull(pidDependent.depDeletedAt)
        )
      )
      .returning();

    return result || null;
  }

  async softDelete(id: number, tenantId: number, userId?: number): Promise<boolean> {
    const now = new Date();
    const [result] = await db
      .update(pidDependent)
      .set({
        depDeletedAt: now,
        depDeletedBy: userId,
      })
      .where(
        and(
          eq(pidDependent.depId, id),
          eq(pidDependent.depTenantId, tenantId),
          isNull(pidDependent.depDeletedAt)
        )
      )
      .returning();

    return result !== undefined;
  }
}
