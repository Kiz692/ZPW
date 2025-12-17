## 1. Entities in People Core

### 1.1 Person

**Purpose**

* Represent a unique human being across Zimasa platforms (global identity).
* Provide a stable anchor for Employees, qualifications, and prior employment.
* Centralise core demographic and identification data.

**Key attributes (business-level)**

* Person ID (PER_ID – surrogate key)
* Names (first, middle, last, preferred/full name)
* Gender (code from configurable list)
* Date of birth
* Nationality (country code)
* High-level status (active/inactive, optional)

**Multi-tenant?**

* **No** (global across tenants / platforms).

---

### 1.2 PersonContact

**Purpose**

* Capture multiple contact methods per Person.
* Support “primary” flags by contact type (email, phone, address).

**Key attributes**

* Contact ID
* Person reference (→ Person)
* Contact type (email / mobile / phone / physical address / other)
* Contact value (email address, phone number, address lines, etc.)
* Is primary (per type)
* Optional metadata: label (work, home), country/region for phone/address

**Multi-tenant?**

* **No** (inherits scope from Person).

---

### 1.3 PersonIdentifier

**Purpose**

* Store multiple official IDs per Person (e.g. national ID, passport, tax PIN).
* Allow configuration per country / ID type without exploding columns on Person.

**Key attributes**

* Identifier ID
* Person reference (→ Person)
* Identifier type (national ID / passport / tax ID etc., code or lookup)
* Identifier value
* Country / issuing authority
* Valid-from / valid-to (optional)

**Multi-tenant?**

* **No** (global; ID doesn’t belong to a tenant).

---

### 1.4 Employee

**Purpose**

* Represent a Person’s employment record within a specific tenant (employer).
* Hold employment-specific attributes (number, hire date, type, current status).

**Key attributes**

* Employee ID
* Tenant reference (→ SYS_TENANT)
* Person reference (→ Person)
* Employee number/code (tenant-specific)
* Hire date
* Employment type (permanent, fixed-term, casual, intern, consultant – code)
* Current employment status (planned, active, probation, suspended, exited – code)
* Current status effective date

**Multi-tenant?**

* **Yes** (scoped by EMP_TENANT_ID).

---

### 1.5 EmploymentContract

**Purpose**

* Capture contractual agreements per Employee.
* Support multiple contracts over time (renewals, conversions, etc.).

**Key attributes**

* Contract ID
* Tenant reference (→ SYS_TENANT)
* Employee reference (→ Employee)
* Contract type (e.g. permanent, fixed-term, internship – code)
* Start date
* End date (optional)
* Probation end date (optional)
* Basic working pattern attributes (e.g. standard hours per week, standard days per week, default working days pattern)
* Contract status (draft, active, ended – code)
* Primary Position Assignment reference (→ PositionAssignment in Work Lattice domain)

**Multi-tenant?**

* **Yes** (contracts are per Employee per tenant).

> **Cross-domain note:** Link to PositionAssignment lives in the Work Lattice (ORG) domain; this entity is still primarily in People Core, but references ORG_*.

---

### 1.6 EmploymentStatusHistory

**Purpose**

* Record all changes in an Employee’s employment status over time.
* Enable reporting on joiners, leavers and other status transitions.

**Key attributes**

* Status history ID
* Tenant reference (→ SYS_TENANT)
* Employee reference (→ Employee)
* From-status (optional – previous)
* To-status (active, probation, suspended, exited, etc.)
* Effective date
* Reason (code or free text)
* Optional comments

**Multi-tenant?**

* **Yes**.

---

### 1.7 Dependent

**Purpose**

* Capture dependents linked to an Employee for wellness-eligibility purposes.
* Support high-level use without full benefits administration.

**Key attributes**

* Dependent ID
* Tenant reference (→ SYS_TENANT)
* Employee reference (→ Employee)
* Name (optional, depending on privacy model)
* Relationship (spouse, child, parent, other – code)
* Date of birth
* Included-in-health-cover indicator (Y/N)
* Wellness eligibility indicator / flags (e.g. eligible_for_program Y/N)
* Optional: simple notes/comments

**Multi-tenant?**

* **Yes** (dependents are tied to an Employee–tenant).

> **Scope note:** For MVP, usage is **only** for wellness eligibility, not full benefits/payroll.

---

### 1.8 Qualification

**Purpose**

* Store high-level education and professional qualification details for a Person.
* Provide context in performance and development discussions.

**Key attributes**

* Qualification ID
* Person reference (→ Person)
* Qualification type (education/professional – code)
* Institution name
* Qualification name/title
* Qualification level (diploma, degree, masters, etc. – code)
* Completion year
* Optional notes

**Multi-tenant?**

* **No** (qualifications belong to Person, not a specific tenant).

---

### 1.9 EmploymentHistory (Prior Employment)

**Purpose**

* Record prior employment summaries (before joining a given tenant).
* Provide context for managers and performance reviewers.

**Key attributes**

* Employment history ID
* Person reference (→ Person)
* Employer name
* Role/position title
* Start date
* End date
* Optional summary / responsibilities

**Multi-tenant?**

* **No** (history is a property of the Person, not any single tenant).

> **Domain note:** Could later be shared with a “Career/Performance” domain, but for MVP it’s fine to keep in People Core.

---

### 1.10 WellnessProfile

**Purpose**

* Maintain per-Employee wellness engagement settings for PeopleWell.
* Provide non-clinical engagement signals/labels to AI and nudging logic.

**Key attributes**

* Wellness profile ID
* Tenant reference (→ SYS_TENANT)
* Employee reference (→ Employee)
* Consent flag for wellness/health engagement programmes
* Preferred communication channel (email, SMS, WhatsApp, app – code)
* Engagement tags (opaque labels from ZHEP, e.g. low_engagement, high_stress_signals, active_participant – likely an array/JSON of codes)
* Optional: last sync date from ZHEP

