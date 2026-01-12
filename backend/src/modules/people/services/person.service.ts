/**
 * Person Service
 * Business logic for person management (global entity)
 */

import { PersonRepository } from '../repositories/person.repository.js';
import { BaseService } from './base.service.js';
import { AuditAction, AuditEntityType } from '../../../core/audit/types.js';

export class PersonService extends BaseService {
  private personRepo = new PersonRepository();

  /**
   * Create person with auto-generated display name
   */
  async create(data: {
    perFirstName: string;
    perMiddleName?: string;
    perLastName: string;
    perDisplayName?: string;
    perGenderCode?: string;
    perDateOfBirth?: Date;
    perNationalityCode?: string;
  }, userId?: number) {
    this.validateRequired(data, ['perFirstName', 'perLastName']);

    const person = await this.personRepo.create(data, userId);
    
    await this.recordAudit(
      AuditAction.PER_CREATED,
      AuditEntityType.PERSON,
      person.perId,
      undefined,
      userId,
      { firstName: person.perFirstName, lastName: person.perLastName }
    );

    return person;
  }

  /**
   * Get person by ID
   */
  async getById(id: number) {
    const person = await this.personRepo.findById(id);
    if (!person) {
      throw new Error(`Person with ID ${id} not found`);
    }
    return person;
  }

  /**
   * Search persons by name (global search across tenants)
   */
  async searchByName(searchTerm: string, limit = 50) {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error('Search term must be at least 2 characters');
    }
    return await this.personRepo.searchByName(searchTerm, limit);
  }

  /**
   * List all persons
   */
  async list(limit?: number, offset?: number) {
    return await this.personRepo.findAll(limit, offset);
  }

  /**
   * Update person
   */
  async update(
    id: number,
    data: {
      perFirstName?: string;
      perMiddleName?: string;
      perLastName?: string;
      perDisplayName?: string;
      perGenderCode?: string;
      perDateOfBirth?: Date;
      perNationalityCode?: string;
    },
    userId?: number
  ) {
    const existing = await this.personRepo.findById(id);
    if (!existing) {
      throw new Error(`Person with ID ${id} not found`);
    }

    const updated = await this.personRepo.update(id, data, userId);
    
    await this.recordAudit(
      AuditAction.PER_UPDATED,
      AuditEntityType.PERSON,
      id,
      undefined,
      userId,
      { changes: data }
    );

    return updated!;
  }

  /**
   * Soft delete person
   */
  async delete(id: number, userId?: number) {
    const existing = await this.personRepo.findById(id);
    if (!existing) {
      throw new Error(`Person with ID ${id} not found`);
    }

    const deleted = await this.personRepo.softDelete(id, userId);
    
    await this.recordAudit(
      AuditAction.PER_DELETED,
      AuditEntityType.PERSON,
      id,
      undefined,
      userId
    );

    return deleted;
  }
}
