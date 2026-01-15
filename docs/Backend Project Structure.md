# Backend Project Structure

**Project**: Zimasa PeopleWell (ZPW) Core API  
**Framework**: Node.js 20+ + TypeScript + Fastify  
**Testing**: Vitest + Playwright (E2E)  
**Database**: PostgreSQL + Drizzle ORM  
**Date**: January 2026

---

## Overview

The ZPW backend follows a **modular monolith architecture** with clear separation between shared infrastructure (`core/`) and domain modules (`modules/`). Each module is self-contained with routes, services, repositories, and schemas, while sharing common infrastructure like database, auth, logging, and audit.

---

## Directory Structure

```
backend/
├── db/                              # Database migrations and seeds
│   ├── migrations/                  # Drizzle migration files
│   │   ├── 0000_*.sql
│   │   └── meta/
│   │       ├── _journal.json
│   │       └── 0000_snapshot.json
│   ├── init/                        # Initial SQL scripts
│   │   └── 001_seed_tenants.sql
│   └── seeds/                       # Seed scripts
│       └── demo.seed.ts
│
├── scripts/                         # Utility scripts
│   ├── run-migrations.ts           # Migration runner
│   ├── verify-db.ts                # Database verification
│   └── verify-demo-data.ts         # Demo data verification
│
├── src/
│   ├── core/                        # Shared infrastructure
│   │   ├── auth/                    # Authentication & authorization
│   │   │   ├── auth.middleware.ts   # JWT validation middleware
│   │   │   └── tenant.middleware.ts # Tenant context middleware
│   │   │
│   │   ├── audit/                   # Audit logging
│   │   │   ├── audit.service.ts     # Audit event recording
│   │   │   └── types.ts              # Audit type definitions
│   │   │
│   │   ├── config/                  # Configuration
│   │   │   └── env.ts               # Environment variable validation
│   │   │
│   │   ├── db/                      # Database layer
│   │   │   ├── client.ts            # Drizzle database client
│   │   │   └── schema/              # Database schemas
│   │   │       └── people.ts        # PID_* table definitions
│   │   │
│   │   ├── health/                  # Health checks
│   │   │   └── routes.ts            # /health and /ready endpoints
│   │   │
│   │   └── logger/                  # Logging
│   │       └── index.ts             # Winston logger configuration
│   │
│   ├── modules/                     # Domain modules
│   │   ├── people/                  # People Core module (PID_*)
│   │   │   ├── index.ts            # Module exports
│   │   │   ├── repositories/       # Data access layer
│   │   │   │   ├── __tests__/     # Repository tests
│   │   │   │   │   ├── employee.repository.test.ts
│   │   │   │   │   └── person.repository.test.ts
│   │   │   │   ├── base.repository.ts
│   │   │   │   ├── employee.repository.ts
│   │   │   │   ├── person.repository.ts
│   │   │   │   ├── contract.repository.ts
│   │   │   │   ├── dependent.repository.ts
│   │   │   │   ├── employment-history.repository.ts
│   │   │   │   ├── person-contact.repository.ts
│   │   │   │   ├── person-identifier.repository.ts
│   │   │   │   ├── qualification.repository.ts
│   │   │   │   ├── status-history.repository.ts
│   │   │   │   ├── wellness-profile.repository.ts
│   │   │   │   ├── wellness-profile-tag.repository.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── routes/             # API routes (controllers)
│   │   │   │   ├── __tests__/     # Route tests
│   │   │   │   │   └── employee.routes.test.ts
│   │   │   │   ├── employee.routes.ts
│   │   │   │   ├── person.routes.ts
│   │   │   │   ├── contract.routes.ts
│   │   │   │   ├── dependent.routes.ts
│   │   │   │   ├── employment-history.routes.ts
│   │   │   │   ├── person-contact.routes.ts
│   │   │   │   ├── person-identifier.routes.ts
│   │   │   │   ├── qualification.routes.ts
│   │   │   │   ├── status-history.routes.ts
│   │   │   │   ├── wellness-profile.routes.ts
│   │   │   │   ├── wellness-profile-tag.routes.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── schemas/            # Zod validation schemas
│   │   │   │   ├── employee.schemas.ts
│   │   │   │   ├── person.schemas.ts
│   │   │   │   ├── contract.schemas.ts
│   │   │   │   ├── dependent.schemas.ts
│   │   │   │   ├── employment-history.schemas.ts
│   │   │   │   ├── person-contact.schemas.ts
│   │   │   │   ├── person-identifier.schemas.ts
│   │   │   │   ├── qualification.schemas.ts
│   │   │   │   ├── status-history.schemas.ts
│   │   │   │   ├── wellness-profile.schemas.ts
│   │   │   │   ├── wellness-profile-tag.schemas.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── services/            # Business logic layer
│   │   │       ├── __tests__/     # Service tests
│   │   │       │   ├── employee.service.test.ts
│   │   │       │   └── person.service.test.ts
│   │   │       ├── base.service.ts
│   │   │       ├── employee.service.ts
│   │   │       ├── person.service.ts
│   │   │       ├── contract.service.ts
│   │   │       ├── dependent.service.ts
│   │   │       ├── employment-history.service.ts
│   │   │       ├── person-contact.service.ts
│   │   │       ├── person-identifier.service.ts
│   │   │       ├── qualification.service.ts
│   │   │       ├── status-history.service.ts
│   │   │       ├── wellness-profile.service.ts
│   │   │       ├── wellness-profile-tag.service.ts
│   │   │       └── index.ts
│   │   │
│   │   ├── org/                    # Work Lattice module (ORG_*)
│   │   │   ├── index.ts
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   ├── schemas/
│   │   │   └── services/
│   │   │
│   │   ├── leave/                  # Leave & Absence module (LEA_*)
│   │   │   ├── index.ts
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   ├── schemas/
│   │   │   └── services/
│   │   │
│   │   ├── performance/            # Performance module (PRF_*)
│   │   │   ├── index.ts
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   ├── schemas/
│   │   │   └── services/
│   │   │
│   │   ├── gamification/           # Gamification module (GAM_*)
│   │   │   ├── index.ts
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   ├── schemas/
│   │   │   └── services/
│   │   │
│   │   └── ai/                     # AI module (AIS_*)
│   │       ├── index.ts
│   │       ├── repositories/
│   │       ├── routes/
│   │       ├── schemas/
│   │       └── services/
│   │
│   ├── tests/                      # Test files
│   │   ├── unit/                   # Unit tests
│   │   │   ├── repositories/
│   │   │   │   ├── employee.repository.test.ts
│   │   │   │   └── person.repository.test.ts
│   │   │   └── services/
│   │   │       ├── employee.service.test.ts
│   │   │       └── person.service.test.ts
│   │   │
│   │   ├── integration/            # Integration tests
│   │   │   ├── critical-flows.test.ts
│   │   │   └── db-constraints.test.ts
│   │   │
│   │   ├── e2e/                    # End-to-end tests (Playwright)
│   │   │   ├── helpers/
│   │   │   │   └── page-helpers.ts
│   │   │   └── people-core.spec.ts
│   │   │
│   │   ├── helpers/                # Test utilities
│   │   │   ├── test-db.ts         # Database setup/teardown
│   │   │   ├── test-factories.ts  # Test data factories
│   │   │   ├── test-helpers.ts    # Test helper functions
│   │   │   └── verify-data.ts     # Data verification helpers
│   │   │
│   │   ├── db.test.ts             # Database connection test
│   │   └── health.test.ts         # Health endpoint test
│   │
│   ├── app.ts                      # Fastify app bootstrap
│   └── index.ts                    # Application entry point
│
├── .eslintrc.json                  # ESLint configuration
├── check-skip-auth.js              # Auth guard script
├── drizzle.config.ts               # Drizzle Kit configuration
├── playwright.config.ts            # Playwright E2E test config
├── tsconfig.json                   # TypeScript configuration
├── vitest.config.ts                # Vitest configuration
├── Dockerfile                      # Docker build configuration
├── package.json
└── .env.example                    # Environment variables template
```

