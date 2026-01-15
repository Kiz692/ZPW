/**
 * Person Contact Service
 * Business logic for person contact management
 */

import { PersonContactRepository } from "../repositories/person-contact.repository.js";
import { BaseService } from "./base.service.js";
import { AuditAction, AuditEntityType } from "../../../core/audit/types.js";

export class PersonContactService extends BaseService {
  private contactRepo = new PersonContactRepository();

  async create(
    data: {
      pcoPerId: number;
      pcoContactTypeCode: string;
      pcoContactValue: string;
      pcoIsPrimary?: boolean;
      pcoLabel?: string;
      pcoCountryCode?: string;
    },
    userId?: number,
  ) {
    this.validateRequired(data, [
      "pcoPerId",
      "pcoContactTypeCode",
      "pcoContactValue",
    ]);

    // Validate contact format
    this.validateContactFormat(data.pcoContactTypeCode, data.pcoContactValue);

    // If setting as primary, unset other primary contacts of same type
    if (data.pcoIsPrimary) {
      const existingPrimary = await this.contactRepo.findPrimaryContact(
        data.pcoPerId,
        data.pcoContactTypeCode,
      );
      if (existingPrimary) {
        await this.contactRepo.update(
          existingPrimary.pcoId,
          { pcoIsPrimary: false },
          userId,
        );
      }
    }

    const contact = await this.contactRepo.create(data, userId);

    await this.recordAudit(
      AuditAction.PCO_CREATED,
      AuditEntityType.PERSON_CONTACT,
      contact.pcoId,
      undefined,
      userId,
    );

    return contact;
  }

  async getById(id: number) {
    const contact = await this.contactRepo.findById(id);
    if (!contact) {
      throw new Error(`Contact with ID ${id} not found`);
    }
    return contact;
  }

  async getByPersonId(personId: number) {
    return await this.contactRepo.findByPersonId(personId);
  }

  async update(
    id: number,
    data: {
      pcoContactTypeCode?: string;
      pcoContactValue?: string;
      pcoIsPrimary?: boolean;
      pcoLabel?: string;
      pcoCountryCode?: string;
    },
    userId?: number,
  ) {
    const existing = await this.contactRepo.findById(id);
    if (!existing) {
      throw new Error(`Contact with ID ${id} not found`);
    }

    // Validate contact format if value is being updated
    if (data.pcoContactValue) {
      const contactType =
        data.pcoContactTypeCode || existing.pcoContactTypeCode;
      this.validateContactFormat(contactType, data.pcoContactValue);
    }

    // Handle primary flag change
    if (data.pcoIsPrimary && !existing.pcoIsPrimary) {
      const existingPrimary = await this.contactRepo.findPrimaryContact(
        existing.pcoPerId,
        data.pcoContactTypeCode || existing.pcoContactTypeCode,
      );
      if (existingPrimary && existingPrimary.pcoId !== id) {
        await this.contactRepo.update(
          existingPrimary.pcoId,
          { pcoIsPrimary: false },
          userId,
        );
      }
    }

    const updated = await this.contactRepo.update(id, data, userId);

    await this.recordAudit(
      AuditAction.PCO_UPDATED,
      AuditEntityType.PERSON_CONTACT,
      id,
      undefined,
      userId,
      { changes: data },
    );

    return updated!;
  }

  async delete(id: number, userId?: number) {
    const existing = await this.contactRepo.findById(id);
    if (!existing) {
      throw new Error(`Contact with ID ${id} not found`);
    }

    const deleted = await this.contactRepo.softDelete(id, userId);

    await this.recordAudit(
      AuditAction.PCO_DELETED,
      AuditEntityType.PERSON_CONTACT,
      id,
      undefined,
      userId,
    );

    return deleted;
  }

  private validateContactFormat(type: string, value: string): void {
    if (type === "EMAIL") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error("Invalid email format");
      }
    } else if (type === "MOBILE" || type === "PHONE") {
      // Basic phone validation - can be enhanced
      if (!/^[\d\s\-+()]+$/.test(value)) {
        throw new Error("Invalid phone format");
      }
    }
  }
}
