/**
 * Person Identifier Repository
 * Data access layer for PID_PERSON_IDENTIFIER table (global entity)
 */

import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../../core/db/client.js";
import { pidPersonIdentifier } from "../../../core/db/schema/people.js";

export type PersonIdentifier = typeof pidPersonIdentifier.$inferSelect;
export type PersonIdentifierInsert = typeof pidPersonIdentifier.$inferInsert;
export type PersonIdentifierUpdate = Partial<PersonIdentifierInsert>;

export class PersonIdentifierRepository {
  /**
   * Find identifier by ID
   */
  async findById(id: number): Promise<PersonIdentifier | null> {
    const [result] = await db
      .select()
      .from(pidPersonIdentifier)
      .where(
        and(
          eq(pidPersonIdentifier.idnId, id),
          isNull(pidPersonIdentifier.idnDeletedAt),
        ),
      )
      .limit(1);

    return result || null;
  }

  /**
   * Find all identifiers for a person
   */
  async findByPersonId(personId: number): Promise<PersonIdentifier[]> {
    return await db
      .select()
      .from(pidPersonIdentifier)
      .where(
        and(
          eq(pidPersonIdentifier.idnPerId, personId),
          isNull(pidPersonIdentifier.idnDeletedAt),
        ),
      );
  }

  /**
   * Find identifier by type, country, and value
   */
  async findByTypeCountryValue(
    typeCode: string,
    countryCode: string | null,
    value: string,
  ): Promise<PersonIdentifier | null> {
    const conditions = [
      eq(pidPersonIdentifier.idnIdentifierTypeCode, typeCode),
      eq(pidPersonIdentifier.idnIdentifierValue, value),
      isNull(pidPersonIdentifier.idnDeletedAt),
    ];

    if (countryCode) {
      conditions.push(eq(pidPersonIdentifier.idnCountryCode, countryCode));
    } else {
      conditions.push(isNull(pidPersonIdentifier.idnCountryCode));
    }

    const [result] = await db
      .select()
      .from(pidPersonIdentifier)
      .where(and(...conditions))
      .limit(1);

    return result || null;
  }

  /**
   * Create identifier
   */
  async create(
    data: PersonIdentifierInsert,
    userId?: number,
  ): Promise<PersonIdentifier> {
    const now = new Date();
    const insertData: PersonIdentifierInsert = {
      ...data,
      idnCreatedAt: now,
      idnCreatedBy: userId,
    };

    const [result] = await db
      .insert(pidPersonIdentifier)
      .values(insertData)
      .returning();
    return result;
  }

  /**
   * Update identifier
   */
  async update(
    id: number,
    data: PersonIdentifierUpdate,
    userId?: number,
  ): Promise<PersonIdentifier | null> {
    const now = new Date();
    const updateData: PersonIdentifierUpdate = {
      ...data,
      idnUpdatedAt: now,
      idnUpdatedBy: userId,
    };

    const [result] = await db
      .update(pidPersonIdentifier)
      .set(updateData)
      .where(
        and(
          eq(pidPersonIdentifier.idnId, id),
          isNull(pidPersonIdentifier.idnDeletedAt),
        ),
      )
      .returning();

    return result || null;
  }

  /**
   * Soft delete identifier
   */
  async softDelete(id: number, userId?: number): Promise<boolean> {
    const now = new Date();
    const [result] = await db
      .update(pidPersonIdentifier)
      .set({
        idnDeletedAt: now,
        idnDeletedBy: userId,
      })
      .where(
        and(
          eq(pidPersonIdentifier.idnId, id),
          isNull(pidPersonIdentifier.idnDeletedAt),
        ),
      )
      .returning();

    return result !== undefined;
  }
}
