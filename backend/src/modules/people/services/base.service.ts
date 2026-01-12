/**
 * Base Service
 * Provides common business logic, validation helpers, and audit event recording
 */

import { recordAuditEvent } from '../../../core/audit/audit.service.js';
import { AuditAction, AuditActorType, AuditEntityType } from '../../../core/audit/types.js';

export abstract class BaseService {
  /**
   * Record audit event
   */
  protected async recordAudit(
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: number,
    tenantId?: number,
    userId?: number,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await recordAuditEvent({
      tenantId,
      actorId: userId || 0,
      actorType: AuditActorType.EMPLOYEE,
      action,
      entityType,
      entityId,
      metadata,
    });
  }

  /**
   * Validate required fields
   */
  protected validateRequired<T extends Record<string, unknown>>(
    data: T,
    fields: (keyof T)[]
  ): void {
    const missing = fields.filter((field) => data[field] === undefined || data[field] === null);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Validate date range
   */
  protected validateDateRange(startDate: Date, endDate?: Date): void {
    if (endDate && startDate > endDate) {
      throw new Error('Start date must be before or equal to end date');
    }
  }

  /**
   * Validate unique constraint (throws if exists)
   */
  protected async checkUnique<T>(
    checkFn: () => Promise<T | null>,
    errorMessage: string
  ): Promise<void> {
    const existing = await checkFn();
    if (existing) {
      throw new Error(errorMessage);
    }
  }
}
