/**
 * Base Repository
 * Provides common CRUD operations, tenant filtering, and audit field population
 */

import { and, eq, isNull } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { SQL } from 'drizzle-orm';
import { db } from '../../../core/db/client.js';

export interface AuditFields {
  createdAt?: Date;
  createdBy?: number;
  updatedAt?: Date;
  updatedBy?: number;
  deletedAt?: Date | null;
  deletedBy?: number | null;
}

/**
 * Base repository with common operations
 * Generic implementation that works with any Drizzle table
 */
export abstract class BaseRepository<TTable extends PgTable, TEntity, TInsert, TUpdate> {
  constructor(
    protected readonly table: TTable,
    protected readonly idColumn: string,
    protected readonly tenantColumn?: string,
    protected readonly deletedColumn?: string
  ) {}

  /**
   * Create a new entity
   */
  async create(data: TInsert, userId?: number): Promise<TEntity> {
    const now = new Date();
    const insertData = {
      ...data,
      ...this.getAuditFields('create', userId, now),
    } as any;

    const [result] = await db.insert(this.table).values(insertData).returning();
    return result as TEntity;
  }

  /**
   * Find entity by ID
   */
  async findById(id: number, tenantId?: number): Promise<TEntity | null> {
    const conditions = this.buildConditions(id, tenantId);
    const [result] = await db
      .select()
      .from(this.table)
      .where(conditions)
      .limit(1);

    return (result as TEntity) || null;
  }

  /**
   * Find all entities (with tenant filtering if applicable)
   */
  async findAll(tenantId?: number, limit?: number, offset?: number): Promise<TEntity[]> {
    const conditions = this.buildConditions(undefined, tenantId);
    let query = db.select().from(this.table);

    if (conditions) {
      query = query.where(conditions) as any;
    }

    if (limit) {
      query = query.limit(limit) as any;
    }

    if (offset) {
      query = query.offset(offset) as any;
    }

    return (await query) as TEntity[];
  }

  /**
   * Update entity by ID
   */
  async update(id: number, data: TUpdate, tenantId?: number, userId?: number): Promise<TEntity | null> {
    const now = new Date();
    const updateData = {
      ...data,
      ...this.getAuditFields('update', userId, now),
    } as any;

    const conditions = this.buildConditions(id, tenantId);
    const [result] = await db
      .update(this.table)
      .set(updateData)
      .where(conditions)
      .returning();

    return (result as TEntity) || null;
  }

  /**
   * Soft delete entity by ID
   */
  async softDelete(id: number, tenantId?: number, userId?: number): Promise<boolean> {
    if (!this.deletedColumn) {
      throw new Error('Soft delete not supported for this entity');
    }

    const now = new Date();
    const deletedByColumn = this.deletedColumn.replace('DeletedAt', 'DeletedBy');
    const updateData: Record<string, unknown> = {
      [this.deletedColumn]: now,
    };

    // Try to set deletedBy if column exists and userId provided
    try {
      if (userId && (this.table as any)[deletedByColumn]) {
        updateData[deletedByColumn] = userId;
      }
    } catch {
      // Column might not exist, ignore
    }

    const conditions = this.buildConditions(id, tenantId);
    const result = await db
      .update(this.table)
      .set(updateData)
      .where(conditions)
      .returning();

    return result.length > 0;
  }

  /**
   * Build conditions for queries
   */
  protected buildConditions(id?: number, tenantId?: number): SQL {
    const conditions: SQL[] = [];

    if (id) {
      conditions.push(eq((this.table as any)[this.idColumn], id));
    }

    if (tenantId && this.tenantColumn) {
      conditions.push(eq((this.table as any)[this.tenantColumn], tenantId));
    }

    if (this.deletedColumn) {
      conditions.push(isNull((this.table as any)[this.deletedColumn]));
    }

    return conditions.length > 0 ? and(...conditions)! : and();
  }

  /**
   * Get audit fields for create/update operations
   */
  protected getAuditFields(
    operation: 'create' | 'update',
    userId?: number,
    timestamp?: Date
  ): Partial<Record<string, unknown>> {
    const now = timestamp || new Date();
    const fields: Record<string, unknown> = {};

    if (operation === 'create') {
      const createdAtCol = this.getColumn('createdAt');
      const createdByCol = this.getColumn('createdBy');
      if (createdAtCol) fields[createdAtCol] = now;
      if (createdByCol && userId) fields[createdByCol] = userId;
    } else {
      const updatedAtCol = this.getColumn('updatedAt');
      const updatedByCol = this.getColumn('updatedBy');
      if (updatedAtCol) fields[updatedAtCol] = now;
      if (updatedByCol && userId) fields[updatedByCol] = userId;
    }

    return fields;
  }

  /**
   * Get column name from camelCase
   */
  protected getColumn(camelCase: string): string | null {
    // Try to find column in table schema
    const table = this.table as any;
    const columns = table[Symbol.for('drizzle:Columns')] || {};
    
    // Check direct match
    if (columns[camelCase]) {
      return camelCase;
    }

    // Check snake_case version
    const snakeCase = camelCase.replace(/([A-Z])/g, '_$1').toLowerCase();
    for (const [key, value] of Object.entries(columns)) {
      if ((value as any).name === snakeCase) {
        return key;
      }
    }

    return null;
  }
}
