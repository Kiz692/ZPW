/**
 * Test Database Helpers
 * Setup and teardown for test database
 *
 * IMPORTANT: This cleanup preserves demo seed data (identified by specific patterns)
 * and only removes test-created data to prevent flaky tests.
 */

import { pool } from "../../core/db/client.js";
import { db } from "../../core/db/client.js";
import { sql } from "drizzle-orm";

/**
 * Demo seed data identifiers - these should NOT be deleted during test cleanup
 */
const DEMO_EMPLOYEE_NUMBERS = ["EMP001", "EMP002", "EMP003"];
const _DEMO_TENANT_NAME = "Demo Company";

/**
 * Check if an employee number is from demo seed data
 */
function _isDemoEmployeeNumber(empNumber: string): boolean {
  return DEMO_EMPLOYEE_NUMBERS.includes(empNumber);
}

/**
 * Clean up only test-created data, preserving demo seed data
 * This prevents flaky tests where demo data gets deleted
 */
export async function cleanupTestData(): Promise<void> {
  const {
    pidEmployee,
    pidPerson,
    pidEmpContract,
    pidPersonContact,
    pidPersonIdentifier,
    pidDependent,
    pidQualification,
    pidEmploymentHistory,
    pidEmpStatusHistory,
    pidWellnessProfile,
    pidWellnessProfileTag,
  } = await import("../../core/db/schema/people.js");
  const { eq: _eq, notInArray, inArray } = await import("drizzle-orm");

  // Get demo employee IDs first
  const demoEmployees = await db
    .select({ empId: pidEmployee.empId, empPerId: pidEmployee.empPerId })
    .from(pidEmployee)
    .where(inArray(pidEmployee.empEmployeeNumber, DEMO_EMPLOYEE_NUMBERS));

  const demoEmployeeIds = demoEmployees.map((e) => e.empId);
  const demoPersonIds = demoEmployees.map((e) => e.empPerId);

  if (demoEmployeeIds.length === 0 && demoPersonIds.length === 0) {
    // No demo data exists, safe to do full cleanup
    return;
  }

  // Delete in reverse dependency order to avoid FK issues
  // Only delete data that is NOT demo seed data

  // 1. Delete wellness profile tags (not from demo)
  if (demoEmployeeIds.length > 0) {
    const demoWellnessProfiles = await db
      .select({ wepId: pidWellnessProfile.wepId })
      .from(pidWellnessProfile)
      .where(inArray(pidWellnessProfile.wepEmpId, demoEmployeeIds));

    const demoWepIds = demoWellnessProfiles.map((w) => w.wepId);

    if (demoWepIds.length > 0) {
      await db
        .delete(pidWellnessProfileTag)
        .where(notInArray(pidWellnessProfileTag.wptWepId, demoWepIds));
    } else {
      await db.delete(pidWellnessProfileTag);
    }
  } else {
    await db.delete(pidWellnessProfileTag);
  }

  // 2. Delete wellness profiles (not from demo)
  if (demoEmployeeIds.length > 0) {
    await db
      .delete(pidWellnessProfile)
      .where(notInArray(pidWellnessProfile.wepEmpId, demoEmployeeIds));
  } else {
    await db.delete(pidWellnessProfile);
  }

  // 3. Delete status history (not from demo)
  if (demoEmployeeIds.length > 0) {
    await db
      .delete(pidEmpStatusHistory)
      .where(notInArray(pidEmpStatusHistory.eshEmpId, demoEmployeeIds));
  } else {
    await db.delete(pidEmpStatusHistory);
  }

  // 4. Delete employment history (not from demo persons)
  if (demoPersonIds.length > 0) {
    await db
      .delete(pidEmploymentHistory)
      .where(notInArray(pidEmploymentHistory.pehPerId, demoPersonIds));
  } else {
    await db.delete(pidEmploymentHistory);
  }

  // 5. Delete qualifications (not from demo persons)
  if (demoPersonIds.length > 0) {
    await db
      .delete(pidQualification)
      .where(notInArray(pidQualification.qlfPerId, demoPersonIds));
  } else {
    await db.delete(pidQualification);
  }

  // 6. Delete dependents (not from demo)
  if (demoEmployeeIds.length > 0) {
    await db
      .delete(pidDependent)
      .where(notInArray(pidDependent.depEmpId, demoEmployeeIds));
  } else {
    await db.delete(pidDependent);
  }

  // 7. Delete contracts (not from demo)
  if (demoEmployeeIds.length > 0) {
    await db
      .delete(pidEmpContract)
      .where(notInArray(pidEmpContract.ctrEmpId, demoEmployeeIds));
  } else {
    await db.delete(pidEmpContract);
  }

  // 8. Delete employees (not from demo)
  await db
    .delete(pidEmployee)
    .where(notInArray(pidEmployee.empEmployeeNumber, DEMO_EMPLOYEE_NUMBERS));

  // 9. Delete person contacts (not from demo persons)
  if (demoPersonIds.length > 0) {
    await db
      .delete(pidPersonContact)
      .where(notInArray(pidPersonContact.pcoPerId, demoPersonIds));
  } else {
    await db.delete(pidPersonContact);
  }

  // 10. Delete person identifiers (not from demo persons)
  if (demoPersonIds.length > 0) {
    await db
      .delete(pidPersonIdentifier)
      .where(notInArray(pidPersonIdentifier.idnPerId, demoPersonIds));
  } else {
    await db.delete(pidPersonIdentifier);
  }

  // 11. Delete persons (not from demo - only if not linked to demo employees)
  if (demoPersonIds.length > 0) {
    await db
      .delete(pidPerson)
      .where(notInArray(pidPerson.perId, demoPersonIds));
  } else {
    await db.delete(pidPerson);
  }
}

