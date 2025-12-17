user stories with acceptance criteria. 

## Module: People Core

### EPIC: Unified Person & Employee Identity

*(PW-CORE-01, 02, 03, 04)*

#### US-CORE-01 – Create and maintain Person records

**Story**
As an **HR user**, I want to create and maintain Person records so that people can be consistently identified across tenants and Zimasa products.

**Related requirements:** PW-CORE-01

**Acceptance Criteria**

* **Given** I am an authenticated HR user
  **When** I create a new Person with mandatory fields (name, date of birth, gender, nationality) and at least one contact detail
  **Then** the system shall save the Person record with a generated `personId`.

* **Given** a Person already exists
  **When** I add or update multiple emails/phones/addresses and mark one as “primary”
  **Then** the system shall ensure exactly one primary per contact type and persist the changes.

* **Given** I am editing a Person
  **When** I add ID details (e.g. national ID, passport, tax ID)
  **Then** the system shall store these values in the Person record using the configured ID types for that country.

* **Given** I have search access
  **When** I search for a Person by name or ID
  **Then** the system shall return matching Person records scoped to my tenant/permissions (no cross-tenant leakage).

---

#### US-CORE-02 – Create Employee for a tenant from an existing Person

**Story**
As an **HR user**, I want to link a Person to an Employee record for my tenant so that I can manage their employment details safely per tenant.

**Related requirements:** PW-CORE-02, PW-CORE-03, PW-CORE-04

**Acceptance Criteria**

* **Given** a Person exists and I am in Tenant A
  **When** I create a new Employee for that Person in Tenant A with employee number, hire date and employment type
  **Then** the system shall create an Employee record linked to the Person and tagged with Tenant A.

* **Given** a Person exists in Tenant A as an Employee
  **When** I (as HR in Tenant B) try to create an Employee for the same Person in Tenant B
  **Then** the system shall allow it and create a separate Employee record linked to the same Person but scoped to Tenant B.

* **Given** I am an HR user in Tenant A
  **When** I search or list Employees
  **Then** I shall only see Employees belonging to Tenant A and never Employees from Tenant B.

* **Given** I have API access with a Tenant A token
  **When** I call an Employee API endpoint with no cross-tenant override
  **Then** the system shall enforce tenant scoping and reject any attempt to access Employees from other tenants.

---

#### US-CORE-03 – Manage Employee employment status

**Story**
As an **HR user**, I want to update an Employee’s employment status so that I can reflect lifecycle changes (probation, suspension, exit).

**Related requirements:** PW-CORE-02, PW-CORE-07

**Acceptance Criteria**

* **Given** an Employee exists with status `Active`
  **When** I change their status to `Probation` with an effective date and reason
  **Then** the system shall record the new status and append a record in EmploymentStatusHistory.

* **Given** an Employee has multiple status changes over time
  **When** I view their employment status history
  **Then** I shall see a chronological list with previous status, new status, effective date and reason.

* **Given** I run a “Leavers” report for a period
  **When** the system processes employment status history entries with status `Exited` in that period
  **Then** it shall include those Employees in the report with their exit date.

---

### EPIC: Manage Employment Lifecycle

*(PW-CORE-05, 06, 07, 08)*

#### US-CORE-04 – Create and update employment contracts

**Story**
As an **HR user**, I want to create and update employment contracts so that contractual terms and key dates are tracked over time.

**Related requirements:** PW-CORE-05, PW-CORE-06

**Acceptance Criteria**

* **Given** an Employee exists
  **When** I create a contract with contract type, start date, optional end date and probation end date
  **Then** the system shall save the contract with status `Draft` or `Active` as selected.

* **Given** an active contract exists
  **When** I set its end date in the past or future and update status to `Ended`
  **Then** the system shall mark the contract as ended and retain it in the contract history.

* **Given** an Employee has multiple contracts over time
  **When** I view that Employee’s contract history
  **Then** I shall see a list of all contracts with their type, start/end dates and status.

* **Given** the contract form requires a primary Position Assignment reference
  **When** I choose a Position Assignment and save
  **Then** the contract shall be linked to that Position Assignment.

---

#### US-CORE-05 – Run joiners/leavers/status change reports

**Story**
As an **HR user**, I want to run reports on joiners, leavers and status changes so that I can monitor workforce movement.

**Related requirements:** PW-CORE-08, PW-CORE-07

**Acceptance Criteria**

* **Given** I provide a date range and select “Joiners”
  **When** the report runs
  **Then** the system shall list Employees whose first `Active` status started in that period.

* **Given** I select “Leavers” for a date range
  **When** the report runs
  **Then** the system shall list Employees whose status changed to `Exited` with effective dates within that range.

* **Given** I select “Status changes” for a date range
  **When** the report runs
  **Then** the system shall list all status history records in that range, grouped by Employee, showing old status, new status, effective date and reason.

---

### EPIC: Enrich Employee Context

*(PW-CORE-09, 10, 11, 12, 13)*

#### US-CORE-06 – Capture employee dependents for wellness eligibility

**Story**
As an **HR user**, I want to capture dependents for an employee so that I can determine basic wellness program eligibility without full benefits admin.

**Related requirements:** PW-CORE-09, PW-CORE-10

**Acceptance Criteria**

* **Given** an Employee exists
  **When** I add a dependent with relationship, date of birth and “included in health cover” flag
  **Then** the system shall save the dependent linked to that Employee.

* **Given** I am viewing an Employee profile
  **When** there are dependents recorded
  **Then** I shall see a simple list of dependents with relationship, DOB and cover-flag, without full benefits details.

* **Given** a requirement to export wellness eligibility data
  **When** I run a dependents export
  **Then** the output shall include Employee reference and basic dependent fields only, consistent with MVP scope (no full benefits structures).

---

#### US-CORE-07 – Record education and professional qualifications

**Story**
As an **HR user**, I want to record simple education and professional qualifications so that managers have context for performance and development.

**Related requirements:** PW-CORE-11, PW-CORE-13

**Acceptance Criteria**

* **Given** a Person exists
  **When** I add a qualification with type (education or professional), institution, qualification name, level and year completed
  **Then** the system shall store the qualification linked to that Person.

* **Given** I am viewing a Person profile
  **When** there are multiple qualifications
  **Then** I shall see them in a simple list sorted by year completed, without complex hierarchies (e.g. subject modules).

* **Given** the MVP scope
  **When** I attempt to add detailed subject/curriculum data
  **Then** the system shall either not offer such fields or ignore them per design (no deep hierarchies).

---

#### US-CORE-08 – Record prior employment history

**Story**
As an **HR user**, I want to store a summary of prior employment so that managers can understand an employee’s background at a glance.

**Related requirements:** PW-CORE-12, PW-CORE-13

**Acceptance Criteria**

