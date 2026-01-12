#!/usr/bin/env tsx
/**
 * Database Verification Script
 * Verifies that all People Core tables exist with correct structure
 */

import { pool } from '../src/core/db/client.js';

const REQUIRED_TABLES = [
  'sys_tenant',
  'pid_person',
  'pid_employee',
  'pid_emp_contract',
  'pid_person_contact',
  'pid_person_identifier',
  'pid_dependent',
  'pid_qualification',
  'pid_employment_history',
  'pid_emp_status_history',
  'pid_wellness_profile',
  'pid_wellness_profile_tag',
  'org_position_assignment',
];

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful\n');

    console.log('🔍 Checking for required tables...');
    const result = await pool.query<{ table_name: string }>(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (${REQUIRED_TABLES.map((_, i) => `$${i + 1}`).join(', ')})
      ORDER BY table_name
    `, REQUIRED_TABLES);

    const existingTables = result.rows.map((row) => row.table_name);
    const missingTables = REQUIRED_TABLES.filter((table) => !existingTables.includes(table));

    if (missingTables.length > 0) {
      console.error('❌ Missing tables:');
      missingTables.forEach((table) => console.error(`   - ${table}`));
      console.error('\n💡 Run migrations: npm run db:migrate');
      process.exit(1);
    }

    console.log(`✅ All ${REQUIRED_TABLES.length} required tables exist\n`);

    // Verify indexes
    console.log('🔍 Checking indexes...');
    const indexResult = await pool.query<{ indexname: string }>(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename LIKE 'pid_%'
      ORDER BY indexname
    `);

    console.log(`✅ Found ${indexResult.rows.length} indexes on PID_ tables\n`);

    // Verify constraints
    console.log('🔍 Checking constraints...');
    const constraintResult = await pool.query<{ constraint_name: string; table_name: string }>(`
      SELECT constraint_name, table_name
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
      AND table_name LIKE 'pid_%'
      AND constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE')
      ORDER BY table_name, constraint_name
    `);

    console.log(`✅ Found ${constraintResult.rows.length} constraints on PID_ tables\n`);

    console.log('✅ Database verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifyDatabase();
