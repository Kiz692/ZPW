/**
 * Person Identifier Service
 * Business logic for person identifier management
 */

import { PersonIdentifierRepository } from "../repositories/person-identifier.repository.js";
import { BaseService } from "./base.service.js";
import { AuditAction, AuditEntityType } from "../../../core/audit/types.js";

export class PersonIdentifierService extends BaseService {
  private identifierRepo = new PersonIdentifierRepository();

  async create(
    data: {
      idnPerId: number;
      idnIdentifierTypeCode: string;
      idnIdentifierValue: string;
      idnCountryCode?: string;
      idnValidFrom?: Date;
      idnValidTo?: Date;
    },
    userId?: number,
  ) {
    this.validateRequired(data, [
      "idnPerId",
      "idnIdentifierTypeCode",
      "idnIdentifierValue",
    ]);

    // Validate date range
    if (data.idnValidFrom && data.idnValidTo) {
      this.validateDateRange(data.idnValidFrom, data.idnValidTo);
    }

    // Check unique constraint
    await this.checkUnique(
      () =>
        this.identifierRepo.findByTypeCountryValue(
          data.idnIdentifierTypeCode,
          data.idnCountryCode || null,
          data.idnIdentifierValue,
        ),
      `Identifier ${data.idnIdentifierTypeCode} with value ${data.idnIdentifierValue} already exists`,
    );

    const identifier = await this.identifierRepo.create(data, userId);

    await this.recordAudit(
      AuditAction.IDN_CREATED,
      AuditEntityType.PERSON_IDENTIFIER,
      identifier.idnId,
      undefined,
      userId,
    );

    return identifier;
  }

  async getById(id: number) {
    const identifier = await this.identifierRepo.findById(id);
    if (!identifier) {
      throw new Error(`Identifier with ID ${id} not found`);
    }
    return identifier;
  }

  async getByPersonId(personId: number) {
    return await this.identifierRepo.findByPersonId(personId);
  }

  async update(
    id: number,
    data: {
      idnIdentifierTypeCode?: string;
      idnIdentifierValue?: string;
      idnCountryCode?: string;
      idnValidFrom?: Date;
      idnValidTo?: Date;
    },
    userId?: number,
  ) {
    const existing = await this.identifierRepo.findById(id);
    if (!existing) {
      throw new Error(`Identifier with ID ${id} not found`);
    }

    // Validate date range
    if (data.idnValidFrom || data.idnValidTo) {
      const validFrom = data.idnValidFrom || existing.idnValidFrom;
      const validTo = data.idnValidTo ?? existing.idnValidTo;
      if (validFrom && validTo) {
        this.validateDateRange(validFrom, validTo);
      }
    }

    // Check unique constraint if identifier value is changing
    if (
      data.idnIdentifierValue ||
      data.idnIdentifierTypeCode ||
      data.idnCountryCode
    ) {
      const typeCode =
        data.idnIdentifierTypeCode || existing.idnIdentifierTypeCode;
      const countryCode =
        data.idnCountryCode !== undefined
          ? data.idnCountryCode
          : existing.idnCountryCode;
      const value = data.idnIdentifierValue || existing.idnIdentifierValue;

      const existingIdentifier =
        await this.identifierRepo.findByTypeCountryValue(
          typeCode,
          countryCode || null,
          value,
        );

      if (existingIdentifier && existingIdentifier.idnId !== id) {
        throw new Error(
          `Identifier ${typeCode} with value ${value} already exists`,
        );
      }
    }

    const updated = await this.identifierRepo.update(id, data, userId);

    await this.recordAudit(
      AuditAction.IDN_UPDATED,
      AuditEntityType.PERSON_IDENTIFIER,
      id,
      undefined,
      userId,
      { changes: data },
    );

    return updated!;
  }

  async delete(id: number, userId?: number) {
    const existing = await this.identifierRepo.findById(id);
    if (!existing) {
      throw new Error(`Identifier with ID ${id} not found`);
    }

    const deleted = await this.identifierRepo.softDelete(id, userId);

    await this.recordAudit(
      AuditAction.IDN_DELETED,
      AuditEntityType.PERSON_IDENTIFIER,
      id,
      undefined,
      userId,
    );

    return deleted;
  }
}
