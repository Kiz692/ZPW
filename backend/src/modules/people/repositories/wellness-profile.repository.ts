/**
 * Wellness Profile Repository
 * Data access layer for PID_WELLNESS_PROFILE table (tenant-scoped)
 */

import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../../core/db/client.js";
import { pidWellnessProfile } from "../../../core/db/schema/people.js";

export type WellnessProfile = typeof pidWellnessProfile.$inferSelect;
export type WellnessProfileInsert = typeof pidWellnessProfile.$inferInsert;
export type WellnessProfileUpdate = Partial<WellnessProfileInsert>;

export class WellnessProfileRepository {
  async findById(
    id: number,
    tenantId: number,
  ): Promise<WellnessProfile | null> {
    const [result] = await db
      .select()
      .from(pidWellnessProfile)
      .where(
        and(
          eq(pidWellnessProfile.wepId, id),
          eq(pidWellnessProfile.wepTenantId, tenantId),
          isNull(pidWellnessProfile.wepDeletedAt),
        ),
      )
      .limit(1);

    return result || null;
  }

  async findByEmployeeId(
    employeeId: number,
    tenantId: number,
  ): Promise<WellnessProfile | null> {
    const [result] = await db
      .select()
      .from(pidWellnessProfile)
      .where(
        and(
          eq(pidWellnessProfile.wepEmpId, employeeId),
          eq(pidWellnessProfile.wepTenantId, tenantId),
          isNull(pidWellnessProfile.wepDeletedAt),
        ),
      )
      .limit(1);

    return result || null;
  }

  async create(
    data: WellnessProfileInsert,
    userId?: number,
  ): Promise<WellnessProfile> {
    const now = new Date();
    const insertData: WellnessProfileInsert = {
      ...data,
      wepCreatedAt: now,
      wepCreatedBy: userId,
    };

    const [result] = await db
      .insert(pidWellnessProfile)
      .values(insertData)
      .returning();
    return result;
  }

  async update(
    id: number,
    data: WellnessProfileUpdate,
    tenantId: number,
    userId?: number,
  ): Promise<WellnessProfile | null> {
    const now = new Date();
    const updateData: WellnessProfileUpdate = {
      ...data,
      wepUpdatedAt: now,
      wepUpdatedBy: userId,
    };

    const [result] = await db
      .update(pidWellnessProfile)
      .set(updateData)
      .where(
        and(
          eq(pidWellnessProfile.wepId, id),
          eq(pidWellnessProfile.wepTenantId, tenantId),
          isNull(pidWellnessProfile.wepDeletedAt),
        ),
      )
      .returning();

    return result || null;
  }

  /**
   * Upsert wellness profile (create or update)
   */
  async upsertByEmployeeId(
    data: WellnessProfileInsert,
    tenantId: number,
    userId?: number,
  ): Promise<WellnessProfile> {
    const existing = await this.findByEmployeeId(data.wepEmpId, tenantId);

    if (existing) {
      const updated = await this.update(existing.wepId, data, tenantId, userId);
      return updated!;
    } else {
      return await this.create({ ...data, wepTenantId: tenantId }, userId);
    }
  }

  async softDelete(
    id: number,
    tenantId: number,
    userId?: number,
  ): Promise<boolean> {
    const now = new Date();
    const [result] = await db
      .update(pidWellnessProfile)
      .set({
        wepDeletedAt: now,
        wepDeletedBy: userId,
      })
      .where(
        and(
          eq(pidWellnessProfile.wepId, id),
          eq(pidWellnessProfile.wepTenantId, tenantId),
          isNull(pidWellnessProfile.wepDeletedAt),
        ),
      )
      .returning();

    return result !== undefined;
  }
}
