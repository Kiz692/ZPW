# People Core System Overview

**Document Version**: 1.0  
**Created**: 2025-01-XX  
**Purpose**: Explain how the People Core system works, its architecture, and data flow

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Data Flow](#data-flow)
3. [People Core Entities](#people-core-entities)
4. [Tenant Isolation](#tenant-isolation)
5. [Audit Logging](#audit-logging)
6. [How It Works](#how-it-works)

---

## System Architecture

### High-Level Overview

People Core is a **multi-tenant HRMS** built with:

- **Backend**: Node.js 20+ with TypeScript, Fastify, PostgreSQL, Drizzle ORM
- **Frontend**: React + TypeScript, Vite, TailwindCSS, shadcn/ui
- **Database**: PostgreSQL with multi-tenant support
- **API**: RESTful API with OpenAPI/Swagger documentation

### Architecture Layers

```
┌─────────────────────────────────────────┐
│         Frontend (React/TS)             │
│  - Person List/Detail Pages             │
│  - Employee List/Detail Pages           │
│  - Forms & Dialogs                      │
└──────────────┬──────────────────────────┘
               │ HTTP/JSON
               │ X-Tenant-ID Header
┌──────────────▼──────────────────────────┐
│      Backend API (Fastify)              │
│  - Routes (/api/v1/people/...)         │
│  - Validation (Zod schemas)            │
│  - Authentication Middleware           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Service Layer                      │
│  - Business Logic                      │
│  - Validation Rules                    │
│  - Audit Logging                       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Repository Layer (Drizzle)         │
│  - Database Queries                    │
│  - Tenant Filtering                    │
│  - Data Mapping                        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      PostgreSQL Database                │
│  - PID_* tables (People Core)          │
│  - SYS_* tables (System)               │
│  - Multi-tenant isolation              │
└─────────────────────────────────────────┘
```

---

## Data Flow

### Creating an Employee

1. **User Action**: User fills out employee form in frontend
2. **Frontend**: Sends POST request to `/api/v1/people/employees` with:
   - `X-Tenant-ID` header (tenant context)
   - `X-User-ID` header (user context)
   - Employee data in JSON body
3. **Backend Route**: Receives request, validates headers
4. **Service Layer**: 
   - Validates employee data (Zod schema)
   - Checks business rules (e.g., unique employee number)
   - Creates person if needed
   - Creates employee record
   - Records audit event
5. **Repository Layer**: 
   - Inserts into `pid_employee` table
   - Filters by tenant ID
   - Populates audit fields (created_at, created_by)
6. **Database**: Stores employee record with tenant isolation
7. **Response**: Returns created employee with ID
8. **Frontend**: Updates UI, shows success message

### Reading Employee List

1. **User Action**: User navigates to employees page
2. **Frontend**: Sends GET request to `/api/v1/people/employees` with tenant header
3. **Backend Route**: Receives request
4. **Service Layer**: Calls repository to find all employees
5. **Repository Layer**: 
   - Queries `pid_employee` table
   - Filters by `emp_tenant_id = <tenant_id>`
   - Excludes soft-deleted records
6. **Database**: Returns only tenant's employees
7. **Response**: Returns array of employees
8. **Frontend**: Displays employees in table/list

---

## People Core Entities

### Entity Relationships

```
PID_PERSON (Global - no tenant)
  ├── PID_EMPLOYEE (Tenant-scoped)
  │     ├── PID_EMP_CONTRACT
  │     ├── PID_EMP_STATUS_HISTORY
  │     ├── PID_DEPENDENT
  │     └── PID_WELLNESS_PROFILE
  │           └── PID_WELLNESS_PROFILE_TAG
  ├── PID_PERSON_CONTACT
  ├── PID_PERSON_IDENTIFIER
  ├── PID_QUALIFICATION
  └── PID_EMPLOYMENT_HISTORY
```

### Key Entities

#### 1. Person (`PID_PERSON`)
- **Global entity** (no tenant)
- Represents a physical person
- Can be linked to multiple employees (different tenants)
- Fields: name, date of birth, gender, nationality

#### 2. Employee (`PID_EMPLOYEE`)
- **Tenant-scoped** (requires `emp_tenant_id`)
- Represents employment relationship
- Links to Person via `emp_per_id`
- Fields: employee number, hire date, status, employment type

#### 3. Contract (`PID_EMP_CONTRACT`)
- **Tenant-scoped**
- Employment contract details
- Links to Employee via `ctr_emp_id`
- Fields: contract type, start/end dates, hours per week

#### 4. Wellness Profile (`PID_WELLNESS_PROFILE`)
- **Tenant-scoped**
- Wellness preferences and consent
- Links to Employee via `wep_emp_id`
- Fields: consent flag, preferred channel

---

## Tenant Isolation

### How It Works

**Tenant isolation** ensures that each tenant (company) can only see and modify their own data.

### Implementation

1. **Database Level**:
   - Tenant-scoped tables have `<prefix>_tenant_id` column
   - All queries filter by tenant ID
   - Foreign keys enforce relationships within tenant

2. **Application Level**:
   - `X-Tenant-ID` header required on all requests
   - Middleware extracts tenant ID from header
   - Service layer enforces tenant filtering
   - Repository layer adds tenant filter to all queries

3. **Example**:
   ```sql
   -- Tenant 1 can only see their employees
   SELECT * FROM pid_employee 
   WHERE emp_tenant_id = 1 
   AND emp_deleted_at IS NULL;
   
   -- Tenant 2 cannot see Tenant 1's employees
   SELECT * FROM pid_employee 
   WHERE emp_tenant_id = 2 
   AND emp_deleted_at IS NULL;
   ```

### Global vs Tenant-Scoped

- **Global Entities**: `PID_PERSON` (no tenant column)
  - Shared across all tenants
  - Used for identity management
  
- **Tenant-Scoped Entities**: `PID_EMPLOYEE`, `PID_EMP_CONTRACT`, etc.
  - Have `*_tenant_id` column
  - Isolated per tenant

---

## Audit Logging

### Two-Layer Audit System

#### 1. Row-Level Audit Columns

Every business table has audit columns:
- `<prefix>_created_at` - When record was created
- `<prefix>_created_by` - User ID who created it
- `<prefix>_updated_at` - When record was last updated
- `<prefix>_updated_by` - User ID who updated it
- `<prefix>_deleted_at` - Soft delete timestamp (if deleted)
- `<prefix>_deleted_by` - User ID who deleted it

#### 2. Central Audit Log (`SYS_AUDIT_LOG`)

Records security-critical events:
- `aud_id` - Audit log ID
- `aud_tenant_id` - Tenant context
- `aud_actor_id` - User or service who performed action
- `aud_action` - Action code (e.g., `EMP_CREATED`, `LEAVE_APPROVED`)
- `aud_entity_type` - Entity type (e.g., `EMPLOYEE`, `LEAVE_REQUEST`)
- `aud_entity_id` - ID of affected entity
- `aud_metadata` - JSON with additional context
- `aud_timestamp` - When event occurred

### Example Audit Flow

When creating an employee:
1. Repository sets `emp_created_at = NOW()`, `emp_created_by = <user_id>`
2. Service calls `recordAuditEvent()` with:
   - Action: `EMP_CREATED`
   - Entity: `EMPLOYEE`
   - Entity ID: new employee ID
   - Metadata: employee number, person ID, etc.
3. Audit log entry created in `SYS_AUDIT_LOG`

---

## How It Works

### Request Flow Example

**Scenario**: User creates a new employee

```
1. Frontend Form Submission
   ↓
2. POST /api/v1/people/employees
   Headers: X-Tenant-ID: 1, X-User-ID: 1
   Body: { personId: 123, empEmployeeNumber: "EMP004", ... }
   ↓
3. Route Handler (employee.routes.ts)
   - Validates headers
   - Extracts tenant ID and user ID
   - Calls service
   ↓
4. Service (employee.service.ts)
   - Validates data (Zod schema)
   - Checks business rules
   - Creates employee via repository
   - Records audit event
   ↓
5. Repository (employee.repository.ts)
   - Builds query with tenant filter
   - Inserts into pid_employee
   - Sets audit fields
   ↓
6. Database
   - Stores employee with emp_tenant_id = 1
   - Returns new employee record
   ↓
7. Response
   - Returns 201 Created with employee data
   ↓
8. Frontend
   - Updates UI
   - Shows success message
```

### Data Persistence

- **Transactions**: Critical operations use database transactions
- **Soft Deletes**: Records marked as deleted, not physically removed
- **Audit Trail**: All changes tracked via audit columns and audit log
- **Tenant Isolation**: Enforced at database and application level

### Error Handling

- **Validation Errors**: 400 Bad Request with error details
- **Not Found**: 404 Not Found
- **Tenant Isolation Violations**: 404 (appears as not found to wrong tenant)
- **Server Errors**: 500 Internal Server Error with error ID for tracking

---

## Key Concepts

### Multi-Tenancy
- Each tenant (company) has isolated data
- Tenant ID required on all requests
- Database queries automatically filter by tenant

### Global vs Tenant Data
- **Person**: Global (shared identity)
- **Employee**: Tenant-scoped (employment relationship)
- **Contract**: Tenant-scoped
- **Wellness Profile**: Tenant-scoped

### Audit Trail
- Every change is tracked
- Who did it, when, and what changed
- Required for compliance and debugging

### API-First Design
- All operations accessible via REST API
- Frontend is a client of the API
- API can be used by other systems

---

## Next Steps

- See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for how to test the system
- See [DEMO_GUIDE.md](./DEMO_GUIDE.md) for demo preparation
- See P1-P14 documentation for detailed specifications

---

**Document History**
- v1.0 (2025-01-XX): Initial system overview for People Core
