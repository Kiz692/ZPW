/**
 * Employee Repository Tests
 * Unit tests for EmployeeRepository with tenant isolation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EmployeeRepository } from '../employee.repository.js';
import { PersonRepository } from '../person.repository.js';
import { truncatePeopleTables } from '../../../../tests/helpers/test-db.js';
import { TestFactories } from '../../../../tests/helpers/test-factories.js';

describe('EmployeeRepository', () => {
  const employeeRepo = new EmployeeRepository();
  const personRepo = new PersonRepository();

  beforeEach(async () => {
    await truncatePeopleTables();
  });

  afterEach(async () => {
    await truncatePeopleTables();
  });

  describe('create', () => {
    it('should create employee with tenant ID', async () => {
      const person = await personRepo.create(TestFactories.createPerson());
      const employeeData = TestFactories.createEmployee(1, person.perId);
      const employee = await employeeRepo.create(employeeData);

      expect(employee.empId).toBeDefined();
      expect(employee.empTenantId).toBe(1);
      expect(employee.empPerId).toBe(person.perId);
      expect(employee.empCreatedAt).toBeDefined();
    });
  });

  describe('tenant isolation', () => {
    it('should only find employees for specified tenant', async () => {
      const person1 = await personRepo.create(TestFactories.createPerson({ perFirstName: 'John' }));
      const person2 = await personRepo.create(TestFactories.createPerson({ perFirstName: 'Jane' }));

      const emp1 = await employeeRepo.create(TestFactories.createEmployee(1, person1.perId, { empEmployeeNumber: 'EMP001' }));
      const emp2 = await employeeRepo.create(TestFactories.createEmployee(2, person2.perId, { empEmployeeNumber: 'EMP001' }));

      const tenant1Employees = await employeeRepo.findAll(1);
      const tenant2Employees = await employeeRepo.findAll(2);

      expect(tenant1Employees.length).toBe(1);
      expect(tenant1Employees[0].empId).toBe(emp1.empId);
      expect(tenant2Employees.length).toBe(1);
      expect(tenant2Employees[0].empId).toBe(emp2.empId);
    });

    it('should not find employee from different tenant', async () => {
      const person = await personRepo.create(TestFactories.createPerson());
      const employee = await employeeRepo.create(TestFactories.createEmployee(1, person.perId));

      const found = await employeeRepo.findById(employee.empId, 2);
      expect(found).toBeNull();
    });
  });

  describe('findByEmployeeNumber', () => {
    it('should find employee by employee number within tenant', async () => {
      const person = await personRepo.create(TestFactories.createPerson());
      const employee = await employeeRepo.create(
        TestFactories.createEmployee(1, person.perId, { empEmployeeNumber: 'EMP123' })
      );

      const found = await employeeRepo.findByEmployeeNumber('EMP123', 1);
      expect(found).not.toBeNull();
      expect(found?.empEmployeeNumber).toBe('EMP123');
    });

    it('should not find employee with same number in different tenant', async () => {
      const person1 = await personRepo.create(TestFactories.createPerson());
      const person2 = await personRepo.create(TestFactories.createPerson());

      await employeeRepo.create(TestFactories.createEmployee(1, person1.perId, { empEmployeeNumber: 'EMP123' }));
      await employeeRepo.create(TestFactories.createEmployee(2, person2.perId, { empEmployeeNumber: 'EMP123' }));

      const found = await employeeRepo.findByEmployeeNumber('EMP123', 2);
      expect(found).not.toBeNull();
      expect(found?.empTenantId).toBe(2);
    });
  });

  describe('updateStatus', () => {
    it('should update employee status', async () => {
      const person = await personRepo.create(TestFactories.createPerson());
      const employee = await employeeRepo.create(TestFactories.createEmployee(1, person.perId));
      // Use a fixed date to avoid precision issues
      const effectiveDate = new Date('2024-01-15T10:00:00.000Z');

      const updated = await employeeRepo.updateStatus(employee.empId, 'PROBATION', effectiveDate, 1);

      expect(updated?.empCurrentStatusCode).toBe('PROBATION');
      expect(updated?.empCurrentStatusEffectiveDate).toBeDefined();
      // Verify the date is set and is a valid date
      const updatedDate = updated?.empCurrentStatusEffectiveDate instanceof Date 
        ? updated.empCurrentStatusEffectiveDate 
        : new Date(updated!.empCurrentStatusEffectiveDate as string);
      expect(updatedDate).toBeInstanceOf(Date);
      expect(updatedDate.getTime()).toBeGreaterThan(0);
      // Verify the date parts match (ignoring timezone differences)
      expect(updatedDate.toISOString().split('T')[0]).toBe(effectiveDate.toISOString().split('T')[0]);
    });
  });
});
