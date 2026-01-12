/**
 * Status History Service
 * Business logic for status history management (read-only, auto-created)
 */

import { StatusHistoryRepository } from '../repositories/status-history.repository.js';
import { BaseService } from './base.service.js';
import { AuditAction, AuditEntityType } from '../../../core/audit/types.js';

export class StatusHistoryService extends BaseService {
  private statusHistoryRepo = new StatusHistoryRepository();

  /**
   * Get status history by ID (read-only)
   */
  async getById(id: number, tenantId: number) {
    const history = await this.statusHistoryRepo.findById(id, tenantId);
    if (!history) {
      throw new Error(`Status history with ID ${id} not found`);
    }
    return history;
  }

  /**
   * Get all status history for an employee
   */
  async getByEmployeeId(employeeId: number, tenantId: number) {
    return await this.statusHistoryRepo.findByEmployeeId(employeeId, tenantId);
  }

  /**
   * Create status history entry (typically called by employee service)
   */
  async create(
    data: {
      eshTenantId: number;
      eshEmpId: number;
      eshStatusCode: string;
      eshEffectiveDate: Date;
      eshReasonCode?: string;
      eshReasonNote?: string;
    },
    userId?: number
  ) {
    this.validateRequired(data, ['eshTenantId', 'eshEmpId', 'eshStatusCode', 'eshEffectiveDate']);

    const history = await this.statusHistoryRepo.create(data, userId);
    
    await this.recordAudit(
      AuditAction.ESH_CREATED,
      AuditEntityType.STATUS_HISTORY,
      history.eshId,
      data.eshTenantId,
      userId
    );

    return history;
  }
}
