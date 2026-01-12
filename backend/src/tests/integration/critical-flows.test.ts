/**
 * Critical Flow Integration Tests
 * Tests the 3 critical flows: employee creation, tenant isolation, status history
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../../app.js';
import type { FastifyInstance } from 'fastify';
import { setupTestDb, cleanupTestDb } from '../helpers/test-db.js';
import { TestFactories } from '../helpers/test-factories.js';
import { createTestPerson } from '../helpers/test-helpers.js';
import { PersonRepository } from '../../modules/people/repositories/person.repository.js';

describe('Critical Flows Integration Tests', () => {
  let app: FastifyInstance;
  const tenantId = 1;
  const userId = 1;

  beforeEach(async () => {
    await setupTestDb();
    await cleanupTestDb();
    app = await buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await cleanupTestDb();
    await app.close();
  });

  describe('Critical Flow 1: Employee Creation Flow', () => {
    it('should create person → create employee → create contract → verify complete record', async () => {
      // 1. Create person
      const personResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/people/persons',
        headers: {
          'X-Tenant-ID': String(tenantId),
          'X-User-ID': String(userId),
        },
        payload: TestFactories.createPerson(),
      });

      expect(personResponse.statusCode).toBe(201);
      const person = JSON.parse(personResponse.body);
      expect(person.perId).toBeDefined();

      // 2. Create employee
      const employeeResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/people/employees',
        headers: {
          'X-Tenant-ID': String(tenantId),
          'X-User-ID': String(userId),
        },
        payload: {
          personId: person.perId,
          empEmployeeNumber: `EMP${Date.now()}`,
          empHireDate: '2024-01-01',
          empEmploymentTypeCode: 'PERMANENT',
          empCurrentStatusCode: 'ACTIVE',
        },
      });

      expect(employeeResponse.statusCode).toBe(201);
      const employee = JSON.parse(employeeResponse.body);
      expect(employee.empId).toBeDefined();
      expect(employee.empPerId).toBe(person.perId);

      // 3. Create contract
      const contractResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/people/contracts',
        headers: {
          'X-Tenant-ID': String(tenantId),
          'X-User-ID': String(userId),
        },
        payload: {
          ctrTenantId: tenantId,
          ctrEmpId: employee.empId,
          ctrContractTypeCode: 'PERMANENT',
          ctrStartDate: '2024-01-01',
          ctrStatusCode: 'ACTIVE',
        },
      });

      expect(contractResponse.statusCode).toBe(201);
      const contract = JSON.parse(contractResponse.body);
      expect(contract.ctrId).toBeDefined();

      // 4. Verify complete employee record
      const employeeDetailResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/people/employees/${employee.empId}`,
        headers: {
          'X-Tenant-ID': String(tenantId),
          'X-User-ID': String(userId),
        },
      });

      expect(employeeDetailResponse.statusCode).toBe(200);
      const employeeDetail = JSON.parse(employeeDetailResponse.body);
      expect(employeeDetail.empId).toBe(employee.empId);
      expect(employeeDetail.empPerId).toBe(person.perId);
    });
  });

  describe('Critical Flow 2: Tenant Isolation Flow', () => {
    it('should enforce tenant isolation - Tenant A cannot access Tenant B data', async () => {
      const tenantA = 1;
      const tenantB = 2;

      // Create employee in Tenant A
      const person = await createTestPerson();
      const employeeResponseA = await app.inject({
        method: 'POST',
        url: '/api/v1/people/employees',
        headers: {
          'X-Tenant-ID': String(tenantA),
          'X-User-ID': String(userId),
        },
        payload: {
          personId: person.perId,
          empEmployeeNumber: 'TENANT_A_EMP',
          empHireDate: '2024-01-01',
        },
      });

      expect(employeeResponseA.statusCode).toBe(201);
      const employeeA = JSON.parse(employeeResponseA.body);

      // Try to access as Tenant B
      const accessResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/people/employees/${employeeA.empId}`,
        headers: {
          'X-Tenant-ID': String(tenantB),
          'X-User-ID': String(userId),
        },
      });

      // Should not find the employee (404 or empty result)
      expect([404, 200]).toContain(accessResponse.statusCode);
      if (accessResponse.statusCode === 200) {
        const result = JSON.parse(accessResponse.body);
        expect(result).toBeNull();
      }
    });
  });

  describe('Critical Flow 3: Status History Flow', () => {
    it('should create employee → change status → verify history recorded', async () => {
      // Create employee
      const person = await createTestPerson();
      const employeeResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/people/employees',
        headers: {
          'X-Tenant-ID': String(tenantId),
          'X-User-ID': String(userId),
        },
        payload: {
          personId: person.perId,
          empEmployeeNumber: `EMP${Date.now()}`,
          empCurrentStatusCode: 'PLANNED',
        },
      });

      expect(employeeResponse.statusCode).toBe(201);
      const employee = JSON.parse(employeeResponse.body);

      // Change status to ACTIVE
      const statusUpdateResponse = await app.inject({
        method: 'PATCH',
        url: `/api/v1/people/employees/${employee.empId}/status`,
        headers: {
          'X-Tenant-ID': String(tenantId),
          'X-User-ID': String(userId),
        },
        payload: {
          statusCode: 'ACTIVE',
          effectiveDate: '2024-02-01',
        },
      });

      expect(statusUpdateResponse.statusCode).toBe(200);

      // Get status history
      const historyResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/people/employees/${employee.empId}/status-history`,
        headers: {
          'X-Tenant-ID': String(tenantId),
          'X-User-ID': String(userId),
        },
      });

      expect(historyResponse.statusCode).toBe(200);
      const history = JSON.parse(historyResponse.body);
      expect(history.length).toBeGreaterThan(0);
      expect(history.some((h: any) => h.eshStatusCode === 'ACTIVE')).toBe(true);
    });
  });
});
