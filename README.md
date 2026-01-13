# Zimasa PeopleWell (ZPW)

**Wellness-focused HRMS for SMEs** - A multi-tenant SaaS platform that embeds wellness and health engagement into everyday employee journeys.

## Overview

Zimasa PeopleWell is an HRMS optimized for wellness, productivity, and health engagement. It's designed for small to medium enterprises (SMEs), single-country deployments, and is industry-agnostic. The platform is delivered as a multi-tenant SaaS with optional dedicated instances.

## Architecture

- **Backend**: Node.js 20+ with TypeScript, Fastify, PostgreSQL, Drizzle ORM
- **Frontend**: React + TypeScript, Vite, TailwindCSS, shadcn/ui
- **Database**: PostgreSQL with multi-tenancy support
- **Authentication**: JWT-based with OIDC-compatible IdP support
- **API Style**: RESTful API-first architecture

## People Core Module

The People Core module is the foundation of ZPW, managing all person and employee-related data. It provides a comprehensive API for managing:

- **Persons** - Global person identity (not tenant-scoped)
- **Employees** - Tenant-scoped employee records
- **Contracts** - Employment contracts and terms
- **Contacts** - Person contact information (email, phone, address)
- **Identifiers** - National IDs, passports, tax PINs, etc.
- **Dependents** - Employee dependents for health coverage
- **Qualifications** - Education and professional qualifications
- **Employment History** - Previous employment records
- **Status History** - Employee status change tracking
- **Wellness Profiles** - Wellness engagement and consent management
- **Wellness Profile Tags** - Wellness categorization tags

## API Base URL

All People Core endpoints are prefixed with:

```
/api/v1/people
```

## Authentication & Multi-Tenancy

All People Core endpoints require:

1. **Authentication**: JWT token in `Authorization` header or `X-User-ID` header
2. **Tenant Context**: `X-Tenant-ID` header (required for tenant-scoped resources)

### Headers

```
X-Tenant-ID: <tenant_id>
X-User-ID: <user_id>
Authorization: Bearer <jwt_token>  # Optional if X-User-ID is provided
```

## API Endpoints

### Person Management

Persons are **global entities** (not tenant-scoped) representing unique individuals.

#### Create Person
```http
POST /api/v1/people/persons
Content-Type: application/json

{
  "perFirstName": "John",
  "perLastName": "Doe",
  "perMiddleName": "Middle",  // Optional
  "perDisplayName": "John Middle Doe",  // Optional, auto-generated if not provided
  "perGenderCode": "MALE",  // Optional
  "perDateOfBirth": "1990-01-01",  // Optional, format: YYYY-MM-DD
  "perNationalityCode": "KE"  // Optional
}
```

**Response**: `201 Created` with person object including `perId`

#### Get Person by ID
```http
GET /api/v1/people/persons/:id
```

#### Search Persons by Name
```http
GET /api/v1/people/persons/search?q=<search_term>
```

Minimum 2 characters required for search term.

#### Update Person
```http
PUT /api/v1/people/persons/:id
Content-Type: application/json

{
  "perFirstName": "Jane",
  "perLastName": "Smith"
  // ... other fields
}
```

#### Delete Person (Soft Delete)
```http
DELETE /api/v1/people/persons/:id
```

### Employee Management

Employees are **tenant-scoped** and represent a person's employment relationship with a specific tenant organization.

#### Create Employee
```http
POST /api/v1/people/employees
Content-Type: application/json
X-Tenant-ID: 1

{
  "personId": 123,  // Existing person ID
  // OR create person inline:
  "personData": {
    "perFirstName": "John",
    "perLastName": "Doe"
  },
  "empEmployeeNumber": "EMP001",  // Required, must be unique within tenant
  "empHireDate": "2024-01-01",  // Format: YYYY-MM-DD
  "empEmploymentTypeCode": "PERMANENT",  // PERMANENT, CONTRACT, INTERN, etc.
  "empCurrentStatusCode": "ACTIVE",  // ACTIVE, PROBATION, ON_LEAVE, etc.
  "empCurrentStatusEffectiveDate": "2024-01-01"  // Optional
}
```

