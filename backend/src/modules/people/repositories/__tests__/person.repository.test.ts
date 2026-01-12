/**
 * Person Repository Tests
 * Unit tests for PersonRepository
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PersonRepository } from '../person.repository.js';
import { truncatePeopleTables } from '../../../../tests/helpers/test-db.js';
import { TestFactories } from '../../../../tests/helpers/test-factories.js';

describe('PersonRepository', () => {
  const personRepo = new PersonRepository();

  beforeEach(async () => {
    await truncatePeopleTables();
  });

  afterEach(async () => {
    await truncatePeopleTables();
  });

  describe('create', () => {
    it('should create a person with all required fields', async () => {
      const personData = TestFactories.createPerson();
      const person = await personRepo.create(personData);

      expect(person.perId).toBeDefined();
      expect(person.perFirstName).toBe(personData.perFirstName);
      expect(person.perLastName).toBe(personData.perLastName);
      expect(person.perDisplayName).toBe('John Doe');
      expect(person.perCreatedAt).toBeDefined();
    });

    it('should auto-generate display name if not provided', async () => {
      const personData = createTestPerson({ perDisplayName: undefined });
      const person = await personRepo.create(personData);

      expect(person.perDisplayName).toBe('John Doe');
    });
  });

  describe('findById', () => {
    it('should find person by ID', async () => {
      const personData = TestFactories.createPerson();
      const created = await personRepo.create(personData);
      const found = await personRepo.findById(created.perId);

      expect(found).not.toBeNull();
      expect(found?.perId).toBe(created.perId);
    });

    it('should return null if person not found', async () => {
      const found = await personRepo.findById(99999);
      expect(found).toBeNull();
    });

    it('should not return soft-deleted person', async () => {
      const personData = TestFactories.createPerson();
      const created = await personRepo.create(personData);
      await personRepo.softDelete(created.perId);
      const found = await personRepo.findById(created.perId);

      expect(found).toBeNull();
    });
  });

  describe('searchByName', () => {
    it('should find persons by first name', async () => {
      await personRepo.create(createTestPerson({ perFirstName: 'John' }));
      await personRepo.create(createTestPerson({ perFirstName: 'Jane', perLastName: 'Smith' }));

      const results = await personRepo.searchByName('John');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].perFirstName).toBe('John');
    });

    it('should find persons by last name', async () => {
      await personRepo.create(createTestPerson({ perLastName: 'Doe' }));
      await personRepo.create(createTestPerson({ perFirstName: 'Jane', perLastName: 'Smith' }));

      const results = await personRepo.searchByName('Doe');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].perLastName).toBe('Doe');
    });
  });

  describe('update', () => {
    it('should update person fields', async () => {
      const personData = TestFactories.createPerson();
      const created = await personRepo.create(personData);
      const updated = await personRepo.update(created.perId, { perFirstName: 'Jane' });

      expect(updated?.perFirstName).toBe('Jane');
      expect(updated?.perUpdatedAt).toBeDefined();
    });

    it('should auto-update display name when name changes', async () => {
      const personData = TestFactories.createPerson();
      const created = await personRepo.create(personData);
      const updated = await personRepo.update(created.perId, { perFirstName: 'Jane' });

      expect(updated?.perDisplayName).toContain('Jane');
    });
  });

  describe('softDelete', () => {
    it('should soft delete person', async () => {
      const personData = TestFactories.createPerson();
      const created = await personRepo.create(personData);
      const deleted = await personRepo.softDelete(created.perId);

      expect(deleted).toBe(true);
      const found = await personRepo.findById(created.perId);
      expect(found).toBeNull();
    });
  });
});