**Multi-tenant?**

* **Yes** (per Employee–tenant).

> **Cross-domain note:** Semantically it overlaps with a broader “Wellness Engagement” / ZHEP domain. For now, PeopleWell owns this HR-facing slice; ZHEP will integrate with it.

---

## 2. Relationships (People Core)

Cardinalities phrased as: `A (1) -- (many) B` = one A to many B.

1. **Person – PersonContact**

   * `Person (1) -- (many) PersonContact`
   * A Person can have multiple contacts; each PersonContact belongs to one Person.

2. **Person – PersonIdentifier**

   * `Person (1) -- (many) PersonIdentifier`
   * A Person can have multiple official identifiers; each identifier belongs to one Person.

3. **Person – Employee**

   * `Person (1) -- (many) Employee`
   * A Person can be an Employee in many tenants.
   * Each Employee belongs to exactly one Person and one Tenant.

4. **Tenant – Employee**

   * `Tenant (1) -- (many) Employee`
   * Each Employee is scoped to a single Tenant.

5. **Employee – EmploymentContract**

   * `Employee (1) -- (many) EmploymentContract`
   * Each contract is for exactly one Employee.
   * Over time, an Employee can have multiple contracts.

6. **Employee – EmploymentStatusHistory**

   * `Employee (1) -- (many) EmploymentStatusHistory`
   * Each status history row belongs to one Employee.
   * Together they form a chronological timeline of statuses.

7. **Employee – Dependent**

   * `Employee (1) -- (many) Dependent`
   * Each Dependent entry belongs to one Employee.

8. **Person – Qualification**

   * `Person (1) -- (many) Qualification`
   * Each qualification belongs to one Person.

9. **Person – EmploymentHistory**

   * `Person (1) -- (many) EmploymentHistory`
   * Each prior employment record belongs to one Person.

10. **Employee – WellnessProfile**

    * `Employee (1) -- (0..1) WellnessProfile`
    * Typically one active WellnessProfile per Employee–tenant.
    * Some Employees may not have a profile yet.

11. **EmploymentContract – PositionAssignment (cross-domain)**

    * `EmploymentContract (0..many) -- (0..1) PositionAssignment`
    * For MVP, contract includes a **link to primary PositionAssignment** in the Work Lattice domain.
    * Each contract may reference one “primary” position assignment; not all contracts must have one (e.g. pending assignment).

---

## 3. Cross-domain / Overlap Flags

* **EmploymentContract → PositionAssignment**

  * Lives in People Core but references an entity (`PositionAssignment`) in the **Org & Jobs (Work Lattice)** domain.
  * Keep FK but ensure clear bounded context ownership (ORG_* owns position structure).

* **WellnessProfile**

  * Conceptually related to a “Wellness Engagement / ZHEP” domain.
  * In PeopleWell, it holds HR-side configuration and engagement labels from ZHEP.
  * Integration boundaries must be clear: no clinical data, only high-level tags.

* **EmploymentHistory & Qualification**

  * Could later be part of a broader “Career/Performance” or “Talent” domain.
  * For MVP, staying in People Core as context data is acceptable.

* **Sys vs People Core**

  * `SYS_USER` (login identity) is **not** modelled here; mapping between `USR` and `PER` or `EMP` belongs to System/Auth domain.

---

## 4. Mermaid Class Diagram (People Core)

This is conceptual (domain level, not physical table names).

```mermaid
classDiagram
  class Tenant {
    +tenantId
    +name
  }

  class Person {
    +personId
    +firstName
    +middleName
    +lastName
    +genderCode
    +dateOfBirth
    +nationalityCode
  }

  class PersonContact {
    +contactId
    +type
    +value
    +isPrimary
    +label
  }

  class PersonIdentifier {
    +identifierId
    +type
    +value
    +countryCode
    +validFrom
    +validTo
  }

  class Employee {
    +employeeId
    +employeeNumber
    +hireDate
    +employmentType
    +currentStatus
    +currentStatusEffectiveDate
  }

  class EmploymentContract {
    +contractId
    +contractType
    +startDate
    +endDate
    +probationEndDate
    +standardHoursPerWeek
    +standardDaysPerWeek
    +status
  }

  class EmploymentStatusHistory {
    +statusHistoryId
    +fromStatus
    +toStatus
    +effectiveDate
    +reason
  }

  class Dependent {
    +dependentId
    +name
    +relationship
    +dateOfBirth
    +includedInHealthCover
    +wellnessEligible
  }

  class Qualification {
    +qualificationId
    +type
    +institution
    +qualificationName
    +level
    +completionYear
  }

  class EmploymentHistory {
    +employmentHistoryId
    +employerName
    +roleTitle
    +startDate
    +endDate
    +summary
  }

  class WellnessProfile {
    +wellnessProfileId
    +consentFlag
    +preferredChannel
    +engagementTags
  }

  %% Cross-domain reference (simplified)
  class PositionAssignment {
    +positionAssignmentId
    +isPrimary
    +startDate
    +endDate
  }

  Tenant "1" --> "many" Employee : has
  Person "1" --> "many" Employee : identifies
  Person "1" --> "many" PersonContact : has
  Person "1" --> "many" PersonIdentifier : has
  Person "1" --> "many" Qualification : has
  Person "1" --> "many" EmploymentHistory : has

  Employee "1" --> "many" EmploymentContract : has
  Employee "1" --> "many" EmploymentStatusHistory : status history
  Employee "1" --> "many" Dependent : has
  Employee "1" --> "0..1" WellnessProfile : has

  EmploymentContract "0..many" --> "0..1" PositionAssignment : primary position
