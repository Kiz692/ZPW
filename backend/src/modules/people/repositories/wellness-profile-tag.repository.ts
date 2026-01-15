/**
 * Wellness Profile Tag Repository
 * Data access layer for PID_WELLNESS_PROFILE_TAG table (tenant-scoped)
 */

import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../../core/db/client.js";
import { pidWellnessProfileTag } from "../../../core/db/schema/people.js";

export type WellnessProfileTag = typeof pidWellnessProfileTag.$inferSelect;
export type WellnessProfileTagInsert =
  typeof pidWellnessProfileTag.$inferInsert;
export type WellnessProfileTagUpdate = Partial<WellnessProfileTagInsert>;

export class WellnessProfileTagRepository {
  async findById(
    id: number,
    tenantId: number,
  ): Promise<WellnessProfileTag | null> {
    const [result] = await db
      .select()
      .from(pidWellnessProfileTag)
      .where(
        and(
          eq(pidWellnessProfileTag.wptId, id),
          eq(pidWellnessProfileTag.wptTenantId, tenantId),
          isNull(pidWellnessProfileTag.wptDeletedAt),
        ),
      )
      .limit(1);

    return result || null;
  }

  async findByWellnessProfileId(
    wellnessProfileId: number,
    tenantId: number,
  ): Promise<WellnessProfileTag[]> {
    return await db
      .select()
      .from(pidWellnessProfileTag)
      .where(
        and(
          eq(pidWellnessProfileTag.wptWepId, wellnessProfileId),
          eq(pidWellnessProfileTag.wptTenantId, tenantId),
          isNull(pidWellnessProfileTag.wptDeletedAt),
        ),
      );
  }

  async findByTagCode(
    wellnessProfileId: number,
    tagCode: string,
    tenantId: number,
  ): Promise<WellnessProfileTag | null> {
    const [result] = await db
      .select()
      .from(pidWellnessProfileTag)
      .where(
        and(
          eq(pidWellnessProfileTag.wptWepId, wellnessProfileId),
          eq(pidWellnessProfileTag.wptTagCode, tagCode),
          eq(pidWellnessProfileTag.wptTenantId, tenantId),
          isNull(pidWellnessProfileTag.wptDeletedAt),
        ),
      )
      .limit(1);

    return result || null;
  }

  async create(
    data: WellnessProfileTagInsert,
    userId?: number,
  ): Promise<WellnessProfileTag> {
    const now = new Date();
    const insertData: WellnessProfileTagInsert = {
      ...data,
      wptCreatedAt: now,
      wptCreatedBy: userId,
    };

    const [result] = await db
      .insert(pidWellnessProfileTag)
      .values(insertData)
      .returning();
    return result;
  }

  async update(
    id: number,
    data: WellnessProfileTagUpdate,
    tenantId: number,
    userId?: number,
  ): Promise<WellnessProfileTag | null> {
    const now = new Date();
    const updateData: WellnessProfileTagUpdate = {
      ...data,
      wptUpdatedAt: now,
      wptUpdatedBy: userId,
    };

    const [result] = await db
      .update(pidWellnessProfileTag)
      .set(updateData)
      .where(
        and(
          eq(pidWellnessProfileTag.wptId, id),
          eq(pidWellnessProfileTag.wptTenantId, tenantId),
          isNull(pidWellnessProfileTag.wptDeletedAt),
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
      .update(pidWellnessProfileTag)
      .set({
        wptDeletedAt: now,
        wptDeletedBy: userId,
      })
      .where(
        and(
          eq(pidWellnessProfileTag.wptId, id),
          eq(pidWellnessProfileTag.wptTenantId, tenantId),
          isNull(pidWellnessProfileTag.wptDeletedAt),
        ),
      )
      .returning();

    return result !== undefined;
  }
}
