#!/usr/bin/env tsx
/**
 * Demo Data Verification Script
 * Verifies that demo seed data exists and is ready for demo
 */

import { db } from '../src/core/db/client.js';
import { sysTenant, pidPerson, pidEmployee, pidEmpContract, pidPersonContact, pidWellnessProfile } from '../src/core/db/schema/people.js';
import { sql, eq, and, inArray } from 'drizzle-orm';

const DEMO_TENANT_NAME = 'Demo Company';
const DEMO_EMPLOYEE_NUMBERS = ['EMP001', 'EMP002', 'EMP003'];
const EXPECTED_PERSONS = 5;
const EXPECTED_EMPLOYEES = 3;
const EXPECTED_CONTRACTS = 2;
const EXPECTED_CONTACTS = 3;
const EXPECTED_WELLNESS_PROFILES = 2;

async function verifyDemoData() {
  try {
    console.log('🔍 Verifying demo data...\n');

    // 1. Check tenant
    console.log('1. Checking demo tenant...');
    const tenants = await db
      .select()
      .from(sysTenant)
      .where(eq(sysTenant.tenName, DEMO_TENANT_NAME))
      .limit(1);

    if (tenants.length === 0) {
      console.log('❌ Demo tenant not found!');
      console.log('   Run: npm run db:seed:demo');
      process.exit(1);
    }

    const tenant = tenants[0];
    console.log(`✅ Demo tenant found: ${tenant.tenName} (ID: ${tenant.tenId})`);

    // 2. Check persons
    console.log('\n2. Checking demo persons...');
    const personCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(pidPerson);

    const totalPersons = Number(personCount[0]?.count || 0);
    console.log(`   Total persons: ${totalPersons}`);
    
    if (totalPersons < EXPECTED_PERSONS) {
      console.log(`   ⚠️  Expected at least ${EXPECTED_PERSONS} persons, found ${totalPersons}`);
    } else {
      console.log(`   ✅ Found ${totalPersons} persons (expected: ${EXPECTED_PERSONS})`);
    }

    // 3. Check employees
    console.log('\n3. Checking demo employees...');
    const employees = await db
      .select()
      .from(pidEmployee)
      .where(
        and(
          eq(pidEmployee.empTenantId, tenant.tenId),
          inArray(pidEmployee.empEmployeeNumber, DEMO_EMPLOYEE_NUMBERS)
        )
      );

    console.log(`   Found ${employees.length} demo employees:`);
    employees.forEach(emp => {
      console.log(`     - ${emp.empEmployeeNumber}: ${emp.empCurrentStatusCode}`);
    });

    if (employees.length < EXPECTED_EMPLOYEES) {
      console.log(`   ⚠️  Expected ${EXPECTED_EMPLOYEES} employees, found ${employees.length}`);
      console.log('   Run: npm run db:seed:demo');
    } else {
      console.log(`   ✅ All ${EXPECTED_EMPLOYEES} demo employees found`);
    }

    // 4. Check contracts
    console.log('\n4. Checking demo contracts...');
    const contracts = await db
      .select()
      .from(pidEmpContract)
      .where(
        and(
          eq(pidEmpContract.ctrTenantId, tenant.tenId),
          inArray(pidEmpContract.ctrEmpId, employees.map(e => e.empId))
        )
      );

    console.log(`   Found ${contracts.length} contracts`);
    
    if (contracts.length < EXPECTED_CONTRACTS) {
      console.log(`   ⚠️  Expected ${EXPECTED_CONTRACTS} contracts, found ${contracts.length}`);
    } else {
      console.log(`   ✅ All ${EXPECTED_CONTRACTS} contracts found`);
    }

    // 5. Check contacts
    console.log('\n5. Checking demo contacts...');
    const personIds = employees.map(e => e.empPerId);
    const contacts = await db
      .select()
      .from(pidPersonContact)
      .where(inArray(pidPersonContact.pcoPerId, personIds));

    console.log(`   Found ${contacts.length} contacts`);
    
    if (contacts.length < EXPECTED_CONTACTS) {
      console.log(`   ⚠️  Expected at least ${EXPECTED_CONTACTS} contacts, found ${contacts.length}`);
    } else {
      console.log(`   ✅ Found ${contacts.length} contacts (expected: ${EXPECTED_CONTACTS})`);
    }

    // 6. Check wellness profiles
    console.log('\n6. Checking demo wellness profiles...');
    const profiles = await db
      .select()
      .from(pidWellnessProfile)
      .where(
        and(
          eq(pidWellnessProfile.wepTenantId, tenant.tenId),
          inArray(pidWellnessProfile.wepEmpId, employees.map(e => e.empId))
        )
      );

    console.log(`   Found ${profiles.length} wellness profiles`);
    
    if (profiles.length < EXPECTED_WELLNESS_PROFILES) {
      console.log(`   ⚠️  Expected ${EXPECTED_WELLNESS_PROFILES} wellness profiles, found ${profiles.length}`);
    } else {
      console.log(`   ✅ All ${EXPECTED_WELLNESS_PROFILES} wellness profiles found`);
    }

    // Summary
    console.log('\n📊 Verification Summary:');
    console.log(`   Tenant ID: ${tenant.tenId}`);
    console.log(`   Persons: ${totalPersons} (expected: ${EXPECTED_PERSONS})`);
    console.log(`   Employees: ${employees.length} (expected: ${EXPECTED_EMPLOYEES})`);
    console.log(`   Contracts: ${contracts.length} (expected: ${EXPECTED_CONTRACTS})`);
    console.log(`   Contacts: ${contacts.length} (expected: ${EXPECTED_CONTACTS})`);
    console.log(`   Wellness Profiles: ${profiles.length} (expected: ${EXPECTED_WELLNESS_PROFILES})`);

    const allGood = 
      employees.length >= EXPECTED_EMPLOYEES &&
      contracts.length >= EXPECTED_CONTRACTS &&
      contacts.length >= EXPECTED_CONTACTS &&
      profiles.length >= EXPECTED_WELLNESS_PROFILES;

    if (allGood) {
      console.log('\n✅ Demo data is ready!');
      console.log(`\n💡 Use tenant ID ${tenant.tenId} in X-Tenant-ID header for API requests`);
      process.exit(0);
    } else {
      console.log('\n⚠️  Some demo data is missing. Run: npm run db:seed:demo');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await db.execute(sql`SELECT 1`); // Keep connection alive
  }
}

verifyDemoData();