/**
 * Truncate all People Core tables (use only for full reset, not during normal tests)
 * This will DELETE demo seed data - use with caution!
 */
export async function truncatePeopleTables(): Promise<void> {
  const tables = [
    "pid_wellness_profile_tag",
    "pid_wellness_profile",
    "pid_emp_status_history",
    "pid_employment_history",
    "pid_qualification",
    "pid_dependent",
    "pid_emp_contract",
    "pid_employee",
    "pid_person_identifier",
    "pid_person_contact",
    "pid_person",
  ];

  // Truncate in reverse dependency order to avoid FK issues
  // Disable foreign key checks temporarily
  await db.execute(sql`SET session_replication_role = 'replica'`);

  for (const table of tables) {
    await db.execute(sql.raw(`TRUNCATE TABLE ${table} CASCADE`));
  }

  // Re-enable foreign key checks
  await db.execute(sql`SET session_replication_role = 'origin'`);
}

/**
 * Create test tenant if it doesn't exist
 */
export async function ensureTestTenant(tenantId = 1): Promise<void> {
  const { sysTenant } = await import("../../core/db/schema/people.js");
  const existing = await db
    .select()
    .from(sysTenant)
    .where(sql`${sysTenant.tenId} = ${tenantId}`)
    .limit(1);

  if (existing.length === 0) {
    await db
      .insert(sysTenant)
      .values({ tenId: tenantId, tenName: `Test Tenant ${tenantId}` });
  }
}

/**
 * Clean up test database - preserves demo seed data
 * This is the safe cleanup that should be used in tests
 */
export async function cleanupTestDb(): Promise<void> {
  await cleanupTestData();
}

/**
 * Setup test database (run before each test suite)
 */
export async function setupTestDb(): Promise<void> {
  // Verify connection
  await pool.query("SELECT 1");
  // Ensure test tenant exists
  await ensureTestTenant(1);
}

/**
 * Teardown test database (run after each test suite)
 */
export async function teardownTestDb(): Promise<void> {
  await cleanupTestDb();
}
