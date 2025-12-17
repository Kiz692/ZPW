## 1. Overview

**Product name:** Zimasa PeopleWell
**Role in ecosystem:** HRMS inside the Zimasa Health Engagement Platform (ZHEP)
**Target segment:** SMEs, single-country, industry-agnostic
**Primary users:** Employees, line managers, HR/People Ops, leadership

**Design intent:**
A light, modern HRMS that treats people’s energy and wellbeing as first-class data, using AI and gamification to encourage healthy, sustainable work patterns rather than overwork.

**Architecture & delivery constraints:**

* API-first, SaaS multi-tenant, with option for dedicated instances.
* Strong tenant isolation and role-based access.
* Configurable, simple workflows (no heavy BPM engine for MVP).
* Designed to integrate natively with ZHEP for wellness programs and signals.

**MVP functional scope (modules):**

1. **People Core** – Person and employee records, contracts, basic wellness engagement profile.
2. **Work Lattice** – Org units, job roles, positions, position assignments.
3. **Rhythms** – Leave and absence, balances, team calendars, simple capacity rules, Recovery Index.
4. **Growth Signals** – Performance cycles, appraisals, goals, check-ins, wellness actions.
5. **Gamification Layer** – Wellness-safe points, levels, team challenges, manager scorecards.
6. **AI Layer** – Employee and manager copilots, appraisal summarizer, coaching hints, smart HR request routing.
7. **ESS & MSS** – Employee and manager self-service portals.
8. **Integrations & Non-functional** – ZHEP integration, generic APIs, security, multi-tenancy, reporting, imports.

---

## 2. Modules and Scope

### 2.1 People Core

#### 2.1.1 Person & Employee Model

**PW-CORE-01 – Person entity**

* System shall maintain a **Person** record that can be used across Zimasa platforms, including:

  * Names.
  * Gender (from a configurable list).
  * Date of birth.
  * Nationality.
  * Multiple contact details (emails, phone numbers, addresses) with “primary” flags.
  * Identification details (e.g. national ID, passport, tax ID), configurable per country.

**PW-CORE-02 – Employee entity**

* System shall maintain an **Employee** record per tenant, which:

  * Links to a Person record.
  * Includes employee number/code, hire date, employment type (e.g. permanent, fixed-term, casual, intern, consultant).
  * Tracks employment status (e.g. planned, active, probation, suspended, exited) with effective dates.
* System shall allow a Person to be an Employee in multiple tenants.
* System shall **not** allow cross-tenant joins or cross-tenant visibility of Employee data.

#### 2.1.2 Employment & Contracts

**PW-CORE-03 – Employment contracts**

* System shall maintain **employment contract** records per Employee, including:

  * Contract type.
  * Start date and (optional) end date.
  * Probation end date.
  * Basic working pattern attributes (e.g. standard hours, days).
  * Link to a **primary Position Assignment** in the Work Lattice.
* System shall maintain contract status (e.g. draft, active, ended) and keep contract history.

**PW-CORE-04 – Employment status history**

* System shall track changes in **employment status** (e.g. active, probation, suspended, exited) with:

  * Effective dates.
  * Reason for change (from configurable list).
* System shall support reporting on joiners, leavers and status changes by period.

#### 2.1.3 Family, Qualifications, Experience

**PW-CORE-05 – Dependents (wellness-linked)**

* System shall allow capture of **dependents** per Employee, including:

  * Relationship (e.g. spouse, child, other).
  * Date of birth.
  * Indicator if included in health cover or wellness program eligibility.
* For MVP, dependents are used primarily for **wellness program eligibility**, not full benefits administration.

**PW-CORE-06 – Qualifications & experience**

* System shall store **education** and **professional qualification** details, including:

  * Institution.
  * Qualification name.
  * Level (e.g. diploma, degree).
  * Completion year.
* System shall store **prior employment summary** for context (employer, role, start and end dates).
* Structure shall remain simple; no deep curriculum or subject hierarchies in MVP.

#### 2.1.4 Wellness Engagement Profile

**PW-CORE-07 – Wellness engagement profile per employee**

* System shall maintain a **wellness engagement profile** for each Employee, including:

  * Consent flag for health and wellness engagement programs.
  * Preferred communication channel (e.g. email, SMS, WhatsApp, app), within available options.
  * High-level, non-clinical engagement tags received from ZHEP (e.g. “low engagement”, “high stress signals”, “active participant”), stored as opaque labels.
