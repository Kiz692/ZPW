## 1. Core ESS/MSS-Specific Entities

### 1.1 SelfServiceFieldRule (conceptual table: `ESS_FIELD_RULE` or `SYS_FIELD_RULE`)

> Supports: “view and update selected personal details according to HR-configured editability rules” (PW-ESS-01).

**Purpose**

* Define which fields are **visible** and **editable** in ESS/MSS, per tenant.
* Allow HR to control self-service scope without hardcoding in the app.
* Support different rules per **role context** (Employee vs Manager, possibly HR-lite in future).

**Key attributes (business-level)**

* **Tenant**

  * Tenant id / reference (→ `SYS_TENANT`)
  * Ensures rules are per-tenant.

* **Target field**

  * Target entity type (e.g. `PERSON`, `EMPLOYEE`, `WELLNESS_PROFILE`)
  * Field key / path (e.g. `date_of_birth`, `personal_email`, `emergency_contact`)
  * Optional: field group/section (e.g. “Personal Details”, “Contact Info”).

* **Role & portal context**

  * Portal type (ESS / MSS)
  * Role context (Employee / Manager / HR delegate – code)
  * Optional: Org-scope filter (e.g. all, only own record, only direct reports; normally implied by role).

* **Permissions / behaviour**

  * Visible flag (Y/N)
  * Editable flag (Y/N)
  * Optional: requires approval flag (for certain changes, e.g. bank details later)
  * Optional: justification required flag (user must give reason for change).

* **Lifecycle / metadata**

  * Effective-from / effective-to dates (for rule evolution)
  * Status (Active / Inactive – code)
  * Created/updated metadata (who configured it).

**Multi-tenant?**

* **Yes** – rules are always tenant-specific.

> **Note:** This entity is **supporting config**. It doesn’t create new business capabilities, it just implements the “HR-configured editability rules” that are already in the spec.

---

## 2. Main Referenced Entities (Owned by Other Domains)

ESS & MSS don’t *own* these, but they are central to what ESS/MSS exposes:

* **User (`SYS_USER`)** – login identity; used to determine which employee record(s) and roles apply.
* **Role (`SYS_ROLE`, `SYS_USER_ROLE`)** – RBAC, determines whether user is employee, manager, HR, exec for a given tenant.
* **Person (`PID_PERSON`)** – personal details employees can view/update (controlled by `SelfServiceFieldRule`).
* **Employee (`PID_EMPLOYEE`)** – employment and position context.
* **OrgUnit / Position / PositionAssignment (`ORG_UNIT`, `ORG_POSITION`, `ORG_POSITION_ASSIGNMENT`)** – team structures, manager–direct reports, org charts.
* **LeaveRequest / LeaveBalance / RecoveryIndex (`LEA_LEAVE_REQUEST`, `LEA_LEAVE_BALANCE`, `LEA_RECOVERY_INDEX`)** – ESS leave actions; MSS team calendars and wellbeing overlays.
* **PerfAppraisal / PerfCycle (`PRF_PERF_APPRAISAL`, `PRF_PERF_CYCLE`)** – self-reviews and historical appraisals in ESS; initiating/completing appraisals in MSS.
* **GamificationProfile / ChallengeParticipation / ManagerScorecard (`GAM_PROFILE`, `GAM_CHALLENGE_PARTICIPATION`, `GAM_MANAGER_SCORECARD`)** – personal points/level & rings in ESS; team-level summaries in MSS.
* **AIConversation (`AIS_CONVERSATION`, `AIS_MESSAGE`)** – Employee Copilot and Manager Insight Copilot interactions.

We don’t redefine them here; ESS/MSS just reads/writes via the respective domains.

---

## 3. Relationships (ESS/MSS Domain Lens)

### 3.1 Config relationships for SelfServiceFieldRule

1. **Tenant – SelfServiceFieldRule**
   `Tenant (1) -- (many) SelfServiceFieldRule`

   * Rules are defined per tenant.

2. **Role / Portal Context – SelfServiceFieldRule**
   `Role (1) -- (many) SelfServiceFieldRule` (via role code & portal type)

   * Different rules per role & portal (ESS vs MSS) if needed.

3. **Target Entity – SelfServiceFieldRule** *(logical reference)*

   * `Person`, `Employee`, `WellnessProfile` etc. are not hard-FK’d (to avoid crazy coupling), but referenced via:

     * `targetEntityType` + `fieldKey`.
   * Application logic interprets:

     * “For tenant X, an **Employee** using ESS may edit `PERSON.personal_email` but only view `PERSON.date_of_birth`.”

### 3.2 Cross-domain interactions (how ESS/MSS behaves)

From the ESS/MSS point of view:

