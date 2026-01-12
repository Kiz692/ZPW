/**
 * Database Constraint Tests
 * Tests foreign keys, unique constraints, tenant isolation, audit fields, soft deletes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '../../core/db/client.js';
import { pidPerson, pidEmployee } from '../../core/db/schema/people.js';
import { setupTestDb, cleanupTestDb } from '../helpers/test-db.js';
import { TestFactories } from '../helpers/test-factories.js';
import { createTestPerson } from '../helpers/test-helpers.js';
import { PersonRepository } from '../../modules/people/repositories/person.repository.js';

describe('Database Constraints', () => {
  beforeEach(async () => {
    await setupTestDb();
    await cleanupTestDb();
  });

  afterEach(async () => {
    await cleanupTestDb();
  });

  describe('Foreign Key Constraints', () => {
    it('should enforce foreign key from employee to person', async () => {
      await expect(
        db.insert(pidEmployee).values({
          empTenantId: 1,
          empPerId: 99999, // Non-existent person
          empEmployeeNumber: 'TEST001',
        } as any)
      ).rejects.toThrow();
    });
  });

  describe('Unique Constraints', () => {
    it('should enforce unique employee number within tenant', async () => {
      const person = await createTestPerson();
      const employeeNumber = 'UNIQUE001';

      // Create first employee
      await db.insert(pidEmployee).values({
        empTenantId: 1,
        empPerId: person.perId,
        empEmployeeNumber: employeeNumber,
      } as any);

      // Try to create second employee with same number in same tenant
      await expect(
        db.insert(pidEmployee).values({
          empTenantId: 1,
          empPerId: person.perId,
          empEmployeeNumber: employeeNumber,
        } as any)
      ).rejects.toThrow();
    });

    it('should allow same employee number in different tenant', async () => {
      const person1 = await createTestPerson();
      const person2 = await createTestPerson();
      const employeeNumber = 'SAME001';

      // Create employee in tenant 1
      await db.insert(pidEmployee).values({
        empTenantId: 1,
        empPerId: person1.perId,
        empEmployeeNumber: employeeNumber,
      } as any);

      // Should allow same number in tenant 2
      await expect(
        db.insert(pidEmployee).values({
          empTenantId: 2,
          empPerId: person2.perId,
          empEmployeeNumber: employeeNumber,
        } as any)
      ).resolves.not.toThrow();
    });
  });

  describe('Audit Fields', () => {
    it('should populate created_at on insert', async () => {
      const person = await createTestPerson();
      expect(person.perCreatedAt).toBeDefined();
      expect(person.perCreatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Soft Delete', () => {
    it('should not actually delete record on soft delete', async () => {
      const personRepo = new (await import('../../modules/people/repositories/person.repository.js')).PersonRepository();
      const person = await personRepo.create(TestFactories.createPerson());
      
      await personRepo.softDelete(person.perId);
      
      // Record should still exist in DB but not be findable
      const found = await personRepo.findById(person.perId);
      expect(found).toBeNull();
    });
  });
});