---

## Architecture Principles

### 1. Modular Monolith

The backend is organized as a **modular monolith** where:

- **Shared infrastructure** lives in `core/` (DB, auth, logging, audit, config)
- **Domain modules** live in `modules/` (people, org, leave, performance, gamification, ai)
- **Modules can import from each other** via direct function calls (same process)
- **All modules share the same database** (PostgreSQL with tenant isolation)
- **Single deployment unit** (one Fastify app, one container)

### 2. Layered Architecture

Each module follows a **layered architecture**:

```
Routes (API Layer)
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access)
    ↓
Database (PostgreSQL via Drizzle)
```

### 3. Domain-Driven Design

- **Domain prefixes**: Each module uses a domain prefix (PID_, ORG_, LEA_, PRF_, GAM_, AIS_)
- **Entity naming**: Follows P9 naming conventions (e.g., `PID_PERSON`, `ORG_UNIT`)
- **Module boundaries**: Clear boundaries with well-defined interfaces

---

## Module Structure Pattern

Each domain module follows this structure:

```
module-name/
├── index.ts                    # Module exports (route registration)
├── repositories/               # Data access layer
│   ├── __tests__/            # Repository unit tests
│   ├── base.repository.ts    # Base repository with common methods
│   ├── {entity}.repository.ts # Entity-specific repositories
│   └── index.ts
├── routes/                    # API routes (Fastify route handlers)
│   ├── __tests__/           # Route integration tests
│   ├── {entity}.routes.ts   # Entity route definitions
│   └── index.ts
├── schemas/                   # Zod validation schemas
│   ├── {entity}.schemas.ts  # Request/response schemas
│   └── index.ts
└── services/                  # Business logic layer
    ├── __tests__/           # Service unit tests
    ├── base.service.ts     # Base service with common logic
    ├── {entity}.service.ts # Entity-specific services
    └── index.ts
```

