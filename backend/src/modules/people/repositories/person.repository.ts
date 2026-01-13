/**
 * Person Repository
 * Data access layer for PID_PERSON table (global entity, no tenant)
 */

import { and, eq, isNull, like, or } from "drizzle-orm";
import { db } from "../../../core/db/client.js";
import { pidPerson } from "../../../core/db/schema/people.js";
import { BaseRepository } from "./base.repository.js";

export type Person = typeof pidPerson.$inferSelect;
export type PersonInsert = typeof pidPerson.$inferInsert;
export type PersonUpdate = Partial<PersonInsert>;

export class PersonRepository extends BaseRepository<
  typeof pidPerson,
  Person,
  PersonInsert,
  PersonUpdate
> {
  constructor() {
    super(pidPerson, "perId", undefined, "perDeletedAt");
  }

  /**
   * Find person by ID (no tenant filtering - global entity)
   */
  async findById(id: number): Promise<Person | null> {
    const [result] = await db
      .select()
      .from(pidPerson)
      .where(and(eq(pidPerson.perId, id), isNull(pidPerson.perDeletedAt)))
      .limit(1);

    return result || null;
  }

  /**
   * Find all persons (no tenant filtering - global entity)
   */
  async findAll(limit?: number, offset?: number): Promise<Person[]> {
    let query = db
      .select()
      .from(pidPerson)
      .where(isNull(pidPerson.perDeletedAt));

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.offset(offset);
    }

    return await query;
  }

  /**
   * Search persons by name
   */
  async searchByName(searchTerm: string, limit = 50): Promise<Person[]> {
    const searchPattern = `%${searchTerm}%`;

    return await db
      .select()
      .from(pidPerson)
      .where(
        and(
          isNull(pidPerson.perDeletedAt),
          or(
            like(pidPerson.perFirstName, searchPattern),
            like(pidPerson.perLastName, searchPattern),
            like(pidPerson.perDisplayName, searchPattern),
          ),
        ),
      )
      .limit(limit);
  }

  /**
   * Create person with auto-generated display name
   */
  async create(data: PersonInsert, userId?: number): Promise<Person> {
    const now = new Date();

    // Auto-generate display name if not provided
    const displayName =
      data.perDisplayName ||
      `${data.perFirstName} ${data.perMiddleName ? data.perMiddleName + " " : ""}${data.perLastName}`.trim();

    const insertData: PersonInsert = {
      ...data,
      perDisplayName: displayName,
      perCreatedAt: now,
      perCreatedBy: userId,
    };

    const [result] = await db.insert(pidPerson).values(insertData).returning();
    return result;
  }

  /**
   * Update person
   */
  async update(
    id: number,
    data: PersonUpdate,
    userId?: number,
  ): Promise<Person | null> {
    const now = new Date();

    // Auto-update display name if name fields changed
    let displayName = data.perDisplayName;
    if (!displayName && (data.perFirstName || data.perLastName)) {
      // Need to fetch current values to build display name
      const current = await this.findById(id);
      if (current) {
        const firstName = data.perFirstName ?? current.perFirstName;
        const middleName = data.perMiddleName ?? current.perMiddleName;
        const lastName = data.perLastName ?? current.perLastName;
        displayName =
          `${firstName} ${middleName ? middleName + " " : ""}${lastName}`.trim();
      }
    }

    const updateData: PersonUpdate = {
      ...data,
      perDisplayName: displayName,
      perUpdatedAt: now,
      perUpdatedBy: userId,
    };

    const [result] = await db
      .update(pidPerson)
      .set(updateData)
      .where(and(eq(pidPerson.perId, id), isNull(pidPerson.perDeletedAt)))
      .returning();

    return result || null;
  }

  /**
   * Soft delete person
   */
  async softDelete(id: number, userId?: number): Promise<boolean> {
    const now = new Date();
    const [result] = await db
      .update(pidPerson)
      .set({
        perDeletedAt: now,
        perDeletedBy: userId,
      })
      .where(and(eq(pidPerson.perId, id), isNull(pidPerson.perDeletedAt)))
      .returning();

    return result !== undefined;
  }
}
