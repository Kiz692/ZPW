## 1. Entities in Rhythms (Leave & Absence)

### 1.1 LeaveType  (`LEA_LEAVE_TYPE` / `LTP`)

**Purpose**

* Define configurable leave types per tenant (annual, sick, maternity, wellness, etc.).
* Capture semantics needed for validation, UI and reporting.

**Key attributes (business-level)**

* Leave type ID
* Tenant reference (→ Tenant)
* Code / short name (e.g. `ANNUAL`, `SICK`)
* Display name
* Category (Annual / Sick / Wellness / Other – code)
* Paid/unpaid flag
* Attachment required flag
* Min duration per request (days or fractions)
* Max duration per request (days or fractions)
* Wellness-related flag (Y/N)
* Active flag

**Multi-tenant?**

* **Yes** (per tenant; seeded with defaults at tenant setup).

---

### 1.2 LeavePolicy  (`LEA_LEAVE_POLICY` / `LPL`)

**Purpose**

* Define simple entitlement and accrual rules for each leave type in a tenant.
* Drive balance calculations and carry-forward.

**Key attributes**

* Leave policy ID
* Tenant reference (→ Tenant)
* Leave type reference (→ LeaveType)
* Accrual model (NONE / ANNUAL / MONTHLY)
* Days per accrual period (for applicable models)
* Maximum annual entitlement (days)
* Carry-forward allowed (Y/N)
* Maximum carry-forward days
* Pro-rata rule for joiners (e.g. full-month rounding vs exact)
* Pro-rata rule for leavers
* Optional: effective-from / effective-to dates

**Multi-tenant?**

* **Yes** (policy context is tenant-specific).

---

### 1.3 LeavePeriod  (`LEA_LEAVE_PERIOD` / `LPD`)

**Purpose**

* Represent a leave accounting period per tenant (typically a year).
* Ensure there is exactly one active period per tenant at a time.

**Key attributes**

* Leave period ID
* Tenant reference (→ Tenant)
* Code / name (e.g. `2025`, `2025_FY`)
* Period type (Calendar / Fiscal – code)
* Start date
* End date
* Active flag (only one Active at a time)
* Optional: previous period reference

**Multi-tenant?**

* **Yes**.

---

### 1.4 LeaveBalance  (`LEA_LEAVE_BALANCE` / `LBA`)

**Purpose**

* Maintain leave balances per employee, type and period.
* Provide a basis for showing available days and calculating Recovery Index.

**Key attributes**

* Leave balance ID
* Tenant reference (→ Tenant)
* Employee reference (→ Employee)
* Leave type reference (→ LeaveType)
* Leave period reference (→ LeavePeriod)
* Opening balance (days)
* Accrued days
* Days taken
* Adjustment days (net)
* Closing balance
* Last recalculated date/time

**Multi-tenant?**

* **Yes**.

---

### 1.5 LeaveBalanceAdjustment  *(optional explicit entity, can be part of LeaveBalance)*

**Purpose**

* Keep an auditable trail of manual leave balance changes.
* Support compliance and troubleshooting when balances are overridden.

**Key attributes**

* Adjustment ID
* Tenant reference (→ Tenant)
* Leave balance reference (→ LeaveBalance)
* Adjustment amount (days, + or -)
* Reason code
* Free-text comment
* Performed by (user/employee reference)
* Date/time of adjustment

**Multi-tenant?**

* **Yes**.

> If you prefer a simpler model, the adjustment data can be held in audit logs only. Having a dedicated entity makes reporting and reconstruction easier.

---

### 1.6 LeaveRequest  (`LEA_LEAVE_REQUEST` / `LRQ`)

**Purpose**

* Represent a single leave request submitted by an employee.
* Capture essential details for validation, workflow, and payroll/wellness impact.

**Key attributes**

