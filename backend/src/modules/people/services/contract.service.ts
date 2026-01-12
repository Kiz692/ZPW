/**
 * Contract Service
 * Business logic for employment contract management
 */

import { ContractRepository } from '../repositories/contract.repository.js';
import { BaseService } from './base.service.js';
import { AuditAction, AuditEntityType } from '../../../core/audit/types.js';

export class ContractService extends BaseService {
  private contractRepo = new ContractRepository();

  async create(
    data: {
      ctrTenantId: number;
      ctrEmpId: number;
      ctrContractTypeCode: string;
      ctrStartDate: Date;
      ctrEndDate?: Date;
      ctrProbationEndDate?: Date;
      ctrStandardHoursPerWeek?: number;
      ctrStandardDaysPerWeek?: number;
      ctrStatusCode: string;
      ctrPrmPasId?: number;
    },
    userId?: number
  ) {
    this.validateRequired(data, ['ctrTenantId', 'ctrEmpId', 'ctrContractTypeCode', 'ctrStartDate', 'ctrStatusCode']);

    // Validate date range
    if (data.ctrEndDate) {
      this.validateDateRange(data.ctrStartDate, data.ctrEndDate);
    }

    // Check for overlapping contracts
    const existingContracts = await this.contractRepo.findByEmployeeId(data.ctrEmpId, data.ctrTenantId);
    for (const contract of existingContracts) {
      if (contract.ctrStatusCode === 'ACTIVE' || contract.ctrStatusCode === 'DRAFT') {
        const contractEnd = contract.ctrEndDate || new Date('9999-12-31');
        if (data.ctrStartDate <= contractEnd && (!data.ctrEndDate || data.ctrEndDate >= contract.ctrStartDate)) {
          throw new Error('Contract dates overlap with existing active or draft contract');
        }
      }
    }

    const contract = await this.contractRepo.create(data, userId);
    
    await this.recordAudit(
      AuditAction.CTR_CREATED,
      AuditEntityType.CONTRACT,
      contract.ctrId,
      data.ctrTenantId,
      userId
    );

    return contract;
  }

  async getById(id: number, tenantId: number) {
    const contract = await this.contractRepo.findById(id, tenantId);
    if (!contract) {
      throw new Error(`Contract with ID ${id} not found`);
    }
    return contract;
  }

  async getByEmployeeId(employeeId: number, tenantId: number) {
    return await this.contractRepo.findByEmployeeId(employeeId, tenantId);
  }

  async getActiveContract(employeeId: number, tenantId: number) {
    return await this.contractRepo.findActiveContract(employeeId, tenantId);
  }

  async update(
    id: number,
    data: {
      ctrContractTypeCode?: string;
      ctrStartDate?: Date;
      ctrEndDate?: Date;
      ctrProbationEndDate?: Date;
      ctrStandardHoursPerWeek?: number;
      ctrStandardDaysPerWeek?: number;
      ctrStatusCode?: string;
      ctrPrmPasId?: number;
    },
    tenantId: number,
    userId?: number
  ) {
    const existing = await this.contractRepo.findById(id, tenantId);
    if (!existing) {
      throw new Error(`Contract with ID ${id} not found`);
    }

    // Validate date range if dates are being updated
    if (data.ctrStartDate || data.ctrEndDate) {
      const startDate = data.ctrStartDate || existing.ctrStartDate;
      const endDate = data.ctrEndDate ?? existing.ctrEndDate;
      if (endDate) {
        this.validateDateRange(startDate, endDate);
      }
    }

    const updated = await this.contractRepo.update(id, data, tenantId, userId);
    
    await this.recordAudit(
      AuditAction.CTR_UPDATED,
      AuditEntityType.CONTRACT,
      id,
      tenantId,
      userId,
      { changes: data }
    );

    return updated!;
  }

  async delete(id: number, tenantId: number, userId?: number) {
    const existing = await this.contractRepo.findById(id, tenantId);
    if (!existing) {
      throw new Error(`Contract with ID ${id} not found`);
    }

    const deleted = await this.contractRepo.softDelete(id, tenantId, userId);
    
    await this.recordAudit(
      AuditAction.CTR_DELETED,
      AuditEntityType.CONTRACT,
      id,
      tenantId,
      userId
    );

    return deleted;
  }
}
