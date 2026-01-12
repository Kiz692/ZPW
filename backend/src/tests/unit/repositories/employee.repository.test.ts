/**
 * Employee Repository Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EmployeeRepository } from '../../../modules/people/repositories/employee.repository.js';
import { PersonRepository } from '../../../modules/people/repositories/person.repository.js';
import { setupTestDb, cleanupTestDb } from '../../helpers/test-db.js';
import { TestFactories } from '../../helpers/test-factories.js';
import { createTestPerson } from '../../helpers/test-helpers.js';

describe('EmployeeRepository', () => {
  let employeeRepo: EmployeeRepository;
  let personRepo: PersonRepository;
  const tenantId = 1;

  beforeEach(async () => {
    await setupTestDb();
    await cleanupTestDb();
    employeeRepo = new EmployeeRepository();
    personRepo = new PersonRepository();
  });

  afterEach(async () => {
    await cleanupTestDb();
  });

  describe('create', () => {
    it('should create employee with tenant isolation', async () => {
      const person = await createTestPerson();
      const employeeData = TestFactories.createEmployee(tenantId, person.perId);
      const employee = await employeeRepo.create(employeeData);

      expect(employee.empId).toBeDefined();
      expect(employee.empTenantId).toBe(tenantId);
      expect(employee.empPerId).toBe(person.perId);
      expect(employee.empCreatedAt).toBeDefined();
    });
  });

  describe('findById', () => {
    it('should find employee by ID with tenant isolation', async () => {
      const person = await createTestPerson();
      const employee = await employeeRepo.create(TestFactories.createEmployee(tenantId, person.perId));
      
      const found = await employeeRepo.findById(employee.empId, tenantId);
      expect(found).not.toBeNull();
      expect(found?.empId).toBe(employee.empId);
    });

    it('should not find employee from different tenant', async () => {
      const person = await createTestPerson();
      const employee = await employeeRepo.create(TestFactories.createEmployee(tenantId, person.perId));
      
      const found = await employeeRepo.findById(employee.empId, 999); // Different tenant
      expect(found).toBeNull();
    });
  });

  describe('findByEmployeeNumber', () => {
    it('should find employee by employee number within tenant', async () => {
      const person = await createTestPerson();
      const employeeNumber = `EMP${Date.now()}`;
      const employee = await employeeRepo.create(
        TestFactories.createEmployee(tenantId, person.perId, { empEmployeeNumber: employeeNumber })
      );

      const found = await employeeRepo.findByEmployeeNumber(employeeNumber, tenantId);
      expect(found).not.toBeNull();
      expect(found?.empEmployeeNumber).toBe(employeeNumber);
    });
  });

  describe('updateStatus', () => {
    it('should update employee status', async () => {
      const person = await createTestPerson();
      const employee = await employeeRepo.create(TestFactories.createEmployee(tenantId, person.perId));
      
      const updated = await employeeRepo.updateStatus(
        employee.empId,
        'PROBATION',
        new Date('2024-02-01'),
        tenantId
      );

      expect(updated?.empCurrentStatusCode).toBe('PROBATION');
      expect(updated?.empCurrentStatusEffectiveDate).toEqual(new Date('2024-02-01'));
    });
  });
});