* Leave request ID
* Tenant reference (→ Tenant)
* Employee reference (→ Employee)
* Leave type reference (→ LeaveType)
* Leave period reference (→ LeavePeriod) – derived from dates but better stored
* Request date/time
* Start date
* End date
* Partial days information (e.g. first/last day half-day, number of units)
* Requested duration (computed/stored)
* Reason (text)
* Attachment reference (file ID or URL)
* Status (Draft, Pending, Approved, Rejected, Cancelled – code)
* Current workflow stage (e.g. Manager, HR – code)

**Multi-tenant?**

* **Yes**.

---

### 1.7 LeaveWorkflowRule  (`LEA_LEAVE_POLICY` extension or separate `LEA_LEAVE_WORKFLOW` / `LWF`)

**Purpose**

* Configure approval workflow patterns per tenant and per leave type (or category).
* Control who must approve (manager only, manager + HR, special approver).

**Key attributes**

* Workflow rule ID
* Tenant reference (→ Tenant)
* Leave type reference (→ LeaveType) or Leave category (for defaults)
* Number of approval levels (1 or 2)
* Level 1 approver type (e.g. Direct Manager, Specific Role)
* Level 2 approver type (e.g. HR, Wellness Champion), optional
* Special routing flags for specific leave types (e.g. notify wellness champion)
* Active flag

**Multi-tenant?**

* **Yes**.

> This could be folded into `LeavePolicy`, but separating keeps entitlement and workflow concerns distinct. Either way, it’s the same domain concept.

---

### 1.8 LeaveApproval  (`LEA_LEAVE_APPROVAL` / `LAP` – not yet in your table but implied)

**Purpose**

* Store each approval/rejection decision against a LeaveRequest.
* Support multi-level approvals and full audit of who approved/declined when.

**Key attributes**

* Leave approval ID
* Tenant reference (→ Tenant)
* Leave request reference (→ LeaveRequest)
* Approval level (1, 2)
* Approver type (Manager, HR, WellnessChampion – code)
* Approver user/employee reference
* Decision status (Approved, Rejected, Cancelled – code)
* Decision date/time
* Decision comments

**Multi-tenant?**

* **Yes**.

---

### 1.9 RosterRule  (`LEA_ROSTER_RULE` / `LRR`)

**Purpose**

* Define simple capacity rules per org unit to protect minimum staffing levels.
* Provide checks when leave requests are created or approved.

**Key attributes**

* Roster rule ID
* Tenant reference (→ Tenant)
* Org Unit reference (→ OrgUnit)
* Min staff required at work (absolute or percentage)
* Max simultaneous leaves (absolute or percentage)
* Rule scope (e.g. applies to all leave types or specific categories)
* Active flag
* Effective-from / effective-to dates

**Multi-tenant?**

* **Yes**.

---

### 1.10 RecoveryIndex  (`LEA_RECOVERY_INDEX` / `RIX`)

**Purpose**

* Represent a computed recovery/rest score per employee for a given time window.
* Allow employees, managers and HR to see rest patterns over time.

**Key attributes**

* Recovery index ID
* Tenant reference (→ Tenant)
* Employee reference (→ Employee)
* Time window type (monthly/quarterly/yearly – code)
* Time window identifier (e.g. `2025_Q1`, or start/end dates)
* Index score (numeric)
* Index band / classification (Green / Amber / Red – code)
* Key metrics used (optional aggregates: %entitlement_used, days_since_last_3+day_break, etc.)
* Computation date/time

**Multi-tenant?**

* **Yes**.

---

### 1.11 LeaveWellnessSignalAggregate *(conceptual, might be transient or stored in analytics)*

**Purpose**

* Represent aggregated leave-based wellness signals for ZHEP.
* Ensure signals are anonymised / non-identifiable per configuration.

**Key attributes**

* Signal aggregate ID
* Tenant reference (→ Tenant)
* Grouping dimension (Org Unit / whole tenant / other grouping)
* Time window (e.g. month/quarter/year)
* Under-use of leave metric (e.g. % employees below threshold)
* Over-use of sick leave metric
* No-break period metric (e.g. count of employees with no 3+ day break in X months)
* Anonymisation level (individual/aggregated, threshold-applied flag)

**Multi-tenant?**