* **Given** a Person exists
  **When** I add prior employment with employer name, role title, start date and end date
  **Then** the system shall store the record linked to that Person.

* **Given** I view a Person’s prior employment
  **When** multiple entries exist
  **Then** they shall be displayed in chronological order with minimal fields, consistent with the “summary only” MVP scope.

---

### EPIC: Wellness Engagement Profile

*(PW-CORE-14, 15, 16)*

#### US-CORE-09 – Maintain wellness engagement profile

**Story**
As an **HR/Wellness admin**, I want to manage each employee’s wellness engagement profile so that nudges and AI insights can be tailored.

**Related requirements:** PW-CORE-14, PW-CORE-15

**Acceptance Criteria**

* **Given** an Employee exists
  **When** I set their consent flag, preferred communication channel and add/remove engagement tags from ZHEP
  **Then** the system shall store these values in a dedicated wellness engagement profile.

* **Given** an Employee’s engagement tags are updated (e.g. from “low engagement” to “active participant”)
  **When** I view their profile
  **Then** I shall see the latest tags that can be used by AI and gamification logic.

* **Given** an AI feature requests context for an Employee
  **When** the system builds the context
  **Then** it shall include relevant wellness engagement fields (consent, channel, tags) in a non-clinical way.

---

#### US-CORE-10 – Protect wellness data from punitive use

**Story**
As a **compliance officer**, I want wellness engagement data to be clearly protected from punitive use so that employees can trust the system.

**Related requirements:** PW-CORE-16

**Acceptance Criteria**

* **Given** an HR user views wellness engagement profile fields
  **When** they try to use these fields as hard filters in disciplinary reports (e.g. “show all low engagement employees for disciplinary action”)
  **Then** the system shall not provide such filters directly, or clearly warn that data is not intended for punitive decisions.

* **Given** an API consumer calls an endpoint for wellness engagement data
  **When** the response is returned
  **Then** documentation and metadata shall indicate that this data is for engagement and coaching, not for disciplinary algorithms (implementation detail could be in API docs / internal design).

---

## Module: Work Lattice (Org & Jobs)

### EPIC: Design Org Structure & Hierarchy

*(PW-ORG-01, 02)*

#### US-ORG-01 – Maintain org unit hierarchy

**Story**
As an **HR admin**, I want to create and maintain an org unit hierarchy so that departments, teams and cost centres are clearly structured.

**Related requirements:** PW-ORG-01, PW-ORG-02

**Acceptance Criteria**

* **Given** I am in a tenant
  **When** I create an Org Unit with code, name, type and no parent
  **Then** it shall become a top-level Org Unit for that tenant.

* **Given** a top-level Org Unit exists
  **When** I create another Org Unit and set its parent to the top-level
  **Then** the system shall record the parent-child relationship and show a hierarchical tree.

* **Given** an Org Unit has effective from/to dates
  **When** I view the active structure on a given date
  **Then** only Org Units whose effective period covers that date shall be shown as active.

---

### EPIC: Define Job Roles & Requirements

*(PW-ORG-03, 04, 09, 10)*

#### US-ORG-02 – Create job roles

**Story**
As an **HR/Comp & Benefits user**, I want to define job roles so that positions and performance templates can reference consistent role definitions.

**Related requirements:** PW-ORG-03, PW-ORG-04

**Acceptance Criteria**

* **Given** I create a Job Role with name, description, job family and level/band
  **When** I save
  **Then** the system shall persist the Job Role and make it selectable for positions and performance templates.

* **Given** a Job Role is in use by multiple positions
  **When** I update its description or job family
  **Then** all referencing positions shall continue to reference the updated Job Role (no orphaning).

---

#### US-ORG-03 – Capture simple job requirements

**Story**
As an **HR/People Ops user**, I want to capture simple job requirements for each role so that performance and development have clear context.

**Related requirements:** PW-ORG-09, PW-ORG-10

**Acceptance Criteria**

* **Given** a Job Role exists
  **When** I enter minimum qualification level, desired years of experience and key skills tags
  **Then** the system shall store these as that Job Role’s job requirements.

* **Given** a manager views an employee’s performance template or profile
  **When** job requirements exist for that employee’s Job Role
  **Then** the system shall display them as context only, without using them for automated recruitment matching.

---

### EPIC: Manage Positions & Reporting Lines

*(PW-ORG-05, 06)*

#### US-ORG-04 – Maintain positions linked to org units and job roles

**Story**
As an **HR admin**, I want to create positions linked to org units and job roles so that the structure of seats in the organisation is clear.

**Related requirements:** PW-ORG-05

**Acceptance Criteria**

* **Given** an Org Unit and Job Role exist
  **When** I create a Position with a code, title, org unit and job role
  **Then** the system shall persist the Position and associate it with both the Org Unit and Job Role.

* **Given** Positions exist in multiple Org Units
  **When** I view the org chart by Org Unit
  **Then** I shall see positions nested under their Org Units.

---

#### US-ORG-05 – Configure primary and secondary reporting lines

**Story**
As an **HR admin**, I want to define primary and optional secondary reporting lines for positions so that matrix structures are supported.

**Related requirements:** PW-ORG-06

**Acceptance Criteria**

* **Given** two Positions exist
  **When** I set Position A’s primary “reports-to” as Position B
  **Then** the system shall enforce that exactly one primary reporting line exists for Position A.

* **Given** a primary reporting line is set for a Position
  **When** I add a secondary “reports-to” position
  **Then** the system shall store the secondary reporting relationship without violating the single-primary rule.

* **Given** I am viewing a manager’s team in MSS
  **When** employees report through primary positions
  **Then** they shall be shown in that manager’s direct reports list.

---

### EPIC: Manage Position Assignments & Movements

*(PW-ORG-07, 08)*

#### US-ORG-06 – Assign employee to position

**Story**
As an **HR user**, I want to assign an employee to a position so that we can track who occupies which seat at any given time.

**Related requirements:** PW-ORG-07

**Acceptance Criteria**

* **Given** an Employee and a Position exist
  **When** I create a Position Assignment with start date, mark it as primary, and leave end date blank
  **Then** the system shall record a current primary assignment for that Employee and Position.

* **Given** an Employee already has a primary Position Assignment
  **When** I attempt to create another primary assignment overlapping in time
  **Then** the system shall either prevent the overlap or require closing the previous primary assignment, depending on configured rules.

---

#### US-ORG-07 – Track assignment history for moves and promotions

**Story**
As an **HR user**, I want to track assignment history so that transfers, promotions and secondments are visible over time.

**Related requirements:** PW-ORG-08

**Acceptance Criteria**

* **Given** an Employee has multiple Position Assignments over time
  **When** I view their assignment history
  **Then** I shall see each assignment with position, org unit, primary/secondary flag, start date and end date.