* This profile shall be used to tailor nudges and AI suggestions.
* This data shall **not** be used as a primary basis for punitive actions.

---

### 2.2 Work Lattice (Org & Jobs)

#### 2.2.1 Org Units

**PW-ORG-01 – Org unit hierarchy**

* System shall support a multi-level **Org Unit** hierarchy per tenant, including:

  * Org Unit code and name.
  * Org Unit type (e.g. Company, Department, Team, Cost Center), from configurable list.
  * Parent Org Unit (to build the hierarchy).
  * Effective from and to dates.
* System shall support multiple top-level Org Units to allow group / multi-company structures.

#### 2.2.2 Job Roles and Positions

**PW-ORG-02 – Job roles**

* System shall maintain **Job Roles** (abstract roles) including:

  * Name and description.
  * Job family and level/band.
  * Key responsibilities or summary text.
* Job Roles shall be used across positions, performance templates and basic L&D planning.

**PW-ORG-03 – Positions**

* System shall maintain **Positions** (actual seats in the structure) including:

  * Position code and title.
  * Org Unit.
  * Linked Job Role.
  * Reporting line (reports-to Position).
* System shall support an optional **secondary reporting line** (for matrix structures) while enforcing exactly one **primary** reporting line.

#### 2.2.3 Position Assignments

**PW-ORG-04 – Position assignments**

* System shall allow assignment of Employees to Positions, including:

  * Primary vs secondary assignment flags (for matrix or shared services).
  * Start and end dates.
* System shall maintain an assignment history to reflect transfers, promotions, secondments and role changes.

#### 2.2.4 Job Requirements (Light)

**PW-ORG-05 – Job requirements**

* For each Job Role, system shall store high-level **job requirements**, including:

  * Minimum qualification level.
  * Key skills (captured as tags).
  * Desired years of experience.
* These requirements are used as context in performance and development conversations and not for full recruitment/ATS matching in MVP.

---

### 2.3 Rhythms (Leave & Absence)

#### 2.3.1 Leave Types & Policies

**PW-LEAVE-01 – Leave types**

* System shall provide configurable **Leave Types** per tenant, seeded with defaults such as:

  * Annual, Sick, Maternity, Paternity, Compassionate, Unpaid.
  * Dedicated **Wellness/Mental Health** leave types.
* For each Leave Type, system shall capture:

  * Category (e.g. Annual, Sick, Wellness).
  * Whether it is paid or unpaid.
  * Whether supporting documents/attachments are required.
  * Minimum and maximum duration per request.
  * Indicator if it is wellness-related.

**PW-LEAVE-02 – Leave policy (simple)**

* For each Leave Type, system shall support basic policies including:

  * Accrual model: NONE / ANNUAL / MONTHLY, with days per period.
  * Maximum annual entitlement.
  * Carry-forward rules (allowed/not allowed, maximum carry-forward).
  * Simple pro-rata rules for joiners and leavers.

#### 2.3.2 Leave Period & Balances

**PW-LEAVE-03 – Leave period**

* System shall support a single active **Leave Period** per tenant, defined as:

  * Calendar year or fiscal year (configurable).
* System shall support period rollover and apply configured carry-forward rules.

**PW-LEAVE-04 – Leave balances**

* System shall maintain **per-employee, per-leave-type, per-period** balances including:

  * Opening balance.
  * Accrued days.
  * Days taken.
  * Adjustments.
  * Closing balance.
* Balances shall be updated automatically on approved leave.
* System shall allow manual adjustments with an audit trail.

#### 2.3.3 Leave Requests & Workflow

**PW-LEAVE-05 – Leave request (ESS/MSS)**

* System shall allow Employees to submit leave requests that include:

  * Leave type.
  * Start and end dates.
  * Partial days where applicable.
  * Reason.
  * Attachments where required.
* The request UI shall display the **available balance** for the selected leave type and warn if the requested leave exceeds balance or applicable limits.
* System shall validate leave requests against:

  * Available balance.
  * Overlapping leave.
  * Leave period dates.

**PW-LEAVE-06 – Approval workflow**

* Default workflow shall be:

  * Direct Manager → optional HR review → Approved/Rejected.
* Per tenant, system shall allow configuration of:

  * One-level or two-level approval.
  * Special routing for certain leave types (e.g. wellness leave may notify a designated wellness champion or HR role).