---

## Testing with Vitest

### Vitest Configuration

**File**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    env: {
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://...',
      NODE_ENV: 'test',
      SKIP_AUTH: 'true',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.test.ts', '**/__tests__/**'],
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    retry: 2,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // Sequential execution to avoid DB conflicts
      },
    },
    isolate: true,
    sequence: {
      shuffle: false,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Organization

- **Unit tests**: `src/tests/unit/` - Test individual functions/classes in isolation
- **Integration tests**: `src/tests/integration/` - Test module interactions and database
- **E2E tests**: `src/tests/e2e/` - Full API tests with Playwright
- **Co-located tests**: `__tests__/` folders within modules (optional)

### Test Utilities

**File**: `src/tests/helpers/test-db.ts`

```typescript
import { db } from '../../core/db/client.js';
import { sql } from 'drizzle-orm';

export async function setupTestDb() {
  // Setup test database (create tables, etc.)
}

export async function cleanupTestDb() {
  // Clean up test data
  await db.execute(sql`TRUNCATE TABLE pid_employee CASCADE`);
  await db.execute(sql`TRUNCATE TABLE pid_person CASCADE`);
}

export async function truncatePeopleTables() {
  // Truncate all people-related tables
}
```

**File**: `src/tests/helpers/test-factories.ts`

```typescript
import { TestFactories } from './test-factories.js';

export class TestFactories {
  static createPerson(overrides = {}) {
    return {
      perFirstName: 'John',
      perMiddleName: 'Middle',
      perLastName: 'Doe',
      ...overrides,
    };
  }

  static createEmployee(tenantId: number, personId: number, overrides = {}) {
    return {
      empTenantId: tenantId,
      empPerId: personId,
      empEmployeeNumber: `EMP${Date.now()}`,
      ...overrides,
    };
  }
}
```

### Example Repository Test

**File**: `src/modules/people/repositories/__tests__/employee.repository.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EmployeeRepository } from '../employee.repository.js';
import { truncatePeopleTables } from '../../../../tests/helpers/test-db.js';
import { TestFactories } from '../../../../tests/helpers/test-factories.js';
import { createTestPerson } from '../../../../tests/helpers/test-helpers.js';

describe('EmployeeRepository', () => {
  const employeeRepo = new EmployeeRepository();
  const tenantId = 1;

  beforeEach(async () => {
    await truncatePeopleTables();
  });

  afterEach(async () => {
    await truncatePeopleTables();
  });

  describe('create', () => {
    it('should create employee with tenant isolation', async () => {
      const person = await createTestPerson();
      const employeeData = TestFactories.createEmployee(tenantId, person.perId);
      const employee = await employeeRepo.create(employeeData);

      expect(employee.empId).toBeDefined();
      expect(employee.empTenantId).toBe(tenantId);
      expect(employee.empPerId).toBe(person.perId);
    });
  });
});
```

### Example Service Test

**File**: `src/modules/people/services/__tests__/employee.service.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EmployeeService } from '../employee.service.js';
import { PersonRepository } from '../../repositories/person.repository.js';
import { truncatePeopleTables } from '../../../../tests/helpers/test-db.js';
import { TestFactories } from '../../../../tests/helpers/test-factories.js';

// Mock audit service
vi.mock('../../../../core/audit/audit.service.js', () => ({
  recordAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

describe('EmployeeService', () => {
  const employeeService = new EmployeeService();
  const personRepo = new PersonRepository();

  beforeEach(async () => {
    await truncatePeopleTables();
  });

  afterEach(async () => {
    await truncatePeopleTables();
  });

  describe('create', () => {
    it('should create employee with person data', async () => {
      const employeeData = {
        personData: {
          perFirstName: 'John',
          perLastName: 'Doe',
        },
        empEmployeeNumber: 'EMP001',
      };

      const employee = await employeeService.create(employeeData, 1, 1);

      expect(employee.empId).toBeDefined();
      expect(employee.empEmployeeNumber).toBe('EMP001');
      expect(employee.empTenantId).toBe(1);
    });
  });
});
```

### Example Integration Test

**File**: `src/tests/integration/critical-flows.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../../app.js';
import type { FastifyInstance } from 'fastify';
import { setupTestDb, cleanupTestDb } from '../helpers/test-db.js';
import { TestFactories } from '../helpers/test-factories.js';

describe('Critical Flows', () => {
  let app: FastifyInstance;

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

  describe('Person → Employee → Contract Flow', () => {
    it('should create person, then employee, then contract', async () => {
      // Create person
      const personResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/people/persons',
        payload: TestFactories.createPerson(),
      });
      expect(personResponse.statusCode).toBe(201);
      const person = JSON.parse(personResponse.body);

      // Create employee
      const employeeResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/people/employees',
        payload: {
          personId: person.perId,
          empEmployeeNumber: 'EMP001',
        },
      });
      expect(employeeResponse.statusCode).toBe(201);
      const employee = JSON.parse(employeeResponse.body);

      // Create contract
      const contractResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/people/contracts',
        payload: {
          empId: employee.empId,
          ctrContractTypeCode: 'PERMANENT',
          ctrStartDate: '2024-01-01',
        },
      });
      expect(contractResponse.statusCode).toBe(201);
    });
  });
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:unit": "vitest run src/tests/unit",
    "test:integration": "vitest run src/tests/integration",
    "test:all": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

---

## API Design

### Route Registration

**File**: `src/app.ts`

```typescript
import Fastify from 'fastify';
import { registerHealthRoutes } from './core/health/routes.js';
import { registerPeopleRoutes } from './modules/people/routes/index.js';
// ... other modules

export async function buildApp(dbClient?: DbClient) {
  const app = Fastify({ logger: true });

  // Middleware
  await app.register(helmet);
  await app.register(cors, { origin: true });
  await app.register(swagger, { /* ... */ });
  await app.register(swaggerUi, { routePrefix: '/api-docs' });

  // Routes
  await registerHealthRoutes(app, dbClient);
  await registerPeopleRoutes(app);
  // await registerOrgRoutes(app);
  // await registerLeaveRoutes(app);
  // ...

  return app;
}
```

### Route Pattern

**File**: `src/modules/people/routes/employee.routes.ts`

```typescript
import { FastifyInstance } from 'fastify';
import { EmployeeService } from '../services/employee.service.js';
import { employeeSchemas } from '../schemas/employee.schemas.js';
import { requireAuth } from '../../core/auth/auth.middleware.js';
import { requireTenant } from '../../core/auth/tenant.middleware.js';