* **Given** a manager views their current team
  **When** the system computes team membership
  **Then** it shall consider only active Position Assignments with current date between start and end date (or no end date).

---

## Module: Rhythms (Leave & Absence)

### EPIC: Configurable Leave Types & Policies

*(PW-LEAVE-01, 02, 03)*

#### US-LEAVE-01 – Configure leave types

**Story**
As an **HR admin**, I want to configure leave types so that our leave policies (including wellness leave) are correctly represented.

**Related requirements:** PW-LEAVE-01, PW-LEAVE-02

**Acceptance Criteria**

* **Given** I am in a tenant’s leave settings
  **When** I create a new Leave Type with name, category, isPaid flag, requiresAttachment, min/max duration and wellness flag
  **Then** the system shall save the Leave Type and make it selectable in leave requests.

* **Given** default leave types exist (annual, sick, maternity, etc.)
  **When** I review them
  **Then** I shall see them pre-configured with sensible defaults that I can edit.

---

#### US-LEAVE-02 – Configure leave accrual and caps

**Story**
As an **HR admin**, I want to set simple accrual rules and caps per leave type so that balances are computed accurately.

**Related requirements:** PW-LEAVE-02, PW-LEAVE-03

**Acceptance Criteria**

* **Given** a Leave Type exists
  **When** I configure its policy with accrual model (NONE, ANNUAL, MONTHLY), days per period, max annual entitlement, carry-forward rules and pro-rata rules
  **Then** the system shall store the policy for that leave type and tenant.

* **Given** a leave policy is set to MONTHLY with defined days per period
  **When** the system runs its accrual job for that period
  **Then** it shall increase each eligible employee’s leave balance accordingly.

---

### EPIC: Leave Periods & Balance Accounting

*(PW-LEAVE-04, 05, 06, 07, 08)*

#### US-LEAVE-03 – Set active leave period

**Story**
As an **HR admin**, I want to define the active leave period so that balances are tracked within the correct year or fiscal cycle.

**Related requirements:** PW-LEAVE-04, PW-LEAVE-05

**Acceptance Criteria**

* **Given** I choose a period type (calendar or fiscal) and specify start and end dates
  **When** I save the Leave Period as active
  **Then** the system shall use it as the default period for balance calculations.

* **Given** the end of the Leave Period is reached
  **When** I trigger or schedule rollover
  **Then** the system shall create the new period and apply carry-forward rules to balances.

---

#### US-LEAVE-04 – Maintain leave balances per employee

**Story**
As an **HR or system admin**, I want the system to maintain leave balances per employee and type so that usage and accruals are transparent.

**Related requirements:** PW-LEAVE-06, PW-LEAVE-07, PW-LEAVE-08

**Acceptance Criteria**

* **Given** leave policies and a Leave Period are configured
  **When** the system runs accrual
  **Then** it shall compute opening, accrued and closing balances for each employee and leave type.

* **Given** a leave request is approved
  **When** the system applies it
  **Then** it shall deduct the approved days from the employee’s balance for that leave type and period.

* **Given** I need to correct a balance
  **When** I perform a manual adjustment
  **Then** the system shall adjust the balance and log an auditable adjustment record.

---

### EPIC: Employees Manage Their Own Leave

*(PW-LEAVE-09, 10, 11)*

#### US-LEAVE-05 – Submit a leave request with visibility of balance

**Story**
As an **Employee**, I want to submit a leave request and see my available balance so that I don’t request more leave than I have.

**Related requirements:** PW-LEAVE-09, PW-LEAVE-10, PW-LEAVE-11

**Acceptance Criteria**

* **Given** I have ESS access
  **When** I open the leave request form and select a leave type
  **Then** the system shall display my current available balance for that type.

* **Given** I enter start and end dates (and partial day if applicable)
  **When** I submit the request
  **Then** the system shall validate overlapping dates, balance sufficiency and leave period boundaries.

* **Given** the requested duration exceeds my available balance
  **When** I attempt to submit
  **Then** the system shall show a clear warning and either block submission or mark it as “exceeds balance”, according to configuration.

---

### EPIC: Flexible Leave Approval Workflows

*(PW-LEAVE-12, 13)*

#### US-LEAVE-06 – Approve leave via default workflow

**Story**
As a **Manager**, I want to approve or decline leave requests so that I can manage my team’s time off.

**Related requirements:** PW-LEAVE-12

**Acceptance Criteria**

* **Given** I have direct reports
  **When** they submit leave requests
  **Then** those requests shall appear in my approval queue.

* **Given** a leave request is pending my approval
  **When** I approve it
  **Then** the system shall mark it as approved and trigger any configured post-approval actions (e.g. balance update, notifications).

---

#### US-LEAVE-07 – Configure leave approval levels

**Story**
As an **HR admin**, I want to configure one or two-level approval and special routing so that sensitive leave types (e.g. wellness) are handled correctly.

**Related requirements:** PW-LEAVE-13

**Acceptance Criteria**

* **Given** I configure leave workflow for a leave type with 2 levels (Manager then HR)
  **When** an employee submits that leave type
  **Then** the request shall first go to the Manager, then to HR after manager approval.

* **Given** I mark a wellness leave type to notify a wellness champion
  **When** such a request is approved
  **Then** the system shall send a notification to the configured wellness champion role or user.

---

### EPIC: Team Calendars & Capacity Protection

*(PW-LEAVE-14, 15, 16, 17, 18)*

#### US-LEAVE-08 – View team leave calendar

**Story**
As a **Manager**, I want to view a team leave calendar so that I can quickly see who is off when.

**Related requirements:** PW-LEAVE-14, PW-LEAVE-15

**Acceptance Criteria**

* **Given** I have direct reports
  **When** I open the team leave calendar
  **Then** I shall see approved and pending leave for my team in weekly or monthly views.

* **Given** the calendar is displayed
  **When** I apply filters by leave type, person or org unit
  **Then** the view shall update to show only matching leave entries.

---

#### US-LEAVE-09 – Enforce simple roster rules

**Story**
As an **HR or Operations manager**, I want to configure simple capacity rules so that critical teams are not understaffed.

**Related requirements:** PW-LEAVE-16, PW-LEAVE-17, PW-LEAVE-18

**Acceptance Criteria**

* **Given** an Org Unit exists
  **When** I configure a roster rule with minimum staff on duty and/or maximum simultaneous leaves
  **Then** the system shall store and apply this rule when leave requests are created or approved.

* **Given** a new leave request would breach a roster rule
  **When** a manager tries to approve it
  **Then** the system shall display a warning indicating the rule that would be breached.

* **Given** I have override permission
  **When** I choose to approve despite the warning
  **Then** the system shall allow approval and log that a roster rule was overridden.

---