#### 2.3.4 Rosters & Team Calendar

**PW-LEAVE-07 – Team leave calendar**

* System shall provide a **calendar view** for managers, showing:

  * Approved and pending leave for direct reports (and optionally indirect reports).
  * Weekly and monthly views.
* Managers shall be able to filter by:

  * Leave type.
  * Employee.
  * Org Unit.

**PW-LEAVE-08 – Roster rules**

* System shall allow definition of simple **capacity rules** per Org Unit, such as:

  * Minimum staff required at work.
  * Maximum number or percentage of simultaneous leaves.
* When creating or approving a leave request, system shall:

  * Evaluate the relevant capacity rules.
  * Warn when a rule would be breached.
  * Allow override only for users with appropriate permissions.

#### 2.3.5 Recovery Index & Wellness Signals

**PW-LEAVE-09 – Recovery Index**

* System shall compute a **Recovery Index** per Employee based on:

  * Use of annual leave and wellness leave relative to entitlement.
  * Spacing of breaks (e.g. detection of extended periods without any multi-day breaks).
* System shall provide:

  * Employee view of their own Recovery Index.
  * Manager view of aggregated Recovery Index for their team.
  * HR view of Recovery Index distributions across the organization.

**PW-LEAVE-10 – Wellness signals to ZHEP**

* System shall expose anonymized and/or aggregated **leave-based wellness signals** to ZHEP, including:

  * Under-use of leave.
  * Over-use of sick leave.
  * Long periods without time off.
* Data shared shall be non-identifiable at individual level where required by configuration and policy.

---

### 2.4 Growth Signals (Performance & Check-ins)

#### 2.4.1 Performance Cycles & Templates

**PW-PERF-01 – Performance cycles**

* System shall support at least **two main appraisal cycles per year** (e.g. H1, H2) and allow tenants to add additional cycles.
* Each cycle shall have:

  * Code.
  * Name.
  * Start and end dates.
  * Status (e.g. Planning, Active, Closed).

**PW-PERF-02 – Performance templates & sections**

* System shall allow definition of **Performance Templates** per Job Role or job family.
* Each template shall consist of sections, such as:

  * Self Reflection (typically non-scoring but mandatory).
  * Job KPIs.
  * OKR Initiatives/Projects.
  * Add Value.
  * Culture/Values.
  * Learning & Development.
* For each section, configuration shall include:

  * Whether it is scoring or non-scoring.
  * Weight percentage (for scoring sections).
  * Sequence order within the template.

#### 2.4.2 Question Bank for Narrative/Behavioural Sections

**PW-PERF-03 – Template questions**

* For sections such as Self Reflection, Add Value, Culture/Values and Learning & Development, system shall allow configuration of **questions** per template and section, including:

  * Question text and optional help text.
  * Response type (e.g. free text, rating, rating + text).
  * Optional weight within the section.
* These questions shall be applied to all employees using that template in a given cycle.

**PW-PERF-04 – Appraisal answers**

* For each appraisal, for each question, system shall store:

  * Self rating and comments (where applicable).
  * Manager/Lead rating and comments.
  * Agreed/Final rating and comments (where applicable).
* Answers shall remain linked to the originating section and template question for reporting and analysis.

#### 2.4.3 Job KPIs & OKR Initiatives

**PW-PERF-05 – Job KPIs**

* System shall allow managers and employees to define KPI items per appraisal, including:

  * Title.
  * Description.
  * Target / measure (text).
  * Weight percentage within the KPI section.
  * Self, manager and agreed ratings and comments.
* System shall compute the KPI section score as a weighted sum of KPI item scores.

**PW-PERF-06 – OKR Initiatives/Projects**

* For the OKR section, system shall allow recording of initiatives/projects, including:

  * Initiative name.
  * Objective or outcome description.
  * Employee’s role or contribution.
  * Weight percentage.
  * Self, manager and agreed ratings and comments.
* System shall compute OKR section score as a weighted sum of initiative scores.

#### 2.4.4 Appraisal Workflow & Scoring

**PW-PERF-07 – Appraisal workflow**

* For each employee and cycle, system shall create an appraisal record referencing the applicable template and sections.
* Workflow shall support steps such as:

  * Self review.
  * Manager review.
  * Optional HR review.
  * Finalization.