export async function registerEmployeeRoutes(app: FastifyInstance) {
  const employeeService = new EmployeeService();

  // GET /api/v1/people/employees
  app.get(
    '/api/v1/people/employees',
    {
      preHandler: [requireAuth, requireTenant],
      schema: employeeSchemas.list,
    },
    async (request, reply) => {
      const tenantId = request.tenantId;
      const employees = await employeeService.findAll(tenantId);
      return reply.send(employees);
    },
  );

  // POST /api/v1/people/employees
  app.post(
    '/api/v1/people/employees',
    {
      preHandler: [requireAuth, requireTenant],
      schema: employeeSchemas.create,
    },
    async (request, reply) => {
      const tenantId = request.tenantId;
      const userId = request.userId;
      const employee = await employeeService.create(
        request.body,
        tenantId,
        userId,
      );
      return reply.code(201).send(employee);
    },
  );
}
```

### API Endpoints

Base path: `/api/v1/...`

- **People**: `/api/v1/people/employees`, `/api/v1/people/persons`, etc.
- **Org**: `/api/v1/org/units`, `/api/v1/org/positions`, etc.
- **Leave**: `/api/v1/leave/requests`, `/api/v1/leave/balances`, etc.
- **Performance**: `/api/v1/performance/appraisals`, `/api/v1/performance/checkins`, etc.
- **Gamification**: `/api/v1/gamification/points`, `/api/v1/gamification/badges`, etc.

---

## Database Layer

### Drizzle ORM

**File**: `src/core/db/client.ts`

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/people.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
```