* **Yes**, but may live in an analytics/integration context.

> This may **not** need a dedicated OLTP table if you compute and push signals directly to ZHEP, but it’s a recognisable domain concept.

---

## 2. Relationships (Rhythms Domain)

Cardinalities use `A (1) -- (many) B` to mean one A to many B.

### Core relationships

1. **Tenant – LeaveType**

   * `Tenant (1) -- (many) LeaveType`
   * Each leave type is defined within a tenant.

2. **Tenant – LeavePolicy**

   * `Tenant (1) -- (many) LeavePolicy`
   * Each policy belongs to a tenant.

3. **LeaveType – LeavePolicy**

   * `LeaveType (1) -- (0..1 or many) LeavePolicy`
   * MVP: likely one active policy per leave type; history could be modelled with effective dates.

4. **Tenant – LeavePeriod**

   * `Tenant (1) -- (many) LeavePeriod`
   * One period is active at any given time per tenant.

5. **Tenant – LeaveBalance**

   * `Tenant (1) -- (many) LeaveBalance`.

6. **Employee – LeaveBalance**

   * `Employee (1) -- (many) LeaveBalance`.

7. **LeaveType – LeaveBalance**

   * `LeaveType (1) -- (many) LeaveBalance`.

8. **LeavePeriod – LeaveBalance**

   * `LeavePeriod (1) -- (many) LeaveBalance`.

9. **LeaveBalance – LeaveBalanceAdjustment** (if explicit)

   * `LeaveBalance (1) -- (many) LeaveBalanceAdjustment`.

10. **Employee – LeaveRequest**

    * `Employee (1) -- (many) LeaveRequest`.

11. **LeaveType – LeaveRequest**

    * `LeaveType (1) -- (many) LeaveRequest`.

12. **LeavePeriod – LeaveRequest**

    * `LeavePeriod (1) -- (many) LeaveRequest`
      (or derived; explicit FK simplifies queries and Recovery).

13. **Tenant – LeaveWorkflowRule**

    * `Tenant (1) -- (many) LeaveWorkflowRule`.

14. **LeaveType – LeaveWorkflowRule**

    * `LeaveType (1) -- (0..many) LeaveWorkflowRule`
      (rules can be per-type, with global defaults possible).

15. **LeaveRequest – LeaveApproval**

    * `LeaveRequest (1) -- (many) LeaveApproval`.
    * One per approval stage (e.g. manager, HR).

### Rosters & Org linkage

16. **Tenant – RosterRule**

    * `Tenant (1) -- (many) RosterRule`.

17. **OrgUnit – RosterRule**

    * `OrgUnit (1) -- (many) RosterRule`.

18. **OrgUnit – Employee** *(via Work Lattice)*

    * Not owned by Rhythms, but used to determine which RosterRules apply when checking a LeaveRequest.

### Recovery & Wellness

19. **Tenant – RecoveryIndex**

    * `Tenant (1) -- (many) RecoveryIndex`.

20. **Employee – RecoveryIndex**

    * `Employee (1) -- (many) RecoveryIndex`.

21. **Tenant – LeaveWellnessSignalAggregate**

    * `Tenant (1) -- (many) LeaveWellnessSignalAggregate`.

22. **OrgUnit – LeaveWellnessSignalAggregate** (if grouped by org)

    * `OrgUnit (0..1) -- (many) LeaveWellnessSignalAggregate`.

---

## 3. Cross-domain / Overlap Flags

* **Employee** (PID_EMPLOYEE)

  * Belongs to **People Core**; referenced here by LeaveBalance, LeaveRequest, RecoveryIndex.
* **OrgUnit** (ORG_UNIT)

  * Belongs to **Work Lattice**; referenced by RosterRule and potentially by wellness aggregates.
* **LeaveWellnessSignalAggregate**

  * Semantically overlaps with **Analytics / ZHEP integration**. It might be:

    * a materialised table in PeopleWell,
    * or generated on-the-fly for ZHEP.
* **LeaveWorkflowRule vs LeavePolicy**

  * Entitlement and workflow are currently separate concepts; keep them separate to avoid a “god table”.
