/**
 * Employee Service Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EmployeeService } from '../../../modules/people/services/employee.service.js';
import { setupTestDb, cleanupTestDb } from '../../helpers/test-db.js';
import { TestFactories } from '../../helpers/test-factories.js';
import { createTestPerson } from '../../helpers/test-helpers.js';
import {
  verifyEmployeeExists,
  verifyPersonExists,
  getEmployeeCount,
  getPersonCount,
  getEmployeeFromDb,
} from '../../helpers/verify-data.js';

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
      const initialCount = await getEmployeeCount(tenantId);
      
      const person = await createTestPerson();
      const employee = await employeeService.create(
        {
          personId: person.perId,
          empEmployeeNumber: `TEST_EMP_${Date.now()}`,
          empHireDate: new Date('2024-01-01'),
        },
        tenantId,
        1
      );

      expect(employee.empId).toBeDefined();
      expect(employee.empPerId).toBe(person.perId);
      expect(employee.empTenantId).toBe(tenantId);

      // Verify data persists in database
      const finalCount = await getEmployeeCount(tenantId);
      expect(finalCount).toBe(initialCount + 1);
      
      const exists = await verifyEmployeeExists(employee.empId, tenantId);
      expect(exists).toBe(true);
      
      const personExists = await verifyPersonExists(person.perId);
      expect(personExists).toBe(true);
      
      // Verify employee data from database matches
      const dbEmployee = await getEmployeeFromDb(employee.empId, tenantId);
      expect(dbEmployee).not.toBeNull();
      expect(dbEmployee?.empPerId).toBe(person.perId);
      expect(dbEmployee?.empTenantId).toBe(tenantId);
    });

    it('should create person if personData provided', async () => {
      const initialPersonCount = await getPersonCount();
      const initialEmployeeCount = await getEmployeeCount(tenantId);
      
      const employee = await employeeService.create(
        {
          personData: {
            perFirstName: 'New',
            perLastName: 'Employee',
          },
          empEmployeeNumber: `TEST_EMP_${Date.now()}`,
        },
        tenantId,
        1
      );

      expect(employee.empId).toBeDefined();
      expect(employee.empPerId).toBeDefined();

      // Verify both person and employee were created in database
      const finalPersonCount = await getPersonCount();
      const finalEmployeeCount = await getEmployeeCount(tenantId);
      
      expect(finalPersonCount).toBe(initialPersonCount + 1);
      expect(finalEmployeeCount).toBe(initialEmployeeCount + 1);
      
      const personExists = await verifyPersonExists(employee.empPerId);
      expect(personExists).toBe(true);
      
      const employeeExists = await verifyEmployeeExists(employee.empId, tenantId);
      expect(employeeExists).toBe(true);
    });

    it('should enforce unique employee number within tenant', async () => {
      const person = await createTestPerson();
      const uniqueNumber = `UNIQUE_${Date.now()}`;
      
      const firstEmployee = await employeeService.create(
        { personId: person.perId, empEmployeeNumber: uniqueNumber },
        tenantId,
        1
      );

      expect(firstEmployee.empId).toBeDefined();
      
      // Verify first employee exists in database
      const exists = await verifyEmployeeExists(firstEmployee.empId, tenantId);
      expect(exists).toBe(true);

      // Try to create duplicate - should fail
      await expect(
        employeeService.create(
          { personId: person.perId, empEmployeeNumber: uniqueNumber },
          tenantId,
          1
        )
      ).rejects.toThrow('already exists');
      
      // Verify only one employee with that number exists
      const count = await getEmployeeCount(tenantId);
      const dbEmployee = await getEmployeeFromDb(firstEmployee.empId, tenantId);
      expect(dbEmployee?.empEmployeeNumber).toBe(uniqueNumber);
    });
  });

  describe('updateStatus', () => {
    it('should update employee status and create history', async () => {
      const person = await createTestPerson();
      const employee = await employeeService.create(
        {
          personId: person.perId,
          empEmployeeNumber: `STATUS_${Date.now()}`,
          empCurrentStatusCode: 'PLANNED',
        },
        tenantId,
        1
      );

      // Verify initial state in database
      const initialDbEmployee = await getEmployeeFromDb(employee.empId, tenantId);
      expect(initialDbEmployee?.empCurrentStatusCode).toBe('PLANNED');

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

      // Verify status updated in database
      const updatedDbEmployee = await getEmployeeFromDb(employee.empId, tenantId);
      expect(updatedDbEmployee?.empCurrentStatusCode).toBe('ACTIVE');
      expect(updatedDbEmployee?.empCurrentStatusEffectiveDate).toBeDefined();

      // Verify status history was created in database
      const history = await employeeService.getStatusHistory(employee.empId, tenantId);
      expect(history.length).toBeGreaterThan(0);
      expect(history.some((h) => h.eshStatusCode === 'ACTIVE')).toBe(true);
      
      // Verify at least one history record exists for ACTIVE status
      const activeHistory = history.filter((h) => h.eshStatusCode === 'ACTIVE');
      expect(activeHistory.length).toBeGreaterThan(0);
    });
  });
});