### Schema Definition

**File**: `src/core/db/schema/people.ts`

```typescript
import { pgTable, bigserial, bigint, varchar, timestamp } from 'drizzle-orm/pg-core';

export const pidPerson = pgTable('pid_person', {
  perId: bigserial('per_id', { mode: 'number' }).primaryKey(),
  perFirstName: varchar('per_first_name', { length: 100 }).notNull(),
  perLastName: varchar('per_last_name', { length: 150 }).notNull(),
  // ... audit columns
  perCreatedAt: timestamp('per_created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  perCreatedBy: bigint('per_created_by', { mode: 'number' }),
  perUpdatedAt: timestamp('per_updated_at', { withTimezone: true }),
  perUpdatedBy: bigint('per_updated_by', { mode: 'number' }),
});
```

### Repository Pattern

**File**: `src/modules/people/repositories/employee.repository.ts`

```typescript
import { db } from '../../../core/db/client.js';
import { pidEmployee } from '../../../core/db/schema/people.js';
import { eq, and, isNull } from 'drizzle-orm';
import { BaseRepository } from './base.repository.js';

export class EmployeeRepository extends BaseRepository {
  async findById(id: number, tenantId: number) {
    const [employee] = await db
      .select()
      .from(pidEmployee)
      .where(
        and(
          eq(pidEmployee.empId, id),
          eq(pidEmployee.empTenantId, tenantId),
          isNull(pidEmployee.empDeletedAt),
        ),
      )
      .limit(1);

    return employee || null;
  }

  async create(data: CreateEmployeeData) {
    const [employee] = await db
      .insert(pidEmployee)
      .values({
        ...data,
        empCreatedAt: new Date(),
      })
      .returning();

    return employee;
  }
}
```

---

## Service Layer

### Service Pattern

**File**: `src/modules/people/services/employee.service.ts`

```typescript
import { EmployeeRepository } from '../repositories/employee.repository.js';
import { PersonRepository } from '../repositories/person.repository.js';
import { recordAuditEvent } from '../../../core/audit/audit.service.js';
import { BaseService } from './base.service.js';

export class EmployeeService extends BaseService {
  constructor(
    private employeeRepo = new EmployeeRepository(),
    private personRepo = new PersonRepository(),
  ) {
    super();
  }

  async create(
    data: CreateEmployeeDto,
    tenantId: number,
    userId: number,
  ): Promise<Employee> {
    // Business logic validation
    if (data.personId) {
      const person = await this.personRepo.findById(data.personId);
      if (!person) {
        throw new Error('Person not found');
      }
    }

    // Create employee
    const employee = await this.employeeRepo.create({
      ...data,
      empTenantId: tenantId,
    });

    // Audit logging
    await recordAuditEvent({
      tenantId,
      actorId: userId,
      actorType: 'EMPLOYEE',
      action: 'EMP_CREATED',
      entityType: 'EMPLOYEE',
      entityId: employee.empId,
    });

    return employee;
  }
}
```

---

## Validation with Zod

### Schema Definition

**File**: `src/modules/people/schemas/employee.schemas.ts`

```typescript
import { z } from 'zod';

export const createEmployeeSchema = z.object({
  personId: z.number().optional(),
  personData: z
    .object({
      perFirstName: z.string().min(1).max(100),
      perLastName: z.string().min(1).max(150),
    })
    .optional(),
  empEmployeeNumber: z.string().min(1).max(50),
  empHireDate: z.string().datetime().optional(),
});

export const employeeSchemas = {
  create: {
    body: createEmployeeSchema,
    response: {
      201: z.object({
        empId: z.number(),
        empEmployeeNumber: z.string(),
        // ...
      }),
    },
  },
};
```

