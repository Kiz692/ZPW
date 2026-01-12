/**
 * Qualification Service
 * Business logic for qualification management
 */

import { QualificationRepository } from '../repositories/qualification.repository.js';
import { BaseService } from './base.service.js';
import { AuditAction, AuditEntityType } from '../../../core/audit/types.js';

export class QualificationService extends BaseService {
  private qualificationRepo = new QualificationRepository();

  async create(
    data: {
      qlfPerId: number;
      qlfQualificationTypeCode: string;
      qlfInstitution?: string;
      qlfQualificationName: string;
      qlfLevelCode?: string;
      qlfCompletionYear?: number;
    },
    userId?: number
  ) {
    this.validateRequired(data, ['qlfPerId', 'qlfQualificationTypeCode', 'qlfQualificationName']);

    const qualification = await this.qualificationRepo.create(data, userId);
    
    await this.recordAudit(
      AuditAction.QLF_CREATED,
      AuditEntityType.QUALIFICATION,
      qualification.qlfId,
      undefined,
      userId
    );

    return qualification;
  }

  async getById(id: number) {
    const qualification = await this.qualificationRepo.findById(id);
    if (!qualification) {
      throw new Error(`Qualification with ID ${id} not found`);
    }
    return qualification;
  }

  async getByPersonId(personId: number) {
    return await this.qualificationRepo.findByPersonId(personId);
  }

  async update(
    id: number,
    data: {
      qlfQualificationTypeCode?: string;
      qlfInstitution?: string;
      qlfQualificationName?: string;
      qlfLevelCode?: string;
      qlfCompletionYear?: number;
    },
    userId?: number
  ) {
    const existing = await this.qualificationRepo.findById(id);
    if (!existing) {
      throw new Error(`Qualification with ID ${id} not found`);
    }

    const updated = await this.qualificationRepo.update(id, data, userId);
    
    await this.recordAudit(
      AuditAction.QLF_UPDATED,
      AuditEntityType.QUALIFICATION,
      id,
      undefined,
      userId,
      { changes: data }
    );

    return updated!;
  }

  async delete(id: number, userId?: number) {
    const existing = await this.qualificationRepo.findById(id);
    if (!existing) {
      throw new Error(`Qualification with ID ${id} not found`);
    }

    const deleted = await this.qualificationRepo.softDelete(id, userId);
    
    await this.recordAudit(
      AuditAction.QLF_DELETED,
      AuditEntityType.QUALIFICATION,
      id,
      undefined,
      userId
    );

    return deleted;
  }
}
