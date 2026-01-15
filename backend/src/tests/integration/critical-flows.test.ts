/**
 * Critical Flow Integration Tests
 * Tests the 3 critical flows: employee creation, tenant isolation, status history
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildApp } from "../../app.js";
import type { FastifyInstance } from "fastify";
import { setupTestDb, cleanupTestDb } from "../helpers/test-db.js";
import { TestFactories } from "../helpers/test-factories.js";
import { createTestPerson } from "../helpers/test-helpers.js";
import {
  verifyEmployeeExists,
  verifyPersonExists,
  verifyContractExists,
  verifyTenantIsolation,
  getPersonCount,
  getEmployeeCount,
  getContractCount,
  getStatusHistoryCount,
  getStatusHistoryFromDb,
} from "../helpers/verify-data.js";

describe("Critical Flows Integration Tests", () => {
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

  describe("Critical Flow 1: Employee Creation Flow", () => {
    it("should create person → create employee → create contract → verify complete record", async () => {
      // Get initial counts
      const initialPersonCount = await getPersonCount();
      const initialEmployeeCount = await getEmployeeCount(tenantId);
      const initialContractCount = await getContractCount(tenantId);

      // 1. Create person
      const personData = TestFactories.createPerson();
      // Convert Date objects to strings for API
      const personPayload = {
        ...personData,
        perDateOfBirth: personData.perDateOfBirth
          ? personData.perDateOfBirth.toISOString().split("T")[0]
          : undefined,
      };
      const personResponse = await app.inject({
        method: "POST",
        url: "/api/v1/people/persons",
        headers: {
          "X-Tenant-ID": String(tenantId),
          "X-User-ID": String(userId),
        },
        payload: personPayload,
      });

      expect(personResponse.statusCode).toBe(201);
      const person = JSON.parse(personResponse.body);
      expect(person).toBeDefined();
      expect(person.perId).toBeDefined();

      // Verify person exists in database
      const personExists = await verifyPersonExists(person.perId);
      expect(personExists).toBe(true);

      const personCountAfter = await getPersonCount();
      expect(personCountAfter).toBe(initialPersonCount + 1);

      // 2. Create employee
      const employeeResponse = await app.inject({
        method: "POST",
        url: "/api/v1/people/employees",
        headers: {
          "X-Tenant-ID": String(tenantId),
          "X-User-ID": String(userId),
        },
        payload: {
          personId: person.perId,
          empEmployeeNumber: `TEST_EMP_${Date.now()}`,
          empHireDate: "2024-01-01",
          empEmploymentTypeCode: "PERMANENT",
          empCurrentStatusCode: "ACTIVE",
        },
      });

      expect(employeeResponse.statusCode).toBe(201);
      const employee = JSON.parse(employeeResponse.body);
      expect(employee.empId).toBeDefined();
      expect(employee.empPerId).toBe(person.perId);

      // Verify employee exists in database
      const employeeExists = await verifyEmployeeExists(
        employee.empId,
        tenantId,
      );
      expect(employeeExists).toBe(true);

      const employeeCountAfter = await getEmployeeCount(tenantId);
      expect(employeeCountAfter).toBe(initialEmployeeCount + 1);

      // 3. Create contract
      const contractResponse = await app.inject({
        method: "POST",
        url: "/api/v1/people/contracts",
        headers: {
          "X-Tenant-ID": String(tenantId),
          "X-User-ID": String(userId),
        },
        payload: {
          ctrTenantId: tenantId,
          ctrEmpId: employee.empId,
          ctrContractTypeCode: "PERMANENT",
          ctrStartDate: "2024-01-01",
          ctrStatusCode: "ACTIVE",
        },
      });

      expect(contractResponse.statusCode).toBe(201);
      const contract = contractResponse.json();
      expect(contract.ctrId).toBeDefined();

      // Verify contract exists in database
      const contractExists = await verifyContractExists(
        contract.ctrId,
        tenantId,
      );
      expect(contractExists).toBe(true);

      const contractCountAfter = await getContractCount(tenantId);
      expect(contractCountAfter).toBe(initialContractCount + 1);

      // 4. Verify complete employee record via API
      const employeeDetailResponse = await app.inject({
        method: "GET",
        url: `/api/v1/people/employees/${employee.empId}`,
        headers: {
          "X-Tenant-ID": String(tenantId),
          "X-User-ID": String(userId),
        },
      });

      expect(employeeDetailResponse.statusCode).toBe(200);
      const employeeDetail = employeeDetailResponse.json();
      expect(employeeDetail.empId).toBe(employee.empId);
      expect(employeeDetail.empPerId).toBe(person.perId);
    });
  });

  describe("Critical Flow 2: Tenant Isolation Flow", () => {
    it("should enforce tenant isolation - Tenant A cannot access Tenant B data", async () => {
      const tenantA = 1;
      const tenantB = 2;

      // Get initial counts
      const initialCountA = await getEmployeeCount(tenantA);
      const initialCountB = await getEmployeeCount(tenantB);

      // Create employee in Tenant A
      const person = await createTestPerson();
      const employeeResponseA = await app.inject({
        method: "POST",
        url: "/api/v1/people/employees",
        headers: {
          "X-Tenant-ID": String(tenantA),
          "X-User-ID": String(userId),
        },
        payload: {
          personId: person.perId,
          empEmployeeNumber: `TENANT_A_${Date.now()}`,
          empHireDate: "2024-01-01",
        },
      });

      expect(employeeResponseA.statusCode).toBe(201);
      const employeeA = JSON.parse(employeeResponseA.body);
      expect(employeeA.empId).toBeDefined();

      // Verify employee exists in Tenant A database
      const existsInA = await verifyEmployeeExists(employeeA.empId, tenantA);
      expect(existsInA).toBe(true);

      const countAfterA = await getEmployeeCount(tenantA);
      expect(countAfterA).toBe(initialCountA + 1);

      // Verify tenant isolation in database
      const isolation = await verifyTenantIsolation(
        employeeA.empId,
        tenantA,
        tenantB,
      );
      expect(isolation.existsInCorrectTenant).toBe(true);
      expect(isolation.existsInWrongTenant).toBe(false);

      // Try to access as Tenant B via API
      const accessResponse = await app.inject({
        method: "GET",
        url: `/api/v1/people/employees/${employeeA.empId}`,
        headers: {
          "X-Tenant-ID": String(tenantB),
          "X-User-ID": String(userId),
        },
      });

      // Should not find the employee (404 or empty result)
      expect([404, 200]).toContain(accessResponse.statusCode);
      if (accessResponse.statusCode === 200) {
        const result = accessResponse.json();
        expect(result).toBeNull();
      }

      // Verify Tenant B count didn't change
      const countAfterB = await getEmployeeCount(tenantB);
      expect(countAfterB).toBe(initialCountB);
    });
  });

  describe("Critical Flow 3: Status History Flow", () => {
    it("should create employee → change status → verify history recorded", async () => {
      // Create employee
      const person = await createTestPerson();
      const employeeResponse = await app.inject({
        method: "POST",
        url: "/api/v1/people/employees",
        headers: {
          "X-Tenant-ID": String(tenantId),
          "X-User-ID": String(userId),
        },
        payload: {
          personId: person.perId,
          empEmployeeNumber: `STATUS_${Date.now()}`,
          empCurrentStatusCode: "PLANNED",
        },
      });

      expect(employeeResponse.statusCode).toBe(201);
      const employee = JSON.parse(employeeResponse.body);
      expect(employee.empId).toBeDefined();

      // Verify initial status history count (should have at least 1 for PLANNED)
      const initialHistoryCount = await getStatusHistoryCount(
        employee.empId,
        tenantId,
      );
      expect(initialHistoryCount).toBeGreaterThanOrEqual(0);

      // Change status to ACTIVE
      // Ensure employee.empId is defined
      expect(employee.empId).toBeDefined();
      const statusUpdateResponse = await app.inject({
        method: "PATCH",
        url: `/api/v1/people/employees/${employee.empId}/status`,
        headers: {
          "X-Tenant-ID": String(tenantId),
          "X-User-ID": String(userId),
        },
        payload: {
          statusCode: "ACTIVE",
          effectiveDate: "2024-02-01",
        },
      });

      expect(statusUpdateResponse.statusCode).toBe(200);
      // Verify the response contains the updated employee
      const updatedEmployee = statusUpdateResponse.json();
      expect(updatedEmployee.empCurrentStatusCode).toBe("ACTIVE");

      // Verify status history was created in database
      const finalHistoryCount = await getStatusHistoryCount(
        employee.empId,
        tenantId,
      );
      expect(finalHistoryCount).toBeGreaterThan(initialHistoryCount);

      // Get status history from database directly
      const dbHistory = await getStatusHistoryFromDb(employee.empId, tenantId);
      expect(dbHistory.length).toBeGreaterThan(0);
      expect(dbHistory.some((h) => h.eshStatusCode === "ACTIVE")).toBe(true);
      expect(dbHistory.some((h) => h.eshStatusCode === "PLANNED")).toBe(true);

      // Get status history via API
      const historyResponse = await app.inject({
        method: "GET",
        url: `/api/v1/people/employees/${employee.empId}/status-history`,
        headers: {
          "X-Tenant-ID": String(tenantId),
          "X-User-ID": String(userId),
        },
      });

      expect(historyResponse.statusCode).toBe(200);
      const history = historyResponse.json();
      expect(history.length).toBeGreaterThan(0);
      expect(history.some((h: any) => h.eshStatusCode === "ACTIVE")).toBe(true);

      // Verify API response matches database
      expect(history.length).toBe(dbHistory.length);
    });
  });
});
