/**
 * Employment History Repository
 * Data access layer for PID_EMPLOYMENT_HISTORY table (global entity)
 */

import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../../../core/db/client.js';
import { pidEmploymentHistory } from '../../../core/db/schema/people.js';

export type EmploymentHistory = typeof pidEmploymentHistory.$inferSelect;
export type EmploymentHistoryInsert = typeof pidEmploymentHistory.$inferInsert;
export type EmploymentHistoryUpdate = Partial<EmploymentHistoryInsert>;

export class EmploymentHistoryRepository {
  async findById(id: number): Promise<EmploymentHistory | null> {
    const [result] = await db
      .select()
      .from(pidEmploymentHistory)
      .where(
        and(
          eq(pidEmploymentHistory.pehId, id),
          isNull(pidEmploymentHistory.pehDeletedAt)
        )
      )
      .limit(1);

    return result || null;
  }

  async findByPersonId(personId: number): Promise<EmploymentHistory[]> {
    return await db
      .select()
      .from(pidEmploymentHistory)
      .where(
        and(
          eq(pidEmploymentHistory.pehPerId, personId),
          isNull(pidEmploymentHistory.pehDeletedAt)
        )
      )
      .orderBy(pidEmploymentHistory.pehStartDate);
  }

  async create(data: EmploymentHistoryInsert, userId?: number): Promise<EmploymentHistory> {
    const now = new Date();
    const insertData: EmploymentHistoryInsert = {
      ...data,
      pehCreatedAt: now,
      pehCreatedBy: userId,
    };

    const [result] = await db.insert(pidEmploymentHistory).values(insertData).returning();
    return result;
  }

  async update(id: number, data: EmploymentHistoryUpdate, userId?: number): Promise<EmploymentHistory | null> {
    const now = new Date();
    const updateData: EmploymentHistoryUpdate = {
      ...data,
      pehUpdatedAt: now,
      pehUpdatedBy: userId,
    };

    const [result] = await db
      .update(pidEmploymentHistory)
      .set(updateData)
      .where(
        and(
          eq(pidEmploymentHistory.pehId, id),
          isNull(pidEmploymentHistory.pehDeletedAt)
        )
      )
      .returning();

    return result || null;
  }

  async softDelete(id: number, userId?: number): Promise<boolean> {
    const now = new Date();
    const [result] = await db
      .update(pidEmploymentHistory)
      .set({
        pehDeletedAt: now,
        pehDeletedBy: userId,
      })
      .where(
        and(
          eq(pidEmploymentHistory.pehId, id),
          isNull(pidEmploymentHistory.pehDeletedAt)
        )
      )
      .returning();

    return result !== undefined;
  }
}