**Response**: `201 Created` with employee object including `empId`

**Business Rules**:
- Employee number must be unique within tenant
- One employee record per person per tenant
- Status history is automatically created on employee creation

#### Get Employee by ID
```http
GET /api/v1/people/employees/:id
X-Tenant-ID: 1
```

#### List Employees
```http
GET /api/v1/people/employees?limit=50&offset=0
X-Tenant-ID: 1
```

#### Update Employee
```http
PUT /api/v1/people/employees/:id
Content-Type: application/json
X-Tenant-ID: 1

{
  "empEmployeeNumber": "EMP002",
  "empHireDate": "2024-01-15",
  "empEmploymentTypeCode": "CONTRACT"
}
```

#### Update Employee Status
```http
PATCH /api/v1/people/employees/:id/status
Content-Type: application/json
X-Tenant-ID: 1

{
  "statusCode": "PROBATION",
  "effectiveDate": "2024-02-01",  // Format: YYYY-MM-DD
  "reasonCode": "NEW_HIRE",  // Optional
  "reasonNote": "New employee probation period"  // Optional
}
```

**Response**: Updated employee object with new status

**Note**: Status changes are automatically recorded in status history.

#### Get Employee Status History
```http
GET /api/v1/people/employees/:id/status-history
X-Tenant-ID: 1
```

**Response**: Array of status history records with:
- `eshStatusCode` - Status code
- `eshEffectiveDate` - When status became effective
- `eshReasonCode` - Reason for status change
- `eshReasonNote` - Additional notes

### Contract Management

#### Create Contract
```http
POST /api/v1/people/contracts
Content-Type: application/json
X-Tenant-ID: 1

{
  "ctrTenantId": 1,
  "ctrEmpId": 123,
  "ctrContractTypeCode": "PERMANENT",
  "ctrStartDate": "2024-01-01",
  "ctrEndDate": "2025-12-31",  // Optional for permanent contracts
  "ctrProbationEndDate": "2024-04-01",  // Optional
  "ctrStandardHoursPerWeek": 40,
  "ctrStandardDaysPerWeek": 5,
  "ctrStatusCode": "ACTIVE"
}
```

#### Get Contract by ID
```http
GET /api/v1/people/contracts/:id
X-Tenant-ID: 1
```

#### Get Contracts for Employee
```http
GET /api/v1/people/employees/:employeeId/contracts
X-Tenant-ID: 1
```

### Person Contact Management

#### Create Contact
```http
POST /api/v1/people/persons/:personId/contacts
Content-Type: application/json

{
  "pcoContactTypeCode": "EMAIL",  // EMAIL, MOBILE, PHONE, ADDRESS, OTHER
  "pcoContactValue": "john.doe@example.com",
  "pcoIsPrimary": true,
  "pcoLabel": "Work Email",  // Optional
  "pcoCountryCode": "KE"  // Optional
}
```

**Validation**:
- Email format validated for `EMAIL` type
- Phone format validated for `MOBILE` and `PHONE` types

#### Get Contacts for Person
```http
GET /api/v1/people/persons/:personId/contacts
```

### Person Identifier Management

#### Create Identifier
```http
POST /api/v1/people/persons/:personId/identifiers
Content-Type: application/json

{
  "idnIdentifierTypeCode": "NATIONAL_ID",  // NATIONAL_ID, PASSPORT, TAX_PIN, DRIVERS_LICENSE, OTHER
  "idnIdentifierValue": "12345678",
  "idnCountryCode": "KE",  // Optional
  "idnValidFrom": "2020-01-01",  // Optional
  "idnValidTo": "2030-12-31"  // Optional
}
```

### Dependent Management