### EPIC: Recovery Index for Rest & Recharge

*(PW-LEAVE-19, 20, 21, 22)*

#### US-LEAVE-10 – Compute and display Recovery Index

**Story**
As an **Employee**, I want to see my Recovery Index so that I understand whether I am taking enough rest.

**Related requirements:** PW-LEAVE-19, PW-LEAVE-20

**Acceptance Criteria**

* **Given** my leave usage and entitlements
  **When** the system computes Recovery Index for the current period
  **Then** it shall produce an index value and status (e.g. green/amber/red) based on configured rules.

* **Given** the Recovery Index is computed
  **When** I view my ESS dashboard
  **Then** I shall see my current Recovery Index and a simple explanation (e.g. “You have not taken a 3+ day break in the last 6 months”).

---

#### US-LEAVE-11 – Managers and HR view Recovery Index distributions

**Story**
As a **Manager/HR user**, I want to see Recovery Index across my team/org so that I can identify under-rested or at-risk groups.

**Related requirements:** PW-LEAVE-21, PW-LEAVE-22

**Acceptance Criteria**

* **Given** Recovery Index has been computed for employees
  **When** I open the manager Recovery view
  **Then** I shall see distribution of green/amber/red across my direct reports and teams.

* **Given** I am an HR user
  **When** I open the organization Recovery view
  **Then** I shall see index summary grouped by org units and the ability to filter by manager, department or period.

---

### EPIC: Leave-Based Wellness Signals to ZHEP

*(PW-LEAVE-23, 24)*

#### US-LEAVE-12 – Generate anonymised leave wellness signals

**Story**
As a **Platform/Wellness owner**, I want the system to generate anonymised leave wellness signals so that ZHEP can drive interventions without exposing individuals.

**Related requirements:** PW-LEAVE-23, PW-LEAVE-24

**Acceptance Criteria**

* **Given** leave usage and Recovery Index data exists
  **When** a scheduled job runs for wellness signal generation
  **Then** it shall produce aggregate metrics such as under-use of leave, over-use of sick leave and no-break patterns at org unit or group level.

* **Given** tenant configuration for anonymisation
  **When** wellness signals are sent to ZHEP
  **Then** the system shall ensure no individually identifiable employee data is included where configuration requires aggregation.

---

## Module: Growth Signals (Performance & Check-ins)

### EPIC: Configure Performance Cycles & Templates

*(PW-PERF-01, 02, 03, 04, 05, 19)*

#### US-PERF-01 – Create performance cycles

**Story**
As an **HR user**, I want to create performance cycles so that I can structure when appraisals happen and track their status.

**Related requirements:** PW-PERF-01, PW-PERF-02

**Acceptance Criteria**

* **Given** I am an authenticated HR user
  **When** I create a performance cycle with code, name, start date, end date and status
  **Then** the system shall save the cycle and show it in the list of cycles for that tenant.
* **Given** a performance cycle exists
  **When** I update its status from `Planning` to `Active`
  **Then** the system shall prevent further structural changes (e.g. removing sections/templates) but allow assignment of appraisals.
* **Given** a performance cycle is `Closed`
  **When** I attempt to change start/end dates
  **Then** the system shall prevent such edits or require an admin override with audit (implementation choice, but behaviour must be consistent).

---

#### US-PERF-02 – Configure performance templates and sections

**Story**
As an **HR user**, I want to configure performance templates and sections so that different roles can use tailored appraisal structures.

**Related requirements:** PW-PERF-03, PW-PERF-04, PW-PERF-05

**Acceptance Criteria**

* **Given** I create a performance template with a name and optional Job Role/family mapping
  **When** I add sections (e.g. Self Reflection, Job KPIs, OKRs, Values) with isScoring and weight%
  **Then** the system shall store the template with ordered sections and enforce that total scoring section weights add up to 100% (or another configured rule).
* **Given** a template exists
  **When** I assign it to a Job Role or job family
  **Then** any new appraisals for employees with that role/family in the given cycle shall use that template.
* **Given** I mark a section as non-scoring (e.g. Self Reflection)
  **When** appraisals are created from that template
  **Then** that section shall not contribute to numeric scoring but shall still require responses if configured as mandatory.

---

#### US-PERF-03 – Configure rating bands

**Story**
As an **HR user**, I want to define rating bands so that overall scores can be mapped to simple labels (e.g. Meets, Exceeds).

**Related requirements:** PW-PERF-19

**Acceptance Criteria**

* **Given** I create rating bands with names, minScore and maxScore
  **When** I save
  **Then** the system shall validate that score ranges do not overlap and cover the desired spectrum.
* **Given** rating bands are configured
  **When** an appraisal overall score is computed
  **Then** the system shall map it to the appropriate band and store that band on the appraisal.

---

### EPIC: Capture Rich Performance Feedback & Goals

*(PW-PERF-06, 07, 08, 09, 10, 11, 12, 13)*

#### US-PERF-04 – Configure questions for narrative sections

**Story**
As an **HR user**, I want to configure questions for narrative sections so that self reflection and values feedback are structured.

**Related requirements:** PW-PERF-06, PW-PERF-07

**Acceptance Criteria**

* **Given** a performance template and section exist
  **When** I add a question with text, optional help text and response type (TEXT/RATING/RATING+TEXT)
  **Then** the system shall store the question under that section.
* **Given** a template with questions is assigned to a cycle
  **When** appraisals are generated for employees under that template
  **Then** each appraisal shall include those questions for self, manager and agreed responses as configured.

---

#### US-PERF-05 – Capture answers for narrative questions

**Story**
As an **employee or manager**, I want to answer narrative questions so that appraisals capture rich feedback from both sides.

**Related requirements:** PW-PERF-08, PW-PERF-09

**Acceptance Criteria**

* **Given** an appraisal is in self-review status
  **When** I (employee) enter ratings/comments for questions
  **Then** the system shall record selfRating/selfComment for each question without exposing manager/HR inputs yet.
* **Given** an appraisal is in manager-review status
  **When** the manager answers the same questions
  **Then** the system shall record managerRating/managerComment in the same PerfAnswer records.
* **Given** the appraisal reaches “agreed” stage
  **When** the manager and employee set final agreed ratings/comments
  **Then** the system shall store finalRating/finalComment for each question.

---

#### US-PERF-06 – Define KPI items per appraisal

**Story**
As a **manager or employee**, I want to define KPI items per appraisal so that job-specific targets are reflected in scoring.

**Related requirements:** PW-PERF-10, PW-PERF-11

**Acceptance Criteria**

* **Given** an appraisal exists with a KPI section
  **When** I add KPI items with title, description, target and weight%
  **Then** the system shall save each KPI item and enforce that their weights sum to 100% for the KPI section.
