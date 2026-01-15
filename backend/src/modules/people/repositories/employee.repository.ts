/**
 * Employee Repository
 * Data access layer for PID_EMPLOYEE table (tenant-scoped)
 */

import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../../core/db/client.js";
import { pidEmployee } from "../../../core/db/schema/people.js";

export type Employee = typeof pidEmployee.$inferSelect;
export type EmployeeInsert = typeof pidEmployee.$inferInsert;
export type EmployeeUpdate = Partial<EmployeeInsert>;

export class EmployeeRepository {
  /**
   * Find employee by ID (tenant-scoped)
   */
  async findById(id: number, tenantId: number): Promise<Employee | null> {
    const [result] = await db
      .select()
      .from(pidEmployee)
      .where(
        and(
          eq(pidEmployee.empId, id),
          eq(pidEmployee.empTenantId, tenantId),
          isNull(pidEmployee.empDeletedAt),
        ),
      )
      .limit(1);

    return result || null;
  }

  /**
   * Find employee by person ID and tenant
   */
  async findByPersonId(
    personId: number,
    tenantId: number,
  ): Promise<Employee | null> {
    const [result] = await db
      .select()
      .from(pidEmployee)
      .where(
        and(
          eq(pidEmployee.empPerId, personId),
          eq(pidEmployee.empTenantId, tenantId),
          isNull(pidEmployee.empDeletedAt),
        ),
      )
      .limit(1);

    return result || null;
  }

  /**
   * Find employee by employee number and tenant
   */
  async findByEmployeeNumber(
    employeeNumber: string,
    tenantId: number,
  ): Promise<Employee | null> {
    const [result] = await db
      .select()
      .from(pidEmployee)
      .where(
        and(
          eq(pidEmployee.empEmployeeNumber, employeeNumber),
          eq(pidEmployee.empTenantId, tenantId),
          isNull(pidEmployee.empDeletedAt),
        ),
      )
      .limit(1);

    return result || null;
  }

  /**
   * Find all employees for a tenant
   */
  async findAll(
    tenantId: number,
    limit?: number,
    offset?: number,
  ): Promise<Employee[]> {
    let query = db
      .select()
      .from(pidEmployee)
      .where(
        and(
          eq(pidEmployee.empTenantId, tenantId),
          isNull(pidEmployee.empDeletedAt),
        ),
      );

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.offset(offset);
    }

    return await query;
  }

  /**
   * Create employee
   */
  async create(data: EmployeeInsert, userId?: number): Promise<Employee> {
    const now = new Date();
    const insertData: EmployeeInsert = {
      ...data,
      empCreatedAt: now,
      empCreatedBy: userId,
    };

    const [result] = await db
      .insert(pidEmployee)
      .values(insertData)
      .returning();
    return result;
  }

  /**
   * Update employee
   */
  async update(
    id: number,
    data: EmployeeUpdate,
    tenantId: number,
    userId?: number,
  ): Promise<Employee | null> {
    const now = new Date();
    const updateData: EmployeeUpdate = {
      ...data,
      empUpdatedAt: now,
      empUpdatedBy: userId,
    };

    const [result] = await db
      .update(pidEmployee)
      .set(updateData)
      .where(
        and(
          eq(pidEmployee.empId, id),
          eq(pidEmployee.empTenantId, tenantId),
          isNull(pidEmployee.empDeletedAt),
        ),
      )
      .returning();

    return result || null;
  }

  /**
   * Update employee status
   */
  async updateStatus(
    id: number,
    statusCode: string,
    effectiveDate: Date,
    tenantId: number,
    userId?: number,
  ): Promise<Employee | null> {
    const now = new Date();
    const [result] = await db
      .update(pidEmployee)
      .set({
        empCurrentStatusCode: statusCode,
        empCurrentStatusEffectiveDate: effectiveDate,
        empUpdatedAt: now,
        empUpdatedBy: userId,
      })
      .where(
        and(
          eq(pidEmployee.empId, id),
          eq(pidEmployee.empTenantId, tenantId),
          isNull(pidEmployee.empDeletedAt),
        ),
      )
      .returning();

    return result || null;
  }

  /**
   * Soft delete employee
   */
  async softDelete(
    id: number,
    tenantId: number,
    userId?: number,
  ): Promise<boolean> {
    const now = new Date();
    const [result] = await db
      .update(pidEmployee)
      .set({
        empDeletedAt: now,
        empDeletedBy: userId,
      })
      .where(
        and(
          eq(pidEmployee.empId, id),
          eq(pidEmployee.empTenantId, tenantId),
          isNull(pidEmployee.empDeletedAt),
        ),
      )
      .returning();

    return result !== undefined;
  }
}