* Once finalized, an appraisal shall be read-only, with only HR override capabilities available and all overrides audited.

**PW-PERF-08 – Scoring & rating bands**

* For each scoring section, system shall compute:

  * Self, manager and final scores based on configured weights and ratings.
* System shall compute an overall score for the appraisal as a weighted sum across scoring sections using configured section weights.
* System shall map overall scores to **rating bands** (e.g. numeric 1–5 or “Exceeds / Meets / Below”), with band definitions configurable per tenant.

#### 2.4.5 Growth & Wellness Contract

**PW-PERF-09 – Growth & wellness action block**

* At the conclusion of each appraisal, system shall support capturing **3–5 key actions** for the employee, including:

  * Performance or role-related goals.
  * Learning and development actions.
  * At least one wellness-related commitment (e.g. joining a wellness program, adjusting workload, adopting healthier work routines).
* System shall expose wellness-related actions to ZHEP as goals or activities via integration.

#### 2.4.6 Check-ins (Micro-Feedback & Wellness)

**PW-PERF-10 – Check-ins**

* System shall allow managers and employees to schedule and record **1:1 check-ins** outside formal appraisal cycles, including:

  * Date and time.
  * Summary or notes.
  * Simple ratings or indicators for perceived energy, workload and stress levels.
* Check-ins shall be available as input signals for:

  * Manager Insight Copilot.
  * Internal wellness analytics, with safeguards to prevent direct punitive use.

---

### 2.5 Gamification Layer

> **Principle:** Encourage healthy, sustainable work and recovery patterns; avoid rewarding overwork or unhealthy “hustle” behaviours.

#### 2.5.1 Points & Levels

**PW-GAME-01 – PeopleWell points**

* System shall maintain a **points system** per Employee (per tenant), where points can be earned for actions such as:

  * Completing core onboarding steps (e.g. profile completion, emergency contacts, wellness preferences).
  * Planning and taking balanced leave (e.g. scheduling multi-day breaks in advance, using wellness leave appropriately).
  * Completing self-reviews and check-ins on time.
  * Participating in eligible wellness programs from ZHEP (where tracking is permitted).
* Points rules shall be configurable per tenant within safe templates provided by PeopleWell (i.e. not fully arbitrary for MVP, to avoid unhealthy incentives).

**PW-GAME-02 – Levels**

* System shall define simple **levels** (e.g. Getting Started, Steady, Thriving) based on cumulative points thresholds.
* Levels shall be visible to each Employee and optionally to their manager.
* Levels shall **not** be displayed in competitive leaderboards in MVP.

#### 2.5.2 Team Challenges

**PW-GAME-03 – Team challenges**

* System shall provide simple **team-based challenges** such as:

  * Encouraging each team member to plan and take at least one break of a minimum number of days within a period.
  * Ensuring each team member has at least one wellbeing-oriented check-in in a given quarter.
* System shall track participation and completion **per team**, not by individual rankings.
* Managers and HR shall be able to view:

  * Percentage of completion per team.
  * High-level summaries of behaviour change (e.g. more balanced leave, improved check-in frequency).

#### 2.5.3 Manager Scorecards

**PW-GAME-04 – Manager health scorecard**

* System shall compute a non-punitive **health stewardship** scorecard for each manager, including metrics such as:

  * Proportion of direct reports with planned breaks in the upcoming period.
  * Check-in cadence (e.g. proportion of direct reports with at least one check-in in the last quarter).
  * Distribution of Recovery Index states (e.g. green/amber/red) for the manager’s team.
* Scorecards shall be visible to managers and HR only, with no public comparisons or rankings.

#### 2.5.4 Visual Feedback & Micro-Rewards

**PW-GAME-05 – Visual progress & micro-rewards**

* System shall provide simple **visual indicators** for employees, such as:

  * Recovery indicator (e.g. ring) based on leave and Recovery Index.
  * Reflection indicator based on timely completion of self-reviews and check-ins.
  * Wellness indicator based on participation in at least one wellness action per cycle.
* System shall support lightweight **micro-rewards**, such as:

  * Positive messages and in-app recognition.
  * Badges (e.g. “Recovery Planner”, “Reflection Champion”).
* HR may optionally map these to real-world perks in future phases; this mapping is not required for MVP.

---

### 2.6 AI Layer