* **Given** KPI ratings are entered by self/manager/final
  **When** the system computes the KPI section score
  **Then** it shall use the weighted sum of each item’s rating according to configured rules (e.g. using final ratings for overall).

---

#### US-PERF-07 – Record OKR initiatives per appraisal

**Story**
As a **manager or employee**, I want to record OKR initiatives per appraisal so that key projects and contributions are reflected.

**Related requirements:** PW-PERF-12, PW-PERF-13

**Acceptance Criteria**

* **Given** an appraisal has an OKR section
  **When** I add initiatives with name, objective, role description and weight%
  **Then** the system shall save the initiatives and enforce valid weighting.
* **Given** ratings for initiatives are captured
  **When** the system computes the OKR section score
  **Then** it shall use weighted averages to compute section-level scores.

---

### EPIC: Run Appraisal Workflow & Scoring

*(PW-PERF-14, 15, 16, 17, 18)*

#### US-PERF-08 – Generate appraisals for employees in a cycle

**Story**
As an **HR user**, I want the system to generate appraisals for employees in a cycle so that everyone has the correct form assigned.

**Related requirements:** PW-PERF-14

**Acceptance Criteria**

* **Given** a performance cycle is `Active` and templates are mapped to roles/families
  **When** I trigger appraisal generation for that cycle
  **Then** the system shall create one appraisal per in-scope Employee, referencing the correct template and sections.
* **Given** an employee joins mid-cycle
  **When** I run a “generate appraisals for new joiners” action
  **Then** the system shall create an appraisal for that employee if they meet inclusion criteria.

---

#### US-PERF-09 – Progress appraisals through workflow

**Story**
As a **manager**, I want to move appraisals through self-review, manager-review and finalisation so that the cycle can be completed.

**Related requirements:** PW-PERF-15, PW-PERF-16

**Acceptance Criteria**

* **Given** an appraisal is in `Self-Review` status
  **When** the employee submits their review
  **Then** the system shall transition the appraisal to `Manager-Review`, provided required fields are complete.
* **Given** an appraisal is in `Manager-Review`
  **When** the manager submits their review
  **Then** the system shall transition it to `HR-Review` or `Finalised` depending on configured steps.
* **Given** an appraisal is `Finalised`
  **When** a non-HR user tries to edit it
  **Then** the system shall block changes and show that the appraisal is read-only.
* **Given** an HR user with override permission
  **When** they update a finalised appraisal
  **Then** the system shall log an audit entry with who, when and what changed.

---

#### US-PERF-10 – Compute section and overall scores

**Story**
As an **HR/manager**, I want appraisal scores to be computed automatically so that ratings are consistent and transparent.

**Related requirements:** PW-PERF-17, PW-PERF-18, PW-PERF-19

**Acceptance Criteria**

* **Given** scoring sections and ratings exist
  **When** the system computes section scores
  **Then** it shall calculate Self, Manager and Final section scores using configured formulas.
* **Given** section weights are defined
  **When** the system computes an overall score
  **Then** it shall use the weighted sum of final section scores and store the result on the appraisal.
* **Given** rating bands are configured
  **When** an overall score is computed
  **Then** the system shall map the score to a band and persist that band.

---

### EPIC: Growth & Wellness Commitments

*(PW-PERF-20, 21)*

#### US-PERF-11 – Capture growth and wellness actions

**Story**
As a **manager**, I want to capture post-appraisal actions including at least one wellness commitment so that follow-ups are explicit.

**Related requirements:** PW-PERF-20

**Acceptance Criteria**

* **Given** an appraisal is nearing completion
  **When** I open the “Growth & Wellness Actions” section
  **Then** I shall be able to add 3–5 actions classified as performance, L&D or wellness.
* **Given** I have added actions
  **When** I attempt to finalise the appraisal without any wellness-tagged action
  **Then** the system shall warn me that at least one wellness-related action is recommended/required (as per configuration).

---

#### US-PERF-12 – Send wellness actions to ZHEP

**Story**
As a **Wellness/Platform owner**, I want wellness actions to be exposed to ZHEP so that they can become part of the broader wellness journey.

**Related requirements:** PW-PERF-21, PW-INT-01

**Acceptance Criteria**

* **Given** an appraisal has wellness-tagged actions
  **When** the appraisal is finalised
  **Then** the system shall emit an event or API call that includes those wellness actions in a form consumable by ZHEP.
* **Given** ZHEP integration is enabled
  **When** such an event is delivered successfully
  **Then** the action should be marked as “synced to ZHEP” in PeopleWell.

---

### EPIC: Continuous Check-ins & Wellbeing Signals

*(PW-PERF-22, 23, 24)*

#### US-PERF-13 – Record 1:1 check-ins with wellbeing scores

**Story**
As a **manager or employee**, I want to record ad-hoc check-ins with basic energy/workload/stress scores so that we can track wellbeing trends.

**Related requirements:** PW-PERF-22

**Acceptance Criteria**

* **Given** I schedule or log a check-in
  **When** I enter date/time, summary and numeric scores for energy, workload and stress
  **Then** the system shall save the check-in linked to the employee and manager.

---

#### US-PERF-14 – Use check-ins as input to insights (non-punitive)

**Story**
As a **product/compliance owner**, I want check-ins to feed insights but not be used directly for punitive actions so that people feel safe being honest.

**Related requirements:** PW-PERF-23, PW-PERF-24

**Acceptance Criteria**

* **Given** the Manager Copilot requests team wellbeing context
  **When** the system compiles signals
  **Then** it shall include check-in trends (e.g. average stress) as one of the inputs.
* **Given** a user attempts to filter for “employees with low energy for disciplinary list”
  **When** such a reporting feature is invoked
  **Then** the system shall either not provide this report or clearly restrict check-in scores from direct punitive list generation in line with policy.

---

## Module: Gamification

### EPIC: Points & Levels for Healthy Habits

*(PW-GAME-01, 02, 03, 04, 05)*

#### US-GAME-01 – Award points for healthy behaviours

**Story**
As a **product owner/HR**, I want the system to award points for defined healthy behaviours so that we can positively reinforce good patterns.

**Related requirements:** PW-GAME-01, PW-GAME-02

**Acceptance Criteria**

* **Given** a points rule is configured for “complete self-review on time”
  **When** an employee submits their self-review before the deadline
  **Then** the system shall create a points transaction for that employee with the configured number of points.
* **Given** a rule exists for “planning and taking balanced leave”
  **When** an employee plans a 3+ day break and the leave is approved
  **Then** the system shall award points according to the rule.
* **Given** tenant-safe templates for points rules
  **When** an admin configures new rules
  **Then** only allowed, wellness-safe rule types shall be available (no reward for long hours, etc.).

---

#### US-GAME-02 – Display levels based on cumulative points

