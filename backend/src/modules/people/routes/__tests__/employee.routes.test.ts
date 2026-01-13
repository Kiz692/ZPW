/**
 * Employee Routes Integration Tests
 * Tests for employee API endpoints including critical flows
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildApp } from "../../../../app.js";
import type { FastifyInstance } from "fastify";
import { truncatePeopleTables } from "../../../../tests/helpers/test-db.js";
import {
  createTestPerson,
  createTestEmployee,
} from "../../../../tests/helpers/test-helpers.js";

describe("Employee API Routes - Critical Flows", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    await truncatePeopleTables();
    app = await buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await truncatePeopleTables();
    await app.close();
  });

  describe("Critical Flow 1: Employee Creation Flow", () => {
    it("should create person → create employee → fetch detail with related data", async () => {
      // Step 1: Create person
      const personResponse = await app.inject({
        method: "POST",
        url: "/api/v1/people/persons",
        headers: {
          "x-user-id": "1",
          "x-tenant-id": "1",
        },
        payload: {
          perFirstName: "John",
          perLastName: "Doe",
        },
      });

      expect(personResponse.statusCode).toBe(201);
      const person = JSON.parse(personResponse.body);
      expect(person).toBeDefined();
      expect(person.perId).toBeDefined();

      // Step 2: Create employee
      const employeeResponse = await app.inject({
        method: "POST",
        url: "/api/v1/people/employees",
        headers: {
          "x-user-id": "1",
          "x-tenant-id": "1",
        },
        payload: {
          personId: person.perId,
          empEmployeeNumber: "EMP001",
          empHireDate: "2024-01-01",
          empEmploymentTypeCode: "PERMANENT",
          empCurrentStatusCode: "ACTIVE",
        },
      });

      expect(employeeResponse.statusCode).toBe(201);
      const employee = JSON.parse(employeeResponse.body);
      expect(employee.empId).toBeDefined();
      expect(employee.empEmployeeNumber).toBe("EMP001");

      // Step 3: Fetch employee detail
      const detailResponse = await app.inject({
        method: "GET",
        url: `/api/v1/people/employees/${employee.empId}`,
        headers: {
          "x-user-id": "1",
          "x-tenant-id": "1",
        },
      });

      expect(detailResponse.statusCode).toBe(200);
      const employeeDetail = detailResponse.json();
      expect(employeeDetail.empId).toBe(employee.empId);
      expect(employeeDetail.empEmployeeNumber).toBe("EMP001");
    });
  });

  describe("Critical Flow 2: Tenant Isolation Flow", () => {
    it("should enforce tenant isolation - Tenant A cannot see Tenant B data", async () => {
      // Create employee in Tenant A
      const personA = await createTestPerson();
      const employeeA = await createTestEmployee(1, personA.perId);

      // Create employee in Tenant B
      const personB = await createTestPerson();
      const employeeB = await createTestEmployee(2, personB.perId);

      // Query as Tenant A
      const tenantAResponse = await app.inject({
        method: "GET",
        url: "/api/v1/people/employees",
        headers: {
          "x-user-id": "1",
          "x-tenant-id": "1",
        },
      });

      expect(tenantAResponse.statusCode).toBe(200);
      const tenantAEmployees = tenantAResponse.json();
      expect(tenantAEmployees.length).toBe(1);
      expect(tenantAEmployees[0].empId).toBe(employeeA.empId);

      // Try to access Tenant B employee as Tenant A
      const crossTenantResponse = await app.inject({
        method: "GET",
        url: `/api/v1/people/employees/${employeeB.empId}`,
        headers: {
          "x-user-id": "1",
          "x-tenant-id": "1",
        },
      });

      expect(crossTenantResponse.statusCode).toBe(404);
    });
  });

  describe("Critical Flow 3: Status History Flow", () => {
    it("should create employee → change status → verify history recorded", async () => {
      // Create employee
      const person = await createTestPerson();
      const employee = await createTestEmployee(1, person.perId);

      // Change status
      const statusResponse = await app.inject({
        method: "PATCH",
        url: `/api/v1/people/employees/${employee.empId}/status`,
        headers: {
          "x-user-id": "1",
          "x-tenant-id": "1",
        },
        payload: {
          statusCode: "PROBATION",
          effectiveDate: "2024-02-01",
          reasonCode: "NEW_HIRE",
        },
      });

      expect(statusResponse.statusCode).toBe(200);
      const statusBody = statusResponse.body;
      expect(statusBody).toBeDefined();
      const updatedEmployee =
        typeof statusBody === "string" ? JSON.parse(statusBody) : statusBody;
      expect(updatedEmployee).toBeDefined();
      expect(updatedEmployee.empCurrentStatusCode).toBe("PROBATION");

      // Verify status history
      const historyResponse = await app.inject({
        method: "GET",
        url: `/api/v1/people/employees/${employee.empId}/status-history`,
        headers: {
          "x-user-id": "1",
          "x-tenant-id": "1",
        },
      });

      expect(historyResponse.statusCode).toBe(200);
      const history = historyResponse.json();
      expect(history.length).toBeGreaterThanOrEqual(2);
      expect(history.some((h: any) => h.eshStatusCode === "PROBATION")).toBe(
        true,
      );
    });
  });
});