> AI is delivered as **co-pilots and smart services**, always human-in-the-loop and scoped to tenant and role contexts.

#### 2.6.1 Employee People & Wellness Copilot

**PW-AI-01 – Employee copilot**

* System shall provide an embedded **conversational assistant** in Employee Self-Service that can:

  * Answer HR process questions (e.g. “How much annual leave do I have?”, “What is our maternity policy?”).
  * Answer wellness-related process questions (e.g. “How do I request a mental health day?”, “What wellness programs are available?”).
  * Draft simple actions on the employee’s behalf (e.g. leave requests, HR queries) for review before submission.
* The copilot shall use:

  * Tenant-specific policies (via retrieval from policy documents or configurations).
  * The employee’s own data (e.g. leave balances, role, manager).
  * ZHEP program catalog data (read-only).

#### 2.6.2 Manager Insight Copilot

**PW-AI-02 – Manager insight copilot**

* System shall provide a **Manager copilot** accessible via Manager Self-Service that can respond to queries such as:

  * Summaries of team leave and Recovery Index patterns over a selected period.
  * Identification of team members who may benefit from a check-in based on combined signals (e.g. stress indicators, leave usage, check-ins).
  * High-level themes from recent appraisals for the manager’s team.
* Copilot responses shall:

  * Be in clear natural language.
  * Include indication of the underlying data and assumptions used.
  * Suggest possible actions (e.g. schedule a check-in, encourage a break, signpost a wellness program) without autonomously taking action.

#### 2.6.3 Performance Review Summarizer & Coaching Hints

**PW-AI-03 – Appraisal summarizer**

* For each in-progress or finalized appraisal, system shall offer an AI-generated **draft overall summary**, based on:

  * KPI and OKR content.
  * Narrative answers from employee and manager.
  * History from previous cycles for that employee.
* Managers shall be able to:

  * View the draft summary.
  * Edit or rewrite the summary.
  * Choose not to use it.
* System shall prevent AI-generated text from being published without human review.

**PW-AI-04 – Coaching suggestions**

* When managers are writing or editing feedback, system shall provide **coaching suggestions** such as:

  * Alternative phrasing for constructive, clear feedback.
  * Suggested development actions aligned with performance content.
* Coaching suggestions shall follow a wellbeing-centric tone, avoiding punitive or harmful phrasing patterns.

#### 2.6.4 Smart Routing & Classification for HR Requests

**PW-AI-05 – HR request classification**

* System shall include a basic **HR Requests** feature where employees and managers can submit general HR queries (e.g. policy questions, data corrections, HR admin tasks).
* AI services shall:

  * Classify each request into a type (e.g. leave, contract, payroll, wellness, general policy).
  * Suggest an appropriate assignee or HR queue.
  * Optionally draft a suggested first response for HR to review (e.g. quoting relevant policy text).

#### 2.6.5 AI Governance & Controls

**PW-AI-06 – Transparency & control**

* All AI-generated outputs shall:

  * Be clearly labelled as suggestions or drafts.
  * Offer options such as Accept, Edit or Reject.
  * Include a simple mechanism for users to flag outputs as incorrect or unhelpful to improve configurations and guardrails.

**PW-AI-07 – Tenant & role scoping**

* AI context shall always be scoped by:

  * Tenant boundaries (no cross-tenant data access or use).
  * User role and permissions (e.g. managers see their own teams only; HR can see broader organizational data; employees see only their own data).
* AI services shall **not** mix data across tenants in prompts, training or responses.

---

### 2.7 ESS & MSS

#### 2.7.1 Employee Self-Service (ESS)

**PW-ESS-01 – ESS scope**

* Employee Self-Service shall allow employees to:

  * View and update selected personal details, subject to HR-configured rules on which fields are editable.
  * View employment and position details (e.g. job title, manager, Org Unit).
  * Submit, view and track leave requests and leave balances.
  * Complete performance self-reviews and view historical appraisals.
  * View their Recovery Index, gamification points, level and visual indicators.
  * Access the Employee Copilot for questions and drafting simple HR actions.

#### 2.7.2 Manager Self-Service (MSS)

**PW-MSS-01 – MSS scope**

* Manager Self-Service shall allow managers to:

  * Approve or decline leave requests and view team leave calendars.
  * View team structure and org chart, including basic wellbeing overlays such as Recovery Index distributions for their direct reports.
  * Initiate and complete performance reviews for their team members.
  * View team-level gamification summaries (challenge progress, team-level indicators).
  * Access the Manager Insight Copilot for team summaries and suggested next actions.

