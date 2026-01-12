/**
 * Dependent Service
 * Business logic for dependent management
 */

import { DependentRepository } from '../repositories/dependent.repository.js';
import { BaseService } from './base.service.js';
import { AuditAction, AuditEntityType } from '../../../core/audit/types.js';

export class DependentService extends BaseService {
  private dependentRepo = new DependentRepository();

  async create(
    data: {
      depTenantId: number;
      depEmpId: number;
      depName?: string;
      depRelationshipCode: string;
      depDateOfBirth?: Date;
      depIncludedInHealthCover?: boolean;
      depWellnessEligible?: boolean;
    },
    userId?: number
  ) {
    this.validateRequired(data, ['depTenantId', 'depEmpId', 'depRelationshipCode']);

    const dependent = await this.dependentRepo.create(data, userId);
    
    await this.recordAudit(
      AuditAction.DEP_CREATED,
      AuditEntityType.DEPENDENT,
      dependent.depId,
      data.depTenantId,
      userId
    );

    return dependent;
  }

  async getById(id: number, tenantId: number) {
    const dependent = await this.dependentRepo.findById(id, tenantId);
    if (!dependent) {
      throw new Error(`Dependent with ID ${id} not found`);
    }
    return dependent;
  }

  async getByEmployeeId(employeeId: number, tenantId: number) {
    return await this.dependentRepo.findByEmployeeId(employeeId, tenantId);
  }

  async update(
    id: number,
    data: {
      depName?: string;
      depRelationshipCode?: string;
      depDateOfBirth?: Date;
      depIncludedInHealthCover?: boolean;
      depWellnessEligible?: boolean;
    },
    tenantId: number,
    userId?: number
  ) {
    const existing = await this.dependentRepo.findById(id, tenantId);
    if (!existing) {
      throw new Error(`Dependent with ID ${id} not found`);
    }

    const updated = await this.dependentRepo.update(id, data, tenantId, userId);
    
    await this.recordAudit(
      AuditAction.DEP_UPDATED,
      AuditEntityType.DEPENDENT,
      id,
      tenantId,
      userId,
      { changes: data }
    );

    return updated!;
  }

  async delete(id: number, tenantId: number, userId?: number) {
    const existing = await this.dependentRepo.findById(id, tenantId);
    if (!existing) {
      throw new Error(`Dependent with ID ${id} not found`);
    }

    const deleted = await this.dependentRepo.softDelete(id, tenantId, userId);
    
    await this.recordAudit(
      AuditAction.DEP_DELETED,
      AuditEntityType.DEPENDENT,
      id,
      tenantId,
      userId
    );

    return deleted;
  }
}
