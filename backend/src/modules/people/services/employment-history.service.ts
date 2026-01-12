/**
 * Employment History Service
 * Business logic for employment history management
 */

import { EmploymentHistoryRepository } from '../repositories/employment-history.repository.js';
import { BaseService } from './base.service.js';
import { AuditAction, AuditEntityType } from '../../../core/audit/types.js';

export class EmploymentHistoryService extends BaseService {
  private historyRepo = new EmploymentHistoryRepository();

  async create(
    data: {
      pehPerId: number;
      pehEmployerName: string;
      pehRoleTitle?: string;
      pehStartDate?: Date;
      pehEndDate?: Date;
      pehSummary?: string;
    },
    userId?: number
  ) {
    this.validateRequired(data, ['pehPerId', 'pehEmployerName']);

    // Validate date range
    if (data.pehStartDate && data.pehEndDate) {
      this.validateDateRange(data.pehStartDate, data.pehEndDate);
    }

    const history = await this.historyRepo.create(data, userId);
    
    await this.recordAudit(
      AuditAction.PEH_CREATED,
      AuditEntityType.EMPLOYMENT_HISTORY,
      history.pehId,
      undefined,
      userId
    );

    return history;
  }

  async getById(id: number) {
    const history = await this.historyRepo.findById(id);
    if (!history) {
      throw new Error(`Employment history with ID ${id} not found`);
    }
    return history;
  }

  async getByPersonId(personId: number) {
    return await this.historyRepo.findByPersonId(personId);
  }

  async update(
    id: number,
    data: {
      pehEmployerName?: string;
      pehRoleTitle?: string;
      pehStartDate?: Date;
      pehEndDate?: Date;
      pehSummary?: string;
    },
    userId?: number
  ) {
    const existing = await this.historyRepo.findById(id);
    if (!existing) {
      throw new Error(`Employment history with ID ${id} not found`);
    }

    // Validate date range
    if (data.pehStartDate || data.pehEndDate) {
      const startDate = data.pehStartDate || existing.pehStartDate;
      const endDate = data.pehEndDate ?? existing.pehEndDate;
      if (startDate && endDate) {
        this.validateDateRange(startDate, endDate);
      }
    }

    const updated = await this.historyRepo.update(id, data, userId);
    
    await this.recordAudit(
      AuditAction.PEH_UPDATED,
      AuditEntityType.EMPLOYMENT_HISTORY,
      id,
      undefined,
      userId,
      { changes: data }
    );

    return updated!;
  }

  async delete(id: number, userId?: number) {
    const existing = await this.historyRepo.findById(id);
    if (!existing) {
      throw new Error(`Employment history with ID ${id} not found`);
    }

    const deleted = await this.historyRepo.softDelete(id, userId);
    
    await this.recordAudit(
      AuditAction.PEH_DELETED,
      AuditEntityType.EMPLOYMENT_HISTORY,
      id,
      undefined,
      userId
    );

    return deleted;
  }
}