---

### 2.8 Integrations & Non-functional

#### 2.8.1 ZHEP Integration

**PW-INT-01 – ZHEP events & signals**

* PeopleWell shall emit events to ZHEP for wellness-relevant moments, including:

  * Appraisal completion (including wellness commitments from the action block).
  * Leave approvals (including indicators for wellness leave).
  * Selected wellness-related check-in signals (appropriately anonymized or aggregated).
* PeopleWell shall consume from ZHEP:

  * High-level engagement tags and participation summaries for employees (no detailed health or clinical data).

#### 2.8.2 Other Integration Hooks

**PW-INT-02 – Generic integration hooks**

* System shall provide REST APIs for key entities and processes, including:

  * People, Employees.
  * Org Units, Job Roles, Positions, Position Assignments.
  * Leave types, leave balances and leave requests.
  * Performance cycles, appraisals and check-ins.
  * Gamification states (points, levels, challenge participation, scorecards).
* MVP shall not include deep payroll integration but shall not block future payroll integrations.

#### 2.8.3 Multi-Tenancy

**PW-NFR-01 – Multi-tenancy**

* System shall provide strong tenant isolation, including:

  * Logical or physical partitioning of data per tenant.
  * Enforcement of tenant context for all requests and background processes.
  * No cross-tenant queries, reports or AI contexts.

#### 2.8.4 Security & RBAC

**PW-NFR-02 – Security & RBAC**

* System shall offer role-based access control (RBAC), including at minimum:

  * Employee, Manager, HR, Admin and Executive roles (with ability for tenant-level customization).
* System shall:

  * Scope manager access to their own direct and indirect reports and relevant Org Units.
  * Provide an audit trail for sensitive actions (e.g. contract changes, overrides, manual leave balance adjustments, appraisal overrides).
  * Follow security best practices for authentication and authorization, including compatibility with external identity providers in future phases.

#### 2.8.5 API-First & Workflows

**PW-NFR-03 – API-first**

* All major operations shall be accessible via REST APIs, including CRUD operations for core entities and actions such as:

  * Submitting and approving leave.
  * Managing performance cycles and appraisals.
  * Managing Org Units, Positions and Assignments.
* System shall provide event or webhook mechanisms for key events (e.g. leave approved, appraisal completed, employee status changed).

**PW-NFR-04 – Configurability & workflows**

* System shall support configuration of:

  * Leave types and policies.
  * Performance templates and questions.
  * Basic approval workflows (e.g. single or double approval paths).
* Workflow configuration shall be form-based and simple for MVP; a full BPMN-style engine is explicitly out of scope.

#### 2.8.6 Onboarding, Imports & Reporting

**PW-NFR-05 – Onboarding & imports**

* System shall provide **Excel/CSV import templates** for:

  * Employees.
  * Org Units.
  * Positions and Position Assignments.
  * Initial leave balances.
  * Performance templates (sections and questions).
* Import processes shall:

  * Validate input data.
  * Provide clear error messages and row-level feedback.
  * Allow corrected re-upload.

**PW-NFR-06 – Reporting & exports**

* System shall provide curated reports for key stakeholders, including:

  * Employee lists and headcount by Org Unit.
  * Leave usage and balance summaries by type and Org Unit.
  * Recovery Index summary by Org Unit and manager.
  * Performance results by cycle and Org Unit.
  * Gamification summary (points, levels, challenge participation, manager scorecards).
* All reports shall be exportable to CSV/Excel.

---

## 3. Explicitly Out of Scope for MVP

The following are **not** included in the MVP and should be explicitly considered out of scope:

* Full **payroll engine** and pay-slip generation.
* Complex **benefits administration** (beyond simple dependent and eligibility tagging).
* Detailed recruitment / Applicant Tracking System (ATS) features.
* Complex working patterns (e.g. rotating shifts, multi-calendar per employee) beyond basic working pattern and holiday configuration.
* Advanced DEI/fairness analytics and related dashboards.
* Public or competitive health, engagement or gamification leaderboards.
* Any AI feature that:

  * Automatically makes disciplinary, termination or promotion decisions.
  * Uses invasive monitoring (e.g. keystroke logging, private communication monitoring).