#### Create Dependent
```http
POST /api/v1/people/employees/:employeeId/dependents
Content-Type: application/json
X-Tenant-ID: 1

{
  "depName": "Jane Doe",
  "depRelationshipCode": "CHILD",  // SPOUSE, CHILD, PARENT, OTHER
  "depDateOfBirth": "2010-05-15",  // Optional
  "depIncludedInHealthCover": true,
  "depWellnessEligible": true
}
```

### Qualification Management

#### Create Qualification
```http
POST /api/v1/people/persons/:personId/qualifications
Content-Type: application/json

{
  "qlfQualificationTypeCode": "EDUCATION",  // EDUCATION, PROFESSIONAL, CERTIFICATION, OTHER
  "qlfQualificationName": "Bachelor of Science",
  "qlfInstitution": "University of Nairobi",  // Optional
  "qlfLevelCode": "DEGREE",  // Optional: DIPLOMA, DEGREE, BACHELORS, MASTERS, DOCTORATE, CERTIFICATE, OTHER
  "qlfCompletionYear": 2015  // Optional
}
```

### Employment History Management

#### Create Employment History
```http
POST /api/v1/people/persons/:personId/employment-history
Content-Type: application/json

{
  "pehEmployerName": "Previous Company Ltd",
  "pehRoleTitle": "Software Engineer",  // Optional
  "pehStartDate": "2020-01-01",  // Optional
  "pehEndDate": "2023-12-31",  // Optional
  "pehSummary": "Worked on various projects"  // Optional
}
```

**Validation**: If both dates provided, `pehStartDate` must be <= `pehEndDate`

### Wellness Profile Management

#### Create/Update Wellness Profile (Upsert)
```http
POST /api/v1/people/wellness-profiles
Content-Type: application/json
X-Tenant-ID: 1

{
  "wepTenantId": 1,
  "wepEmpId": 123,
  "wepConsentFlag": true,
  "wepPreferredChannelCode": "EMAIL",  // EMAIL, SMS, WHATSAPP, APP, OTHER
  "wepLastZhepSyncAt": "2024-01-15T10:00:00Z"  // Optional, ISO 8601 format
}
```

#### Get Wellness Profile for Employee
```http
GET /api/v1/people/employees/:employeeId/wellness-profile
X-Tenant-ID: 1
```

#### Update Wellness Consent
```http
PATCH /api/v1/people/wellness-profiles/:id/consent
Content-Type: application/json
X-Tenant-ID: 1

{
  "wepConsentFlag": false
}
```

### Wellness Profile Tags

#### Create Tag
```http
POST /api/v1/people/wellness-profiles/:wellnessProfileId/tags
Content-Type: application/json
X-Tenant-ID: 1

{
  "wptTagCode": "HIGH_RISK",
  "wptSourceSystem": "ZHEP",  // ZHEP, MANUAL, SYSTEM, IMPORT
  "wptIsActive": true
}
```

## Data Models

### Person (Global Entity)
- `perId` - Primary key (BIGINT)
- `perFirstName` - Required
- `perLastName` - Required
- `perMiddleName` - Optional
- `perDisplayName` - Auto-generated if not provided: `firstName + middleName + lastName`
- `perGenderCode` - Optional
- `perDateOfBirth` - Optional (DATE)
- `perNationalityCode` - Optional
- `perCreatedAt`, `perCreatedBy`, `perUpdatedAt`, `perUpdatedBy` - Audit fields
- `perDeletedAt`, `perDeletedBy` - Soft delete fields

### Employee (Tenant-Scoped)
- `empId` - Primary key (BIGINT)
- `empTenantId` - Required, foreign key to `SYS_TENANT`
- `empPerId` - Required, foreign key to `PID_PERSON`
- `empEmployeeNumber` - Required, unique within tenant
- `empHireDate` - Required (DATE)
- `empEmploymentTypeCode` - PERMANENT, CONTRACT, INTERN, etc.
- `empCurrentStatusCode` - ACTIVE, PROBATION, ON_LEAVE, TERMINATED, etc.
- `empCurrentStatusEffectiveDate` - When current status became effective
- Audit and soft delete fields

## Multi-Tenancy