**Story**
As an **employee**, I want to see my level based on cumulative points so that I understand my progress in building healthy habits.

**Related requirements:** PW-GAME-03, PW-GAME-04, PW-GAME-05

**Acceptance Criteria**

* **Given** level thresholds (Getting Started, Steady, Thriving) are configured
  **When** my cumulative points cross a threshold
  **Then** the system shall update my current level accordingly.
* **Given** I view my profile/dashboard
  **When** my level is computed
  **Then** I shall see my current level and what it roughly means.
* **Given** the system does not support competitive leaderboards
  **When** I look for rankings of individuals by level
  **Then** no such public rankings shall be available in MVP.

---

### EPIC: Team Wellness Challenges

*(PW-GAME-06, 07, 08)*

#### US-GAME-03 – Configure team wellness challenges

**Story**
As an **HR or wellness admin**, I want to configure team challenges around rest and check-in cadence so that teams are nudged in a positive way.

**Related requirements:** PW-GAME-06

**Acceptance Criteria**

* **Given** I create a challenge such as “Quarter of Recovery” with target “all team members take at least one X-day break this quarter”
  **When** I assign it to one or more teams/org units
  **Then** the system shall track relevant behaviours for those teams over the defined period.

---

#### US-GAME-04 – Track challenge participation at team level

**Story**
As a **manager**, I want to see my team’s challenge progress so that I know whether we are moving in the right direction.

**Related requirements:** PW-GAME-07, PW-GAME-08

**Acceptance Criteria**

* **Given** a challenge is active for my team
  **When** I view the challenge dashboard
  **Then** I shall see team-level completion percentage and high-level trends, not individual rankings.
* **Given** HR views challenge reporting
  **When** they view by org unit
  **Then** they shall see aggregated completion rates and summary insights per team.

---

### EPIC: Manager Health Stewardship Scorecards

*(PW-GAME-09, 10)*

#### US-GAME-05 – Compute manager health scorecard

**Story**
As a **manager**, I want to see a health stewardship scorecard so that I understand how well I support wellbeing in my team.

**Related requirements:** PW-GAME-09, PW-GAME-10

**Acceptance Criteria**

* **Given** data on planned breaks, check-in cadence and Recovery Index exists
  **When** the system computes my scorecard for a period
  **Then** it shall display metrics such as % of direct reports with planned breaks and distribution of Recovery statuses.
* **Given** scorecards are private
  **When** I view my own scorecard
  **Then** only I and HR shall have access, and there shall be no leaderboard of managers.

---

### EPIC: Wellness Visuals & Micro-Rewards

*(PW-GAME-11, 12)*

#### US-GAME-06 – Show wellness rings on employee dashboard

**Story**
As an **employee**, I want to see simple visual indicators (rings) for recovery, reflection and wellness so that I get quick feedback on my habits.

**Related requirements:** PW-GAME-11

**Acceptance Criteria**

* **Given** underlying metrics for leave usage, self-reviews and wellness actions exist
  **When** I open my dashboard
  **Then** the system shall render three visual indicators (“Recovery”, “Reflection”, “Wellness”) summarising my current status.

---

#### US-GAME-07 – Award micro-badges for positive behaviours

**Story**
As an **HR/wellness admin**, I want the system to award badges like “Recovery Planner” so that employees get positive reinforcement.

**Related requirements:** PW-GAME-12

**Acceptance Criteria**

* **Given** a badge criterion is defined (e.g. “planned two breaks this quarter”)
  **When** an employee meets that criterion
  **Then** the system shall award the badge and optionally show a short congratulatory message.
* **Given** badges are awarded
  **When** employees view their profile
  **Then** they shall see their earned wellness badges.

---

## Module: AI Layer

### EPIC: Employee Copilot for HR & Wellness Questions

*(PW-AI-01, 02)*

#### US-AI-01 – Ask the Employee Copilot HR questions

**Story**
As an **employee**, I want to ask a copilot HR questions so that I can quickly understand policies and my own data.

**Related requirements:** PW-AI-01, PW-AI-02

**Acceptance Criteria**

* **Given** I am logged in as an employee
  **When** I open the copilot widget and ask, “How much annual leave do I have?”
  **Then** the copilot shall respond using my live leave balance for that tenant.
* **Given** I ask, “What is our maternity policy?”
  **When** the copilot answers
  **Then** it shall base its response on tenant-specific policy documents and label it as AI-generated.

---

#### US-AI-02 – Ask the Employee Copilot wellness process questions

**Story**
As an **employee**, I want to ask the copilot how to access wellness programs so that I can easily use benefits available to me.

**Related requirements:** PW-AI-01, PW-AI-02

**Acceptance Criteria**

* **Given** the tenant has ZHEP-integrated programs
  **When** I ask “How do I access a mental health day?”
  **Then** the copilot shall explain the process and point to relevant leave types or programs.
* **Given** the copilot references ZHEP programs
  **When** it constructs an answer
  **Then** it shall only use high-level program catalog data and not any detailed clinical information.

---

### EPIC: Manager Insight Copilot

*(PW-AI-03, 04)*

#### US-AI-03 – Ask the Manager Copilot about team recovery

**Story**
As a **manager**, I want to ask a copilot for a summary of my team’s leave and recovery so that I can plan interventions.

**Related requirements:** PW-AI-03, PW-AI-04

**Acceptance Criteria**

* **Given** I am a manager
  **When** I ask “Summarize my team’s leave and recovery this quarter”
  **Then** the copilot shall return a short narrative including key metrics (e.g. average leave taken, % with low Recovery Index) and indicate the data it used.
* **Given** the response includes suggested actions
  **When** I read them
  **Then** they shall be phrased as suggestions (e.g. “Consider scheduling check-ins”) and not as automated decisions.

---

### EPIC: Performance Summaries & Coaching Assistance

*(PW-AI-05, 06, 07, 08, 09)*

#### US-AI-04 – Generate draft appraisal summary

**Story**
As a **manager**, I want the system to generate a draft summary of an appraisal so that I can save time while still refining the message.

**Related requirements:** PW-AI-05, PW-AI-06, PW-AI-07

**Acceptance Criteria**

* **Given** an appraisal has content (KPIs, OKRs, narrative answers, past cycles)
  **When** I click “Generate AI Summary”
  **Then** the system shall create a proposed overall summary and display it clearly as AI-generated draft.
* **Given** the draft is shown
  **When** I edit it
  **Then** the final summary saved to the appraisal shall reflect my edits, not the raw AI output.
* **Given** the summary is AI-generated
  **When** I attempt to send or publish the appraisal to the employee without review
  **Then** the system shall require explicit review/confirmation.

---

#### US-AI-05 – Get coaching suggestions while writing feedback

**Story**
As a **manager**, I want coaching suggestions while writing feedback so that my comments are constructive and wellbeing-friendly.

