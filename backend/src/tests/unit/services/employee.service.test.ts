/**
 * Employee Service Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EmployeeService } from '../../../modules/people/services/employee.service.js';
import { setupTestDb, cleanupTestDb } from '../../helpers/test-db.js';
import { TestFactories } from '../../helpers/test-factories.js';
import { createTestPerson } from '../../helpers/test-helpers.js';

// Mock audit service
vi.mock('../../../core/audit/audit.service.js', () => ({
  recordAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

describe('EmployeeService', () => {
  let employeeService: EmployeeService;
  const tenantId = 1;

  beforeEach(async () => {
    await setupTestDb();
    await cleanupTestDb();
    employeeService = new EmployeeService();
  });

  afterEach(async () => {
    await cleanupTestDb();
  });

  describe('create', () => {
    it('should create employee with person ID', async () => {
      const person = await createTestPerson();
      const employee = await employeeService.create(
        {
          personId: person.perId,
          empEmployeeNumber: 'EMP001',
          empHireDate: new Date('2024-01-01'),
        },
        tenantId,
        1
      );

      expect(employee.empId).toBeDefined();
      expect(employee.empPerId).toBe(person.perId);
      expect(employee.empTenantId).toBe(tenantId);
    });

    it('should create person if personData provided', async () => {
      const employee = await employeeService.create(
        {
          personData: {
            perFirstName: 'New',
            perLastName: 'Employee',
          },
          empEmployeeNumber: 'EMP002',
        },
        tenantId,
        1
      );

      expect(employee.empId).toBeDefined();
      expect(employee.empPerId).toBeDefined();
    });

    it('should enforce unique employee number within tenant', async () => {
      const person = await createTestPerson();
      await employeeService.create(
        { personId: person.perId, empEmployeeNumber: 'UNIQUE001' },
        tenantId,
        1
      );

      await expect(
        employeeService.create(
          { personId: person.perId, empEmployeeNumber: 'UNIQUE001' },
          tenantId,
          1
        )
      ).rejects.toThrow('already exists');
    });
  });

  describe('updateStatus', () => {
    it('should update employee status and create history', async () => {
      const person = await createTestPerson();
      const employee = await employeeService.create(
        {
          personId: person.perId,
          empEmployeeNumber: 'STATUS001',
          empCurrentStatusCode: 'PLANNED',
        },
        tenantId,
        1
      );

      const updated = await employeeService.updateStatus(
        employee.empId,
        'ACTIVE',
        new Date('2024-02-01'),
        undefined,
        undefined,
        tenantId,
        1
      );

      expect(updated?.empCurrentStatusCode).toBe('ACTIVE');

      // Verify status history was created
      const history = await employeeService.getStatusHistory(employee.empId, tenantId);
      expect(history.length).toBeGreaterThan(0);
      expect(history.some((h) => h.eshStatusCode === 'ACTIVE')).toBe(true);
    });
  });
});
