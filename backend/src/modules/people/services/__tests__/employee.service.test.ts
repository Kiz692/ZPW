/**
 * Employee Service Tests
 * Unit tests for EmployeeService business logic
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EmployeeService } from '../employee.service.js';
import { PersonRepository } from '../../repositories/person.repository.js';
import { truncatePeopleTables } from '../../../../tests/helpers/test-db.js';
import { createTestPerson } from '../../../../tests/helpers/test-factories.js';

// Mock audit service
vi.mock('../../../../core/audit/audit.service.js', () => ({
  recordAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

describe('EmployeeService', () => {
  const employeeService = new EmployeeService();
  const personRepo = new PersonRepository();

  beforeEach(async () => {
    await truncatePeopleTables();
  });

  afterEach(async () => {
    await truncatePeopleTables();
  });

  describe('create', () => {
    it('should create employee with person data', async () => {
      const employeeData = {
        personData: {
          perFirstName: 'John',
          perLastName: 'Doe',
        },
        empEmployeeNumber: 'EMP001',
      };

      const employee = await employeeService.create(employeeData, 1, 1);

      expect(employee.empId).toBeDefined();
      expect(employee.empEmployeeNumber).toBe('EMP001');
      expect(employee.empTenantId).toBe(1);
    });

    it('should create employee with existing person ID', async () => {
      const person = await personRepo.create(createTestPerson());
      const employee = await employeeService.create(
        { personId: person.perId, empEmployeeNumber: 'EMP002' },
        1,
        1
      );

      expect(employee.empPerId).toBe(person.perId);
    });

    it('should enforce unique employee number within tenant', async () => {
      const person1 = await personRepo.create(createTestPerson());
      const person2 = await personRepo.create(createTestPerson());

      await employeeService.create({ personId: person1.perId, empEmployeeNumber: 'EMP001' }, 1, 1);

      await expect(
        employeeService.create({ personId: person2.perId, empEmployeeNumber: 'EMP001' }, 1, 1)
      ).rejects.toThrow('already exists');
    });

    it('should enforce one employee per person per tenant', async () => {
      const person = await personRepo.create(createTestPerson());

      await employeeService.create({ personId: person.perId, empEmployeeNumber: 'EMP001' }, 1, 1);

      await expect(
        employeeService.create({ personId: person.perId, empEmployeeNumber: 'EMP002' }, 1, 1)
      ).rejects.toThrow('already has an employee record');
    });

    it('should create status history on employee creation', async () => {
      const person = await personRepo.create(createTestPerson());
      const employee = await employeeService.create(
        { personId: person.perId, empEmployeeNumber: 'EMP001', empCurrentStatusCode: 'ACTIVE' },
        1,
        1
      );

      const history = await employeeService.getStatusHistory(employee.empId, 1);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].eshStatusCode).toBe('ACTIVE');
    });
  });

  describe('updateStatus', () => {
    it('should update status and create history entry', async () => {
      const person = await personRepo.create(createTestPerson());
      const employee = await employeeService.create(
        { personId: person.perId, empEmployeeNumber: 'EMP001' },
        1,
        1
      );

      const effectiveDate = new Date();
      const updated = await employeeService.updateStatus(
        employee.empId,
        'PROBATION',
        effectiveDate,
        undefined,
        undefined,
        1,
        1
      );

      expect(updated.empCurrentStatusCode).toBe('PROBATION');
      const history = await employeeService.getStatusHistory(employee.empId, 1);
      expect(history.length).toBeGreaterThan(1);
    });
  });
});
