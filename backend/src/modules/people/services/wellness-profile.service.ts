/**
 * Wellness Profile Service
 * Business logic for wellness profile management
 */

import { WellnessProfileRepository } from "../repositories/wellness-profile.repository.js";
import { BaseService } from "./base.service.js";
import { AuditAction, AuditEntityType } from "../../../core/audit/types.js";

export class WellnessProfileService extends BaseService {
  private wellnessProfileRepo = new WellnessProfileRepository();

  /**
   * Create or update wellness profile (upsert pattern)
   */
  async upsert(
    data: {
      wepTenantId: number;
      wepEmpId: number;
      wepConsentFlag?: boolean;
      wepPreferredChannelCode?: string;
      wepLastZhepSyncAt?: Date;
    },
    userId?: number,
  ) {
    this.validateRequired(data, ["wepTenantId", "wepEmpId"]);

    const profile = await this.wellnessProfileRepo.upsertByEmployeeId(
      data,
      data.wepTenantId,
      userId,
    );

    const action =
      profile.wepCreatedAt &&
      new Date(profile.wepCreatedAt).getTime() > Date.now() - 1000
        ? AuditAction.WEP_CREATED
        : AuditAction.WEP_UPDATED;

    await this.recordAudit(
      action,
      AuditEntityType.WELLNESS_PROFILE,
      profile.wepId,
      data.wepTenantId,
      userId,
      { consentFlag: profile.wepConsentFlag },
    );

    return profile;
  }

  /**
   * Get wellness profile by ID
   */
  async getById(id: number, tenantId: number) {
    const profile = await this.wellnessProfileRepo.findById(id, tenantId);
    if (!profile) {
      throw new Error(`Wellness profile with ID ${id} not found`);
    }
    return profile;
  }

  /**
   * Get wellness profile by employee ID
   */
  async getByEmployeeId(employeeId: number, tenantId: number) {
    const profile = await this.wellnessProfileRepo.findByEmployeeId(
      employeeId,
      tenantId,
    );
    if (!profile) {
      throw new Error(`Wellness profile for employee ${employeeId} not found`);
    }
    return profile;
  }

  /**
   * Update wellness profile
   */
  async update(
    id: number,
    data: {
      wepConsentFlag?: boolean;
      wepPreferredChannelCode?: string;
      wepLastZhepSyncAt?: Date;
    },
    tenantId: number,
    userId?: number,
  ) {
    const existing = await this.wellnessProfileRepo.findById(id, tenantId);
    if (!existing) {
      throw new Error(`Wellness profile with ID ${id} not found`);
    }

    // Track consent changes
    const consentChanged =
      data.wepConsentFlag !== undefined &&
      data.wepConsentFlag !== existing.wepConsentFlag;

    const updated = await this.wellnessProfileRepo.update(
      id,
      data,
      tenantId,
      userId,
    );

    await this.recordAudit(
      consentChanged
        ? AuditAction.WEP_CONSENT_CHANGED
        : AuditAction.WEP_UPDATED,
      AuditEntityType.WELLNESS_PROFILE,
      id,
      tenantId,
      userId,
      { changes: data, consentChanged },
    );

    return updated!;
  }

  /**
   * Update consent flag
   */
  async updateConsent(
    id: number,
    consentFlag: boolean,
    tenantId: number,
    userId?: number,
  ) {
    return await this.update(
      id,
      { wepConsentFlag: consentFlag },
      tenantId,
      userId,
    );
  }

  /**
   * Soft delete wellness profile
   */
  async delete(id: number, tenantId: number, userId?: number) {
    const existing = await this.wellnessProfileRepo.findById(id, tenantId);
    if (!existing) {
      throw new Error(`Wellness profile with ID ${id} not found`);
    }

    const deleted = await this.wellnessProfileRepo.softDelete(
      id,
      tenantId,
      userId,
    );

    await this.recordAudit(
      AuditAction.WEP_DELETED,
      AuditEntityType.WELLNESS_PROFILE,
      id,
      tenantId,
      userId,
    );

    return deleted;
  }
}
