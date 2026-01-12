#!/usr/bin/env tsx
/**
 * Demo Seed Data Script
 * Creates demo tenant with sample org + people for development
 */

import { db } from '../../src/core/db/client.js';
import { sysTenant, pidPerson, pidEmployee, pidEmpContract, pidPersonContact, pidWellnessProfile } from '../../src/core/db/schema/people.js';
import { sql } from 'drizzle-orm';

async function seedDemo() {
  try {
    console.log('🌱 Starting demo seed...');

    // 1. Create demo tenant
    console.log('Creating demo tenant...');
    const [tenant] = await db.insert(sysTenant).values({ tenName: 'Demo Company' }).returning();
    console.log(`✅ Created tenant: ${tenant.tenName} (ID: ${tenant.tenId})`);

    // 2. Create demo persons
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

    const createdPersons = [];
    for (const personData of persons) {
      const [person] = await db.insert(pidPerson).values(personData).returning();
      createdPersons.push(person);
    }
    console.log(`✅ Created ${createdPersons.length} persons`);

    // 3. Create demo employees
    console.log('Creating demo employees...');
    const employees = [
      {
        empTenantId: tenant.tenId,
        empPerId: createdPersons[0].perId,
        empEmployeeNumber: 'EMP001',
        empHireDate: new Date('2023-01-15'),
        empEmploymentTypeCode: 'PERMANENT',
        empCurrentStatusCode: 'ACTIVE',
        empCurrentStatusEffectiveDate: new Date('2023-01-15'),
      },
      {
        empTenantId: tenant.tenId,
        empPerId: createdPersons[1].perId,
        empEmployeeNumber: 'EMP002',
        empHireDate: new Date('2023-03-01'),
        empEmploymentTypeCode: 'PERMANENT',
        empCurrentStatusCode: 'ACTIVE',
        empCurrentStatusEffectiveDate: new Date('2023-03-01'),
      },
      {
        empTenantId: tenant.tenId,
        empPerId: createdPersons[2].perId,
        empEmployeeNumber: 'EMP003',
        empHireDate: new Date('2023-06-10'),
        empEmploymentTypeCode: 'FIXED_TERM',
        empCurrentStatusCode: 'PROBATION',
        empCurrentStatusEffectiveDate: new Date('2023-06-10'),
      },
    ];

    const createdEmployees = [];
    for (const empData of employees) {
      const [employee] = await db.insert(pidEmployee).values(empData).returning();
      createdEmployees.push(employee);
    }
    console.log(`✅ Created ${createdEmployees.length} employees`);

    // 4. Create demo contracts
    console.log('Creating demo contracts...');
    const contracts = [
      {
        ctrTenantId: tenant.tenId,
        ctrEmpId: createdEmployees[0].empId,
        ctrContractTypeCode: 'PERMANENT',
        ctrStartDate: new Date('2023-01-15'),
        ctrStatusCode: 'ACTIVE',
        ctrStandardHoursPerWeek: 40,
        ctrStandardDaysPerWeek: 5,
      },
      {
        ctrTenantId: tenant.tenId,
        ctrEmpId: createdEmployees[1].empId,
        ctrContractTypeCode: 'PERMANENT',
        ctrStartDate: new Date('2023-03-01'),
        ctrStatusCode: 'ACTIVE',
        ctrStandardHoursPerWeek: 40,
        ctrStandardDaysPerWeek: 5,
      },
    ];

    for (const contractData of contracts) {
      await db.insert(pidEmpContract).values(contractData);
    }
    console.log(`✅ Created ${contracts.length} contracts`);

    // 5. Create demo contacts
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
      await db.insert(pidPersonContact).values(contactData);
    }
    console.log(`✅ Created ${contacts.length} contacts`);

    // 6. Create demo wellness profiles
    console.log('Creating demo wellness profiles...');
    const wellnessProfiles = [
      {
        wepTenantId: tenant.tenId,
        wepEmpId: createdEmployees[0].empId,
        wepConsentFlag: true,
        wepPreferredChannelCode: 'EMAIL',
      },
      {
        wepTenantId: tenant.tenId,
        wepEmpId: createdEmployees[1].empId,
        wepConsentFlag: true,
        wepPreferredChannelCode: 'SMS',
      },
    ];

    for (const profileData of wellnessProfiles) {
      await db.insert(pidWellnessProfile).values(profileData);
    }
    console.log(`✅ Created ${wellnessProfiles.length} wellness profiles`);

    console.log('\n✅ Demo seed completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Tenant: ${tenant.tenName} (ID: ${tenant.tenId})`);
    console.log(`   - Persons: ${createdPersons.length}`);
    console.log(`   - Employees: ${createdEmployees.length}`);
    console.log(`   - Contracts: ${contracts.length}`);
    console.log(`   - Contacts: ${contacts.length}`);
    console.log(`   - Wellness Profiles: ${wellnessProfiles.length}`);
    console.log(`\n💡 Use tenant ID ${tenant.tenId} in X-Tenant-ID header for API requests`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Demo seed failed:', error);
    process.exit(1);
  } finally {
    await db.execute(sql`SELECT 1`); // Keep connection alive
  }
}

seedDemo();