All tenant-scoped resources (employees, contracts, dependents, wellness profiles) are automatically filtered by the `X-Tenant-ID` header. Cross-tenant access is prevented at the API level.

**Example**: An employee with ID 123 in Tenant 1 cannot be accessed by Tenant 2, even if they know the employee ID.

## Validation

All endpoints use:
1. **JSON Schema validation** (Fastify built-in) for basic type checking
2. **Zod schema validation** (preValidation hook) for business rule validation

Validation errors return `400 Bad Request` with error details:

```json
{
  "error": "Validation error",
  "details": [
    {
      "path": ["empEmployeeNumber"],
      "message": "Employee number already exists"
    }
  ]
}
```

## Error Responses

### 400 Bad Request
- Validation errors
- Business rule violations (e.g., duplicate employee number)

### 401 Unauthorized
- Missing or invalid authentication

### 403 Forbidden
- Missing tenant context
- Cross-tenant access attempt

### 404 Not Found
- Resource doesn't exist
- Resource exists but in different tenant

### 500 Internal Server Error
- Unexpected server errors

## Example Workflow

### Creating a Complete Employee Record

1. **Create Person**
```http
POST /api/v1/people/persons
{
  "perFirstName": "John",
  "perLastName": "Doe",
  "perDateOfBirth": "1990-01-01"
}
→ Returns: { "perId": 123, ... }
```

2. **Create Employee**
```http
POST /api/v1/people/employees
X-Tenant-ID: 1
{
  "personId": 123,
  "empEmployeeNumber": "EMP001",
  "empHireDate": "2024-01-01",
  "empEmploymentTypeCode": "PERMANENT",
  "empCurrentStatusCode": "ACTIVE"
}
→ Returns: { "empId": 456, ... }
```

3. **Create Contract**
```http
POST /api/v1/people/contracts
X-Tenant-ID: 1
{
  "ctrEmpId": 456,
  "ctrContractTypeCode": "PERMANENT",
  "ctrStartDate": "2024-01-01",
  "ctrStandardHoursPerWeek": 40,
  "ctrStatusCode": "ACTIVE"
}
→ Returns: { "ctrId": 789, ... }
```

4. **Add Contact Information**
```http
POST /api/v1/people/persons/123/contacts
{
  "pcoContactTypeCode": "EMAIL",
  "pcoContactValue": "john.doe@example.com",
  "pcoIsPrimary": true
}
```

5. **Update Employee Status**
```http
PATCH /api/v1/people/employees/456/status
X-Tenant-ID: 1
{
  "statusCode": "PROBATION",
  "effectiveDate": "2024-02-01",
  "reasonCode": "NEW_HIRE"
}
```

## Testing

The People Core module includes comprehensive test coverage:

- **Unit Tests**: Service and repository layer tests
- **Integration Tests**: Critical flow tests (person → employee → contract)
- **Route Tests**: API endpoint tests

### Running Tests Locally

```bash
cd backend
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:integration  # Integration tests only
```

**Current Test Results**: 65/70 tests passing (92.9% pass rate)

### Running Tests in Docker Compose

Tests can be run in Docker Compose with the same pass rate:

```bash
# Start database services
docker compose up -d postgres redis

# Run tests in Docker
docker compose --profile test up backend-tests --build
```

The test service will:
1. Install dependencies
2. Run database migrations
3. Execute all tests
4. Exit with test results

**Test Results in Docker**: Same as local - 65/70 tests passing (92.9% pass rate)

The same 5 test failures occur in both environments (integration/route tests with response parsing issues).

## Development

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Redis (for rate limiting)

### Setup
```bash
# Install dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run db:migrate

# Seed demo data (optional)
npm run db:seed:demo

# Start development server
npm run dev
```

### API Documentation

Once the server is running, access interactive API documentation at:
```
http://localhost:3000/docs
```

This provides a Swagger UI for exploring all available endpoints.

## License

UNLICENSED - Proprietary software

## Support

For issues, questions, or contributions, please contact the Zimasa development team.
