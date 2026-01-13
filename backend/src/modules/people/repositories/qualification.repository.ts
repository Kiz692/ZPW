/**
 * Qualification Repository
 * Data access layer for PID_QUALIFICATION table (global entity)
 */

import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../../core/db/client.js";
import { pidQualification } from "../../../core/db/schema/people.js";

export type Qualification = typeof pidQualification.$inferSelect;
export type QualificationInsert = typeof pidQualification.$inferInsert;
export type QualificationUpdate = Partial<QualificationInsert>;

export class QualificationRepository {
  async findById(id: number): Promise<Qualification | null> {
    const [result] = await db
      .select()
      .from(pidQualification)
      .where(
        and(
          eq(pidQualification.qlfId, id),
          isNull(pidQualification.qlfDeletedAt),
        ),
      )
      .limit(1);

    return result || null;
  }

  async findByPersonId(personId: number): Promise<Qualification[]> {
    return await db
      .select()
      .from(pidQualification)
      .where(
        and(
          eq(pidQualification.qlfPerId, personId),
          isNull(pidQualification.qlfDeletedAt),
        ),
      );
  }

  async create(
    data: QualificationInsert,
    userId?: number,
  ): Promise<Qualification> {
    const now = new Date();
    const insertData: QualificationInsert = {
      ...data,
      qlfCreatedAt: now,
      qlfCreatedBy: userId,
    };

    const [result] = await db
      .insert(pidQualification)
      .values(insertData)
      .returning();
    return result;
  }

  async update(
    id: number,
    data: QualificationUpdate,
    userId?: number,
  ): Promise<Qualification | null> {
    const now = new Date();
    const updateData: QualificationUpdate = {
      ...data,
      qlfUpdatedAt: now,
      qlfUpdatedBy: userId,
    };

    const [result] = await db
      .update(pidQualification)
      .set(updateData)
      .where(
        and(
          eq(pidQualification.qlfId, id),
          isNull(pidQualification.qlfDeletedAt),
        ),
      )
      .returning();

    return result || null;
  }

  async softDelete(id: number, userId?: number): Promise<boolean> {
    const now = new Date();
    const [result] = await db
      .update(pidQualification)
      .set({
        qlfDeletedAt: now,
        qlfDeletedBy: userId,
      })
      .where(
        and(
          eq(pidQualification.qlfId, id),
          isNull(pidQualification.qlfDeletedAt),
        ),
      )
      .returning();

    return result !== undefined;
  }
}