---

## Multi-Tenancy

### Tenant Isolation

- **Tenant ID**: Extracted from JWT token or API key context
- **Middleware**: `requireTenant` middleware adds `tenantId` to request
- **Repository queries**: Always filter by `{entity}_tenant_id`
- **Database**: Row-Level Security (RLS) policies enforce isolation

### Tenant Middleware

**File**: `src/core/auth/tenant.middleware.ts`

```typescript
export async function requireTenant(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const tenantId = extractTenantId(request); // From JWT or API key
  if (!tenantId) {
    return reply.code(401).send({ error: 'Tenant ID required' });
  }
  request.tenantId = tenantId;
}
```

---

## Audit Logging

### Audit Service

**File**: `src/core/audit/audit.service.ts`

```typescript
import { recordAuditEvent } from './audit.service.js';

await recordAuditEvent({
  tenantId: 1,
  actorId: userId,
  actorType: 'EMPLOYEE',
  action: 'EMP_CREATED',
  entityType: 'EMPLOYEE',
  entityId: employee.empId,
  metadata: { /* relevant context */ },
});
```

---

## File Naming Conventions

- **Repositories**: `{entity}.repository.ts`
- **Services**: `{entity}.service.ts`
- **Routes**: `{entity}.routes.ts`
- **Schemas**: `{entity}.schemas.ts`
- **Tests**: `{entity}.{layer}.test.ts` (e.g., `employee.repository.test.ts`)
- **Types**: Defined inline or in `types.ts` files

---

## Import Path Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Usage:
```typescript
import { db } from '@/core/db/client';
import { EmployeeService } from '@/modules/people/services/employee.service';
```

---

## Environment Variables

**File**: `.env.example`

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/zpw_db

# Auth
JWT_SECRET=your-secret-key
SKIP_AUTH=false  # Only for development

# Redis (for rate limiting)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info

# Node Environment
NODE_ENV=development
```

---

## Build & Deployment

### Development
```bash
npm run dev          # Start with tsx watch
```

### Production Build
```bash
npm run build       # TypeScript compilation
npm start           # Run compiled JavaScript
```

### Database Migrations
```bash
npm run db:generate  # Generate migration from schema changes
npm run db:migrate   # Apply migrations
npm run db:studio    # Open Drizzle Studio
```

### Testing
```bash
npm test            # Run all tests
npm run test:unit   # Unit tests only
npm run test:integration  # Integration tests only
npm run test:e2e    # E2E tests (Playwright)
npm run test:coverage  # Coverage report
```

---

## Security

### Authentication
- **JWT tokens**: Validated via `@fastify/jwt`
- **Middleware**: `requireAuth` validates token on protected routes
- **Auth guard**: `check-skip-auth.js` prevents `SKIP_AUTH=true` in production

### Rate Limiting
- **Fastify rate limit**: `@fastify/rate-limit` with Redis backend
- **Default**: 100 requests/minute per key/IP
- **Stricter limits**: AI endpoints, bulk operations

### CORS & Helmet
- **CORS**: Configured via `@fastify/cors`
- **Helmet**: Security headers via `@fastify/helmet`

---

## Health Checks

**Endpoints**:
- `GET /health` - Liveness probe (lightweight, no dependencies)
- `GET /ready` - Readiness probe (checks DB, Redis connectivity)

**File**: `src/core/health/routes.ts`

```typescript
app.get('/health', async () => ({ status: 'ok' }));

app.get('/ready', async (request, reply) => {
  // Check database
  await db.execute(sql`SELECT 1`);
  // Check Redis (if configured)
  return { status: 'ready' };
});
```

---

## Observability

### Logging
- **Winston**: Structured JSON logs
- **Log levels**: error, warn, info, debug
- **Output**: Console (dev) or CloudWatch/ELK (prod)

### Metrics
- **Prometheus**: `prom-client` with `/metrics` endpoint
- **Custom metrics**: Domain-specific (e.g., `zpw_leave_requests_total`)

### Tracing
- **OpenTelemetry**: Auto-instrumentation for HTTP and DB
- **Distributed tracing**: Request correlation IDs

---

## References

- [Fastify Documentation](https://www.fastify.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Vitest Documentation](https://vitest.dev/)
- [Zod Documentation](https://zod.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
