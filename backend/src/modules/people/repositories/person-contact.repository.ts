/**
 * Person Contact Repository
 * Data access layer for PID_PERSON_CONTACT table (global entity)
 */

import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../../core/db/client.js";
import { pidPersonContact } from "../../../core/db/schema/people.js";

export type PersonContact = typeof pidPersonContact.$inferSelect;
export type PersonContactInsert = typeof pidPersonContact.$inferInsert;
export type PersonContactUpdate = Partial<PersonContactInsert>;

export class PersonContactRepository {
  /**
   * Find contact by ID
   */
  async findById(id: number): Promise<PersonContact | null> {
    const [result] = await db
      .select()
      .from(pidPersonContact)
      .where(
        and(
          eq(pidPersonContact.pcoId, id),
          isNull(pidPersonContact.pcoDeletedAt),
        ),
      )
      .limit(1);

    return result || null;
  }

  /**
   * Find all contacts for a person
   */
  async findByPersonId(personId: number): Promise<PersonContact[]> {
    return await db
      .select()
      .from(pidPersonContact)
      .where(
        and(
          eq(pidPersonContact.pcoPerId, personId),
          isNull(pidPersonContact.pcoDeletedAt),
        ),
      );
  }

  /**
   * Find primary contact of a specific type for a person
   */
  async findPrimaryContact(
    personId: number,
    contactType: string,
  ): Promise<PersonContact | null> {
    const [result] = await db
      .select()
      .from(pidPersonContact)
      .where(
        and(
          eq(pidPersonContact.pcoPerId, personId),
          eq(pidPersonContact.pcoContactTypeCode, contactType),
          eq(pidPersonContact.pcoIsPrimary, true),
          isNull(pidPersonContact.pcoDeletedAt),
        ),
      )
      .limit(1);

    return result || null;
  }

  /**
   * Create contact
   */
  async create(
    data: PersonContactInsert,
    userId?: number,
  ): Promise<PersonContact> {
    const now = new Date();
    const insertData: PersonContactInsert = {
      ...data,
      pcoCreatedAt: now,
      pcoCreatedBy: userId,
    };

    const [result] = await db
      .insert(pidPersonContact)
      .values(insertData)
      .returning();
    return result;
  }

  /**
   * Update contact
   */
  async update(
    id: number,
    data: PersonContactUpdate,
    userId?: number,
  ): Promise<PersonContact | null> {
    const now = new Date();
    const updateData: PersonContactUpdate = {
      ...data,
      pcoUpdatedAt: now,
      pcoUpdatedBy: userId,
    };

    const [result] = await db
      .update(pidPersonContact)
      .set(updateData)
      .where(
        and(
          eq(pidPersonContact.pcoId, id),
          isNull(pidPersonContact.pcoDeletedAt),
        ),
      )
      .returning();

    return result || null;
  }

  /**
   * Soft delete contact
   */
  async softDelete(id: number, userId?: number): Promise<boolean> {
    const now = new Date();
    const [result] = await db
      .update(pidPersonContact)
      .set({
        pcoDeletedAt: now,
        pcoDeletedBy: userId,
      })
      .where(
        and(
          eq(pidPersonContact.pcoId, id),
          isNull(pidPersonContact.pcoDeletedAt),
        ),
      )
      .returning();

    return result !== undefined;
  }
}