**Related requirements:** PW-AI-08, PW-AI-09

**Acceptance Criteria**

* **Given** I am typing feedback in an appraisal comment box
  **When** I click “Suggest coaching phrasing”
  **Then** the system shall propose wording that is constructive, specific and non-punitive.
* **Given** a coaching suggestion appears
  **When** I review it
  **Then** I can accept, modify or reject it, and it is always labelled as AI suggestion.

---

### EPIC: Smart HR Request Triage

*(PW-AI-10, 11, 12)*

#### US-AI-06 – Create HR requests and auto-classify them

**Story**
As an **employee or manager**, I want HR requests to be automatically categorised so that they reach the right HR person quickly.

**Related requirements:** PW-AI-10, PW-AI-11

**Acceptance Criteria**

* **Given** I submit an HR request describing an issue in free text
  **When** the request is saved
  **Then** the system shall run classification and propose a category (e.g. leave, contract, policy).
* **Given** a category is suggested
  **When** HR reviews the request
  **Then** they can confirm or change the category before assignment.

---

#### US-AI-07 – Get draft responses for common HR questions

**Story**
As an **HR agent**, I want draft responses for simple, repetitive requests so that I can respond faster with consistent information.

**Related requirements:** PW-AI-12

**Acceptance Criteria**

* **Given** an HR request about a standard policy (e.g. annual leave rules)
  **When** I open the request detail
  **Then** the system shall show a draft response generated from policy documents.
* **Given** I review the draft
  **When** I send the final response
  **Then** the version sent shall reflect my edits, and the system shall not auto-send AI responses without my action.

---

### EPIC: Safe & Transparent AI Governance

*(PW-AI-13, 14, 15)*

#### US-AI-08 – Label AI outputs and capture feedback

**Story**
As an **end user**, I want AI outputs to be clearly labelled and rateable so that I know what is machine-generated and can flag issues.

**Related requirements:** PW-AI-13

**Acceptance Criteria**

* **Given** any AI-generated content is shown (copilot answer, summary, coaching text)
  **When** it appears
  **Then** it shall be clearly marked as “AI-generated suggestion/draft”.
* **Given** I disagree with an AI output
  **When** I click “This is wrong/not helpful”
  **Then** the system shall capture this feedback for future tuning/guardrails.

---

#### US-AI-09 – Enforce tenant and role-scoped AI context

**Story**
As a **security architect**, I want AI prompts and context to be tenant- and role-scoped so that no cross-tenant or unauthorised data is used.

**Related requirements:** PW-AI-14, PW-AI-15

**Acceptance Criteria**

* **Given** an AI request is triggered within Tenant A by a manager
  **When** the system builds the context for the LLM
  **Then** it shall only include data from Tenant A and from entities that the manager is permitted to see.
* **Given** an AI service is called
  **When** two tenants exist (A and B)
  **Then** no request or response shall contain combined data from both tenants (e.g. no cross-tenant stats or examples).

---

## Module: ESS & MSS (Self-Service Experience)

### EPIC: Employee Self-Service Hub

*(PW-ESS-01)*

#### US-ESS-01 – Employee profile self-service

**Story**
As an **employee**, I want to view and update my permitted personal details so that my information stays accurate without going through HR for minor changes.

**Related requirements:** PW-ESS-01, PW-NFR-02

**Acceptance Criteria**

* **Given** I am logged in as an employee
  **When** I open my profile
  **Then** I shall see my personal details with some fields editable and others read-only.
* **Given** HR has configured which fields are employee-editable
  **When** I try to edit a non-editable field
  **Then** the system shall prevent the change and show a clear message.

---

#### US-ESS-02 – Employee view of employment, leave and performance

**Story**
As an **employee**, I want to view my employment, leave and performance history so that I have full visibility into my data.

**Related requirements:** PW-ESS-01

**Acceptance Criteria**

* **Given** I am logged in
  **When** I open my employment tab
  **Then** I shall see my role, org unit, manager and contract details.
* **Given** I open my leave tab
  **When** I view it
  **Then** I shall see my current leave balances and a list of past requests with statuses.
* **Given** I open my performance tab
  **When** I view it
  **Then** I shall see my current and historical appraisals and their outcomes.

---

### EPIC: Manager Self-Service Console

*(PW-MSS-01)*

#### US-MSS-01 – Manager approvals and team view

**Story**
As a **manager**, I want a single console to see my team, leave approvals and performance tasks so that I can manage people efficiently.

**Related requirements:** PW-MSS-01

**Acceptance Criteria**

* **Given** I am logged in as a manager
  **When** I open the manager console
  **Then** I shall see my direct reports, pending leave approvals and active performance actions.
* **Given** I click on a direct report
  **When** their mini-profile opens
  **Then** I shall see their role, org unit, leave status and performance status at a glance.

---

### EPIC: Role-Aware Navigation & Permissions in Self-Service

*(PW-ESS-01, PW-MSS-01, PW-NFR-02, PW-NFR-03)*

#### US-ESS-03 – Role-based UI and access

**Story**
As a **system admin**, I want the same frontend to adapt to user roles so that employees, managers, HR and execs see only what they should.

**Related requirements:** PW-ESS-01, PW-MSS-01, PW-NFR-02, PW-NFR-03

**Acceptance Criteria**

* **Given** a user has only the Employee role
  **When** they log in
  **Then** they shall see only ESS features, not manager or HR consoles.
* **Given** a user has Manager and Employee roles
  **When** they log in
  **Then** they shall see both an employee view and a manager console, with data scoped to their reports.
* **Given** RBAC is configured for HR and Exec roles
  **When** an Exec logs in
  **Then** they shall see aggregate reports but not low-level personal details beyond their authorisation.

---

### EPIC: Self-Service Wellness Experience

*(PW-ESS-01, PW-MSS-01, PW-GAME-11, PW-GAME-12, PW-LEAVE-19, 20, 21, 22)*

#### US-ESS-04 – Employee self-service wellness view

**Story**
As an **employee**, I want to see my Recovery Index, wellness rings and badges in my self-service so that wellness feels part of my normal work tools.

**Related requirements:** PW-ESS-01, PW-GAME-11, PW-GAME-12, PW-LEAVE-19, PW-LEAVE-20

**Acceptance Criteria**

* **Given** Recovery Index and gamification data is computed
  **When** I open my ESS dashboard
  **Then** I shall see recovery, reflection and wellness indicators plus any badges earned.

---

#### US-MSS-02 – Manager team wellness overview

**Story**
As a **manager**, I want to see team-level wellness indicators in MSS so that I can act early when rest patterns are unhealthy.

**Related requirements:** PW-MSS-01, PW-LEAVE-21, PW-LEAVE-22, PW-GAME-08, PW-GAME-10