* **ESS portal**:

  * Uses `User` + `UserRole` + `Employee` + `PositionAssignment` to determine:

    * “Who am I?” and “what is my org context?”
  * Uses `SelfServiceFieldRule` to control:

    * Which `Person` / `Employee` / `WellnessProfile` fields are editable vs view-only.
  * Uses:

    * `LEA_LEAVE_REQUEST`, `LEA_LEAVE_BALANCE` for leave submission & tracking.
    * `PRF_PERF_APPRAISAL` (+ template) for self-reviews & history.
    * `LEA_RECOVERY_INDEX`, `GAM_PROFILE` (+ optional projections) for Recovery & wellbeing rings.
    * `AIS_CONVERSATION` & `AIS_MESSAGE` for Employee Copilot sessions.

* **MSS portal**:

  * Uses `PositionAssignment` & `OrgUnit` to determine manager’s team scope.
  * Uses:

    * `LEA_LEAVE_REQUEST`, `LEA_LEAVE_BALANCE`, `LEA_ROSTER_RULE` for approvals & team calendars.
    * `LEA_RECOVERY_INDEX` for team-level wellbeing overlays.
    * `PRF_PERF_APPRAISAL`, `PRF_PERF_CYCLE` for manager-led performance reviews.
    * `GAM_CHALLENGE_PARTICIPATION`, `GAM_MANAGER_SCORECARD` for team gamification summaries.
    * `AIS_CONVERSATION` & `AIS_MESSAGE` for Manager Insight Copilot.

No new persistent entities are needed to express “approve/decline leave”, “view team calendar”, etc.; those behaviors are driven by **role + scope + existing domain data**.

---

## 4. Cross-domain / Overlap Flags

* **SelfServiceFieldRule**

  * Could arguably belong to a broader **System/Config** or **Access Control** domain, since it’s a generic “field-level self-service rule”.
  * For now, we treat it as part of the ESS/MSS bounded context because:

    * It directly implements PW-ESS-01’s “HR-configured editability rules”.
    * Its main consumers are ESS and MSS portals.

* **User / Role / UserRole**

  * Clearly belong to System/Shared; ESS/MSS just consume them.

* **Visual indicators (“rings”)**

  * Recovery/Reflection/Wellness rings are visual composites built from Leave, Performance, Gamification data.
  * Can be computed in app or via a reporting/projection service; no need for ESS/MSS-specific tables unless you want a persistent “dashboard snapshot” later.

---

## 5. Mermaid Class Diagram (ESS/MSS View)

This is a **domain lens** diagram: one core ESS/MSS entity plus the referenced ones (as context).

```mermaid
classDiagram
  class Tenant {
    +tenantId
    +name
  }

  class User {
    +userId
    +username
  }

  class Role {
    +roleId
    +code
    +name
  }

  class UserRole {
    +userRoleId
    +tenantId
    +roleCode
  }

  class Person {
    +personId
    +name
    +dob
    +contacts...
  }

  class Employee {
    +employeeId
    +employeeNumber
    +status
  }

  class OrgUnit {
    +orgUnitId
    +code
    +name
  }

  class PositionAssignment {
    +assignmentId
    +isPrimary
  }

  class LeaveRequest {
    +leaveRequestId
    +type
    +startDate
    +endDate
    +status
  }

  class LeaveBalance {
    +leaveBalanceId
    +leaveType
    +period
    +opening
    +accrued
    +taken
    +closing
  }

  class RecoveryIndex {
    +recoveryIndexId
    +period
    +score
  }

  class PerfAppraisal {
    +appraisalId
    +cycle
    +status
  }

  class GamificationProfile {
    +profileId
    +currentPoints
    +currentLevel
  }

  class ManagerScorecard {
    +scorecardId
    +period
    +stewardshipScore
  }

  class AIConversation {
    +conversationId
    +type
    +entrySurface
  }

  class SelfServiceFieldRule {
    +ruleId
    +portalType  "ESS/MSS"
    +roleContext "Employee/Manager"
    +targetEntityType
    +fieldKey
    +visible
    +editable
    +effectiveFrom
    +effectiveTo
    +status
  }

  Tenant "1" --> "many" UserRole : owns_roles
  User "1" --> "many" UserRole : has
  UserRole "many" --> "1" Role : role
  UserRole "many" --> "1" Tenant : scope

  User "1" --> "many" AIConversation : starts
  Tenant "1" --> "many" AIConversation : owns

  Tenant "1" --> "many" SelfServiceFieldRule : owns
  Role "1" --> "many" SelfServiceFieldRule : context

  Person "1" --> "1" Employee : identity
  Employee "1" --> "many" PositionAssignment : assigned
  PositionAssignment "many" --> "1" OrgUnit : in_unit

  Employee "1" --> "many" LeaveRequest : submits
  Employee "1" --> "many" LeaveBalance : has
  Employee "1" --> "many" RecoveryIndex : has
  Employee "1" --> "many" PerfAppraisal : has
  Employee "1" --> "many" GamificationProfile : has
  Employee "1" --> "many" ManagerScorecard : as_manager

