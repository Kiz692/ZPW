/**
 * Test Helpers
 * Common test utility functions
 */

import { PersonRepository } from "../../modules/people/repositories/person.repository.js";
import { EmployeeRepository } from "../../modules/people/repositories/employee.repository.js";
import { TestFactories } from "./test-factories.js";

/**
 * Create a test person and return it
 */
export async function createTestPerson(overrides = {}) {
  const personRepo = new PersonRepository();
  const personData = TestFactories.createPerson(overrides);
  return await personRepo.create(personData);
}

/**
 * Create a test employee and return it
 */
export async function createTestEmployee(
  tenantId: number,
  personId?: number,
  overrides = {},
) {
  const employeeRepo = new EmployeeRepository();
  const _personRepo = new PersonRepository();

  let actualPersonId = personId;
  if (!actualPersonId) {
    const person = await createTestPerson();
    actualPersonId = person.perId;
  }

  const employeeData = TestFactories.createEmployee(
    tenantId,
    actualPersonId,
    overrides,
  );
  return await employeeRepo.create(employeeData);
}

/**
 * Create a test tenant (stub - in real implementation would insert into DB)
 */
export function getTestTenant(tenantId = 1) {
  return { tenId: tenantId, tenName: `Test Tenant ${tenantId}` };
}

/**
 * Wait for a specified time (useful for testing async operations)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
