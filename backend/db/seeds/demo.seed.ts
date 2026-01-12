#!/usr/bin/env tsx
/**
 * Demo Seed Data Script
 * Creates demo tenant with sample org + people for development
 * 
 * This script is idempotent - safe to run multiple times.
 * It will check if demo data exists before creating it.
 */

import { db } from '../../src/core/db/client.js';
import { sysTenant, pidPerson, pidEmployee, pidEmpContract, pidPersonContact, pidWellnessProfile } from '../../src/core/db/schema/people.js';
import { sql, eq, and, inArray } from 'drizzle-orm';

const DEMO_TENANT_NAME = 'Demo Company';
const DEMO_EMPLOYEE_NUMBERS = ['EMP001', 'EMP002', 'EMP003'];

async function seedDemo() {
  try {
    console.log('🌱 Starting demo seed...');

    // 1. Create or get demo tenant (idempotent)
    console.log('Checking for demo tenant...');
    let tenant = await db
      .select()
      .from(sysTenant)
      .where(eq(sysTenant.tenName, DEMO_TENANT_NAME))
      .limit(1);

    if (tenant.length === 0) {
      console.log('Creating demo tenant...');
      const [newTenant] = await db.insert(sysTenant).values({ tenName: DEMO_TENANT_NAME }).returning();
      tenant = [newTenant];
      console.log(`✅ Created tenant: ${tenant[0].tenName} (ID: ${tenant[0].tenId})`);
    } else {
      console.log(`✅ Found existing tenant: ${tenant[0].tenName} (ID: ${tenant[0].tenId})`);
    }

    const tenantId = tenant[0].tenId;

    // 2. Check for existing demo employees to find associated persons
    console.log('Checking for existing demo employees...');
    const existingEmployees = await db
      .select()
      .from(pidEmployee)
      .where(
        and(
          eq(pidEmployee.empTenantId, tenantId),
          inArray(pidEmployee.empEmployeeNumber, DEMO_EMPLOYEE_NUMBERS)
        )
      );

    let createdPersons = [];
    
    if (existingEmployees.length === DEMO_EMPLOYEE_NUMBERS.length) {
      console.log(`✅ Found ${existingEmployees.length} existing demo employees`);
      // Get persons associated with existing employees
      const personIds = existingEmployees.map(e => e.empPerId);
      createdPersons = await db
        .select()
        .from(pidPerson)
        .where(inArray(pidPerson.perId, personIds));
      console.log(`✅ Found ${createdPersons.length} associated persons`);
    } else {
      // Need to create persons and employees
      console.log('Creating demo persons...');
      const persons = [
        {
          perFirstName: 'John',
          perMiddleName: 'Michael',
          perLastName: 'Doe',
          perDisplayName: 'John Michael Doe',
          perGenderCode: 'MALE',
          perDateOfBirth: new Date('1990-05-15'),
          perNationalityCode: 'KE',
        },
        {
          perFirstName: 'Jane',
          perLastName: 'Smith',
          perDisplayName: 'Jane Smith',
          perGenderCode: 'FEMALE',
          perDateOfBirth: new Date('1992-08-20'),
          perNationalityCode: 'KE',
        },
        {
          perFirstName: 'David',
          perLastName: 'Johnson',
          perDisplayName: 'David Johnson',
          perGenderCode: 'MALE',
          perDateOfBirth: new Date('1988-03-10'),
          perNationalityCode: 'KE',
        },
        {
          perFirstName: 'Sarah',
          perLastName: 'Williams',
          perDisplayName: 'Sarah Williams',
          perGenderCode: 'FEMALE',
          perDateOfBirth: new Date('1995-11-25'),
          perNationalityCode: 'KE',
        },
        {
          perFirstName: 'Michael',
          perLastName: 'Brown',
          perDisplayName: 'Michael Brown',
          perGenderCode: 'MALE',
          perDateOfBirth: new Date('1987-07-05'),
          perNationalityCode: 'KE',
        },
      ];

      for (const personData of persons) {
        const [person] = await db.insert(pidPerson).values(personData).returning();
        createdPersons.push(person);
      }
      console.log(`✅ Created ${createdPersons.length} persons`);
    }

    // 3. Create demo employees (idempotent)
    let createdEmployees = existingEmployees;
    
    if (createdEmployees.length < DEMO_EMPLOYEE_NUMBERS.length) {
      console.log('Creating demo employees...');
      const employeesToCreate = [
        {
          empTenantId: tenantId,
          empPerId: createdPersons[0].perId,
          empEmployeeNumber: 'EMP001',
          empHireDate: new Date('2023-01-15'),
          empEmploymentTypeCode: 'PERMANENT',
          empCurrentStatusCode: 'ACTIVE',
          empCurrentStatusEffectiveDate: new Date('2023-01-15'),
        },
        {
          empTenantId: tenantId,
          empPerId: createdPersons[1].perId,
          empEmployeeNumber: 'EMP002',
          empHireDate: new Date('2023-03-01'),
          empEmploymentTypeCode: 'PERMANENT',
          empCurrentStatusCode: 'ACTIVE',
          empCurrentStatusEffectiveDate: new Date('2023-03-01'),
        },
        {
          empTenantId: tenantId,
          empPerId: createdPersons[2].perId,
          empEmployeeNumber: 'EMP003',
          empHireDate: new Date('2023-06-10'),
          empEmploymentTypeCode: 'FIXED_TERM',
          empCurrentStatusCode: 'PROBATION',
          empCurrentStatusEffectiveDate: new Date('2023-06-10'),
        },
      ];

      for (const empData of employeesToCreate) {
        // Check if employee already exists
        const existing = await db
          .select()
          .from(pidEmployee)
          .where(
            and(
              eq(pidEmployee.empTenantId, tenantId),
              eq(pidEmployee.empEmployeeNumber, empData.empEmployeeNumber)
            )
          )
          .limit(1);

        if (existing.length === 0) {
          const [employee] = await db.insert(pidEmployee).values(empData).returning();
          createdEmployees.push(employee);
        }
      }
      console.log(`✅ Created/verified ${createdEmployees.length} employees`);
    } else {
      console.log(`✅ All ${createdEmployees.length} demo employees already exist`);
    }

    // 4. Create demo contracts (idempotent)
    console.log('Checking for demo contracts...');
    const existingContracts = await db
      .select()
      .from(pidEmpContract)
      .where(
        and(
          eq(pidEmpContract.ctrTenantId, tenantId),
          inArray(pidEmpContract.ctrEmpId, createdEmployees.map(e => e.empId))
        )
      );

    if (existingContracts.length < 2) {
      console.log('Creating demo contracts...');
      const contracts = [
        {
          ctrTenantId: tenantId,
          ctrEmpId: createdEmployees[0].empId,
          ctrContractTypeCode: 'PERMANENT',
          ctrStartDate: new Date('2023-01-15'),
          ctrStatusCode: 'ACTIVE',
          ctrStandardHoursPerWeek: 40,
          ctrStandardDaysPerWeek: 5,
        },
        {
          ctrTenantId: tenantId,
          ctrEmpId: createdEmployees[1].empId,
          ctrContractTypeCode: 'PERMANENT',
          ctrStartDate: new Date('2023-03-01'),
          ctrStatusCode: 'ACTIVE',
          ctrStandardHoursPerWeek: 40,
          ctrStandardDaysPerWeek: 5,
        },
      ];

      for (const contractData of contracts) {
        // Check if contract already exists
        const existing = await db
          .select()
          .from(pidEmpContract)
          .where(
            and(
              eq(pidEmpContract.ctrTenantId, tenantId),
              eq(pidEmpContract.ctrEmpId, contractData.ctrEmpId)
            )
          )
          .limit(1);

        if (existing.length === 0) {
          await db.insert(pidEmpContract).values(contractData);
        }
      }
      console.log(`✅ Created/verified contracts`);
    } else {
      console.log(`✅ All demo contracts already exist (${existingContracts.length})`);
    }

    // 5. Create demo contacts (idempotent)
    console.log('Checking for demo contacts...');
    const existingContacts = await db
      .select()
      .from(pidPersonContact)
      .where(inArray(pidPersonContact.pcoPerId, createdPersons.map(p => p.perId)));

    if (existingContacts.length < 3) {
      console.log('Creating demo contacts...');
      const contacts = [
        {
          pcoPerId: createdPersons[0].perId,
          pcoContactTypeCode: 'EMAIL',
          pcoContactValue: 'john.doe@demo.com',
          pcoIsPrimary: true,
        },
        {
          pcoPerId: createdPersons[0].perId,
          pcoContactTypeCode: 'MOBILE',
          pcoContactValue: '+254712345678',
          pcoIsPrimary: true,
        },
        {
          pcoPerId: createdPersons[1].perId,
          pcoContactTypeCode: 'EMAIL',
          pcoContactValue: 'jane.smith@demo.com',
          pcoIsPrimary: true,
        },
      ];

      for (const contactData of contacts) {
        // Check if contact already exists
        const existing = await db
          .select()
          .from(pidPersonContact)
          .where(
            and(
              eq(pidPersonContact.pcoPerId, contactData.pcoPerId),
              eq(pidPersonContact.pcoContactTypeCode, contactData.pcoContactTypeCode),
              eq(pidPersonContact.pcoContactValue, contactData.pcoContactValue)
            )
          )
          .limit(1);

        if (existing.length === 0) {
          await db.insert(pidPersonContact).values(contactData);
        }
      }
      console.log(`✅ Created/verified contacts`);
    } else {
      console.log(`✅ All demo contacts already exist (${existingContacts.length})`);
    }

    // 6. Create demo wellness profiles (idempotent)
    console.log('Checking for demo wellness profiles...');
    const existingProfiles = await db
      .select()
      .from(pidWellnessProfile)
      .where(
        and(
          eq(pidWellnessProfile.wepTenantId, tenantId),
          inArray(pidWellnessProfile.wepEmpId, createdEmployees.map(e => e.empId))
        )
      );

    if (existingProfiles.length < 2) {
      console.log('Creating demo wellness profiles...');
      const wellnessProfiles = [
        {
          wepTenantId: tenantId,
          wepEmpId: createdEmployees[0].empId,
          wepConsentFlag: true,
          wepPreferredChannelCode: 'EMAIL',
        },
        {
          wepTenantId: tenantId,
          wepEmpId: createdEmployees[1].empId,
          wepConsentFlag: true,
          wepPreferredChannelCode: 'SMS',
        },
      ];

      for (const profileData of wellnessProfiles) {
        // Check if profile already exists
        const existing = await db
          .select()
          .from(pidWellnessProfile)
          .where(
            and(
              eq(pidWellnessProfile.wepTenantId, tenantId),
              eq(pidWellnessProfile.wepEmpId, profileData.wepEmpId)
            )
          )
          .limit(1);

        if (existing.length === 0) {
          await db.insert(pidWellnessProfile).values(profileData);
        }
      }
      console.log(`✅ Created/verified wellness profiles`);
    } else {
      console.log(`✅ All demo wellness profiles already exist (${existingProfiles.length})`);
    }

    // Get final counts for summary
    const finalContracts = await db
      .select()
      .from(pidEmpContract)
      .where(
        and(
          eq(pidEmpContract.ctrTenantId, tenantId),
          inArray(pidEmpContract.ctrEmpId, createdEmployees.map(e => e.empId))
        )
      );
    
    const finalContacts = await db
      .select()
      .from(pidPersonContact)
      .where(inArray(pidPersonContact.pcoPerId, createdPersons.map(p => p.perId)));
    
    const finalProfiles = await db
      .select()
      .from(pidWellnessProfile)
      .where(
        and(
          eq(pidWellnessProfile.wepTenantId, tenantId),
          inArray(pidWellnessProfile.wepEmpId, createdEmployees.map(e => e.empId))
        )
      );

    console.log('\n✅ Demo seed completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Tenant: ${tenant[0].tenName} (ID: ${tenantId})`);
    console.log(`   - Persons: ${createdPersons.length}`);
    console.log(`   - Employees: ${createdEmployees.length}`);
    console.log(`   - Contracts: ${finalContracts.length}`);
    console.log(`   - Contacts: ${finalContacts.length}`);
    console.log(`   - Wellness Profiles: ${finalProfiles.length}`);
    console.log(`\n💡 Use tenant ID ${tenantId} in X-Tenant-ID header for API requests`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Demo seed failed:', error);
    process.exit(1);
  } finally {
    await db.execute(sql`SELECT 1`); // Keep connection alive
  }
}

seedDemo();