**Acceptance Criteria**

* **Given** team Recovery Index and challenge completion data is available
  **When** I open the “Team Wellbeing” section
  **Then** I shall see aggregated Recovery distribution, challenge progress and my private manager health scorecard.

---

## Module: Platform (Integrations & NFRs)

### EPIC: ZHEP Wellness Integration

*(PW-INT-01, PW-INT-02, PW-LEAVE-23, PW-LEAVE-24, PW-PERF-21)*

#### US-PLAT-01 – Emit wellness events to ZHEP

**Story**
As a **platform engineer**, I want PeopleWell to emit wellness-relevant events to ZHEP so that wellness journeys can be orchestrated centrally.

**Related requirements:** PW-INT-01, PW-LEAVE-23, PW-LEAVE-24, PW-PERF-21

**Acceptance Criteria**

* **Given** an appraisal is finalised with wellness actions
  **When** the event handler runs
  **Then** it shall send an event to ZHEP including anonymised or per-employee data as configured.
* **Given** leave and Recovery Index data exist
  **When** scheduled jobs generate leave-based wellness signals
  **Then** the system shall send aggregated under-use/over-use/no-break signals to ZHEP respecting tenant anonymisation settings.

---

### EPIC: External Integrations & Open APIs

*(PW-INT-03, PW-INT-04, PW-NFR-06, PW-NFR-07, PW-NFR-12, PW-NFR-13)*

#### US-PLAT-02 – Expose REST APIs for core objects

**Story**
As an **integrations engineer**, I want REST APIs for People, Org, Leave and Performance so that external systems can integrate with PeopleWell.

**Related requirements:** PW-INT-03, PW-NFR-06

**Acceptance Criteria**

* **Given** I have a valid API token scoped to Tenant A
  **When** I call /api/employees, /api/org-units, /api/leave, /api/appraisals
  **Then** I shall receive data only for Tenant A and according to the authorised role.

---

#### US-PLAT-03 – Emit webhooks for key events

**Story**
As an **integrations engineer**, I want webhooks for events like leave approval and appraisal completion so that downstream systems can react in near real time.

**Related requirements:** PW-NFR-07

**Acceptance Criteria**

* **Given** a webhook endpoint is configured for a tenant
  **When** a leave request is approved
  **Then** the system shall POST a structured event payload to the endpoint.
* **Given** the endpoint is unavailable
  **When** the webhook POST fails
  **Then** the system shall retry using a configured backoff policy or log the failure for review.

---

### EPIC: Strong Multi-Tenancy & Isolation

*(PW-NFR-01, PW-CORE-03, PW-CORE-04, PW-AI-14, PW-AI-15)*

#### US-PLAT-04 – Enforce tenant isolation in APIs and UI

**Story**
As a **security engineer**, I want strict tenant isolation across UI, APIs and AI so that no tenant can see another’s data.

**Related requirements:** PW-NFR-01, PW-CORE-03, PW-CORE-04, PW-AI-14, PW-AI-15

**Acceptance Criteria**

* **Given** user sessions indicate a tenant
  **When** any list or search is performed
  **Then** results shall only include entities from that tenant.
* **Given** an AI call is prepared
  **When** context is compiled
  **Then** only data for the requesting tenant and authorised scope is included in the prompt.

---

### EPIC: Security, RBAC & Auditability

*(PW-NFR-02, 03, 04, 05)*

#### US-PLAT-05 – Configure roles and permissions

**Story**
As an **admin**, I want to configure roles and assign them to users so that access is limited to what each role needs.

**Related requirements:** PW-NFR-02, PW-NFR-03

**Acceptance Criteria**

* **Given** predefined base roles (Employee, Manager, HR, Admin, Exec)
  **When** I assign them to user accounts
  **Then** users shall see features consistent with those roles.
* **Given** manager scoping is enabled
  **When** a manager views team data
  **Then** they shall see only direct/indirect reports, not all employees.

---

#### US-PLAT-06 – Capture audit logs for sensitive actions

**Story**
As a **compliance officer**, I want key changes to be audited so that we can reconstruct critical decisions.

**Related requirements:** PW-NFR-04, PW-NFR-05

**Acceptance Criteria**

* **Given** a manual leave balance adjustment occurs
  **When** it is saved
  **Then** the system shall record who made the change, when and the before/after values.
* **Given** a finalised appraisal is overridden by HR
  **When** the change is saved
  **Then** an audit log entry shall be written with details of the modification.

---

### EPIC: Configurability & Simple Workflow Engine

*(PW-NFR-08, 09, PW-LEAVE-12, 13, PW-PERF-15)*

#### US-PLAT-07 – Configure simple approval workflows

**Story**
As an **HR admin**, I want to configure simple approval workflows for leave and performance so that processes match our organisation without heavy workflow tooling.

**Related requirements:** PW-NFR-08, PW-NFR-09, PW-LEAVE-12, PW-LEAVE-13, PW-PERF-15

**Acceptance Criteria**

* **Given** a visual or form-based workflow config
  **When** I set leave approvals to Manager → HR
  **Then** new leave requests shall follow that path.
* **Given** I set appraisals to Self → Manager → HR
  **When** new appraisals are started
  **Then** they shall follow that sequence with appropriate status transitions.

---

### EPIC: Onboarding at Speed (Imports & Setup)

*(PW-NFR-10, 11)*

#### US-PLAT-08 – Import core data via CSV/Excel

**Story**
As an **implementation consultant**, I want to import employees, org units and positions via templates so that tenants can be onboarded quickly.

**Related requirements:** PW-NFR-10, PW-NFR-11

**Acceptance Criteria**

* **Given** I download a template for employees/org units/positions
  **When** I upload a populated file
  **Then** the system shall validate data, highlight row errors and import valid rows.
* **Given** validation errors exist
  **When** I view the import report
  **Then** I shall see line-level error messages that I can correct and re-upload.

---

### EPIC: Insightful Reporting & Analytics Foundations

*(PW-NFR-12, 13, PW-LEAVE-21, 22, PW-GAME-08, 10)*

#### US-PLAT-09 – Run standard HR and wellness reports

**Story**
As an **HR/Exec user**, I want standard reports on headcount, leave, Recovery and gamification so that I can make data-driven decisions.

**Related requirements:** PW-NFR-12, PW-NFR-13, PW-LEAVE-21, PW-LEAVE-22, PW-GAME-08, PW-GAME-10

**Acceptance Criteria**

* **Given** I open the reporting section
  **When** I run headcount, leave usage, Recovery Index and gamification reports
  **Then** the system shall generate summaries grouped by org unit/manager as appropriate.
* **Given** a report is generated
  **When** I choose to export
  **Then** the system shall generate a CSV/Excel file with the same data.

---


