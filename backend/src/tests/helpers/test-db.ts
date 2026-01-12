/**
 * Test Database Helpers
 * Setup and teardown for test database
 */

import { pool } from '../../core/db/client.js';
import { db } from '../../core/db/client.js';
import { sql } from 'drizzle-orm';

/**
 * Truncate all People Core tables
 */
export async function truncatePeopleTables(): Promise<void> {
  const tables = [
    'pid_wellness_profile_tag',
    'pid_wellness_profile',
    'pid_emp_status_history',
    'pid_employment_history',
    'pid_qualification',
    'pid_dependent',
    'pid_emp_contract',
    'pid_employee',
    'pid_person_identifier',
    'pid_person_contact',
    'pid_person',
    'sys_tenant',
  ];

  // Disable foreign key checks temporarily
  await db.execute(sql`SET session_replication_role = 'replica'`);

  for (const table of tables) {
    await db.execute(sql.raw(`TRUNCATE TABLE ${table} CASCADE`));
  }

  // Re-enable foreign key checks
  await db.execute(sql`SET session_replication_role = 'origin'`);
}

/**
 * Clean up test database
 */
export async function cleanupTestDb(): Promise<void> {
  await truncatePeopleTables();
}

/**
 * Setup test database (run before each test suite)
 */
export async function setupTestDb(): Promise<void> {
  // Verify connection
  await pool.query('SELECT 1');
}

/**
 * Teardown test database (run after each test suite)
 */
export async function teardownTestDb(): Promise<void> {
  await cleanupTestDb();
}
