/**
 * Wellness Profile Tag Service
 * Business logic for wellness profile tag management
 */

import { WellnessProfileTagRepository } from '../repositories/wellness-profile-tag.repository.js';
import { BaseService } from './base.service.js';
import { AuditAction, AuditEntityType } from '../../../core/audit/types.js';

export class WellnessProfileTagService extends BaseService {
  private tagRepo = new WellnessProfileTagRepository();

  async create(
    data: {
      wptTenantId: number;
      wptWepId: number;
      wptTagCode: string;
      wptSourceSystem: string;
      wptFirstSeenAt: Date;
      wptLastUpdatedAt: Date;
      wptIsActive?: boolean;
    },
    userId?: number
  ) {
    this.validateRequired(data, ['wptTenantId', 'wptWepId', 'wptTagCode', 'wptSourceSystem', 'wptFirstSeenAt', 'wptLastUpdatedAt']);

    // Check unique tag per profile
    await this.checkUnique(
      () => this.tagRepo.findByTagCode(data.wptWepId, data.wptTagCode, data.wptTenantId),
      `Tag ${data.wptTagCode} already exists for this wellness profile`
    );

    const tag = await this.tagRepo.create(data, userId);
    
    await this.recordAudit(
      AuditAction.WPT_CREATED,
      AuditEntityType.WELLNESS_PROFILE_TAG,
      tag.wptId,
      data.wptTenantId,
      userId
    );

    return tag;
  }

  async getById(id: number, tenantId: number) {
    const tag = await this.tagRepo.findById(id, tenantId);
    if (!tag) {
      throw new Error(`Wellness profile tag with ID ${id} not found`);
    }
    return tag;
  }

  async getByWellnessProfileId(wellnessProfileId: number, tenantId: number) {
    return await this.tagRepo.findByWellnessProfileId(wellnessProfileId, tenantId);
  }

  async update(
    id: number,
    data: {
      wptTagCode?: string;
      wptSourceSystem?: string;
      wptLastUpdatedAt?: Date;
      wptIsActive?: boolean;
    },
    tenantId: number,
    userId?: number
  ) {
    const existing = await this.tagRepo.findById(id, tenantId);
    if (!existing) {
      throw new Error(`Wellness profile tag with ID ${id} not found`);
    }

    // Check unique tag if tag code is changing
    if (data.wptTagCode && data.wptTagCode !== existing.wptTagCode) {
      await this.checkUnique(
        () => this.tagRepo.findByTagCode(existing.wptWepId, data.wptTagCode!, tenantId),
        `Tag ${data.wptTagCode} already exists for this wellness profile`
      );
    }

    const updated = await this.tagRepo.update(id, data, tenantId, userId);
    
    await this.recordAudit(
      AuditAction.WPT_UPDATED,
      AuditEntityType.WELLNESS_PROFILE_TAG,
      id,
      tenantId,
      userId,
      { changes: data }
    );

    return updated!;
  }

  async delete(id: number, tenantId: number, userId?: number) {
    const existing = await this.tagRepo.findById(id, tenantId);
    if (!existing) {
      throw new Error(`Wellness profile tag with ID ${id} not found`);
    }

    const deleted = await this.tagRepo.softDelete(id, tenantId, userId);
    
    await this.recordAudit(
      AuditAction.WPT_DELETED,
      AuditEntityType.WELLNESS_PROFILE_TAG,
      id,
      tenantId,
      userId
    );

    return deleted;
  }
}