* **Team calendar**

  * Not an entity; it is a **projection/view** combining LeaveRequest + Employee + OrgUnit + Manager relationships.

---

## 4. Mermaid Class Diagram (Rhythms Domain)

Conceptual domain diagram (not literal table names):

```mermaid
classDiagram
  class Tenant {
    +tenantId
    +name
  }

  class Employee {
    +employeeId
    +employeeNumber
  }

  class OrgUnit {
    +orgUnitId
    +code
    +name
  }

  class LeaveType {
    +leaveTypeId
    +code
    +name
    +category
    +isPaid
    +requiresAttachment
    +minDuration
    +maxDuration
    +isWellnessRelated
  }

  class LeavePolicy {
    +leavePolicyId
    +accrualModel
    +daysPerPeriod
    +maxAnnualEntitlement
    +carryForwardAllowed
    +maxCarryForwardDays
    +proRataJoinersRule
    +proRataLeaversRule
  }

  class LeavePeriod {
    +leavePeriodId
    +code
    +periodType
    +startDate
    +endDate
    +isActive
  }

  class LeaveBalance {
    +leaveBalanceId
    +openingBalance
    +accrued
    +taken
    +adjustments
    +closingBalance
  }

  class LeaveBalanceAdjustment {
    +adjustmentId
    +amount
    +reasonCode
    +comment
    +adjustedAt
  }

  class LeaveRequest {
    +leaveRequestId
    +requestDate
    +startDate
    +endDate
    +partialDaysInfo
    +requestedDuration
    +reason
    +attachmentRef
    +status
    +currentStage
  }

  class LeaveWorkflowRule {
    +workflowRuleId
    +levelCount
    +level1ApproverType
    +level2ApproverType
    +specialRoutingFlags
    +isActive
  }

  class LeaveApproval {
    +leaveApprovalId
    +approvalLevel
    +approverType
    +decisionStatus
    +decisionDate
    +decisionComment
  }

  class RosterRule {
    +rosterRuleId
    +minStaffOnDuty
    +maxSimultaneousLeaves
    +scope
    +isActive
  }

  class RecoveryIndex {
    +recoveryIndexId
    +timeWindowType
    +timeWindowKey
    +score
    +classification
    +metricsSummary
  }

  class LeaveWellnessSignalAggregate {
    +signalAggregateId
    +groupingDimension
    +timeWindowKey
    +underUseMetric
    +overUseSickMetric
    +noBreakMetric
    +anonymisationLevel
  }

  Tenant "1" --> "many" LeaveType : owns
  Tenant "1" --> "many" LeavePolicy : owns
  Tenant "1" --> "many" LeavePeriod : owns
  Tenant "1" --> "many" LeaveBalance : owns
  Tenant "1" --> "many" LeaveRequest : owns
  Tenant "1" --> "many" LeaveWorkflowRule : owns
  Tenant "1" --> "many" RosterRule : owns
  Tenant "1" --> "many" RecoveryIndex : owns
  Tenant "1" --> "many" LeaveWellnessSignalAggregate : owns

  LeaveType "1" --> "0..many" LeavePolicy : configured_for
  LeaveType "1" --> "many" LeaveBalance : typed
  LeaveType "1" --> "many" LeaveRequest : typed
  LeaveType "1" --> "0..many" LeaveWorkflowRule : has_rules

  LeavePeriod "1" --> "many" LeaveBalance : in_period
  LeavePeriod "1" --> "many" LeaveRequest : in_period

  Employee "1" --> "many" LeaveBalance : has
  Employee "1" --> "many" LeaveRequest : requests
  Employee "1" --> "many" RecoveryIndex : has

  LeaveBalance "1" --> "many" LeaveBalanceAdjustment : adjustments

  LeaveRequest "1" --> "many" LeaveApproval : approvals

  OrgUnit "1" --> "many" RosterRule : constrained_by
  OrgUnit "0..1" --> "many" LeaveWellnessSignalAggregate : aggregated_by
