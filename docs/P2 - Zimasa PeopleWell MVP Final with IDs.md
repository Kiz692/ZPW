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

**Person entity**

* **PW-CORE-01** – System shall maintain a Person record that can be used across Zimasa platforms, including:

  * Names.
  * Gender (from a configurable list).
  * Date of birth.
  * Nationality.
  * Multiple contact details (emails, phone numbers, addresses) with “primary” flags.
  * Identification details (e.g. national ID, passport, tax ID), configurable per country.

**Employee entity**

* **PW-CORE-02** – System shall maintain an Employee record per tenant that links to a Person record and includes:

  * Employee number/code.
  * Hire date.
  * Employment type (e.g. permanent, fixed-term, casual, intern, consultant).
  * Employment status (e.g. planned, active, probation, suspended, exited) with effective dates.
* **PW-CORE-03** – System shall allow a Person to be an Employee in multiple tenants.
* **PW-CORE-04** – System shall not allow cross-tenant joins or cross-tenant visibility of Employee data.

#### 2.1.2 Employment & Contracts

**Employment contracts**

* **PW-CORE-05** – System shall maintain employment contract records per Employee, including:

  * Contract type.
  * Start date and optional end date.
  * Probation end date.
  * Basic working pattern attributes (e.g. standard hours, days).
  * Link to a primary Position Assignment in the Work Lattice.
* **PW-CORE-06** – System shall maintain contract status (e.g. draft, active, ended) and retain contract history.

**Employment status history**

* **PW-CORE-07** – System shall track changes in employment status (e.g. active, probation, suspended, exited) with effective dates and reasons.
* **PW-CORE-08** – System shall support reporting on joiners, leavers and status changes by period.

#### 2.1.3 Family, Qualifications, Experience

**Dependents (wellness-linked)**

* **PW-CORE-09** – System shall allow capture of dependents per Employee, including relationship, date of birth and an indicator of inclusion in health cover or wellness program eligibility.
* **PW-CORE-10** – For MVP, dependents shall be used primarily for wellness program eligibility, and full benefits administration shall be considered out of scope.

**Qualifications & experience**

* **PW-CORE-11** – System shall store education and professional qualification details, including institution, qualification name, level and completion year.
* **PW-CORE-12** – System shall store prior employment summaries, including employer, role and start/end dates, for context.
* **PW-CORE-13** – System shall keep the structure for qualifications and experience simple, without deep curriculum or subject hierarchies in the MVP.

#### 2.1.4 Wellness Engagement Profile

**Wellness engagement profile per employee**

* **PW-CORE-14** – System shall maintain a wellness engagement profile for each Employee, including:

  * Consent flag for health and wellness engagement programs.
  * Preferred communication channel (e.g. email, SMS, WhatsApp, app), within available options.
  * High-level, non-clinical engagement tags received from ZHEP, stored as opaque labels.
* **PW-CORE-15** – System shall use the wellness engagement profile to tailor nudges and AI suggestions.
* **PW-CORE-16** – System shall ensure wellness engagement data is not used as a primary basis for punitive actions.

---

### 2.2 Work Lattice (Org & Jobs)

#### 2.2.1 Org Units

**Org unit hierarchy**

* **PW-ORG-01** – System shall support a multi-level Org Unit hierarchy per tenant, with Org Unit code, name, type, parent Org Unit and effective from/to dates.
* **PW-ORG-02** – System shall support multiple top-level Org Units per tenant to allow group or multi-company structures.

#### 2.2.2 Job Roles and Positions

**Job roles**

* **PW-ORG-03** – System shall maintain Job Roles that include name, description, job family, level/band and key responsibilities or summary text.
* **PW-ORG-04** – System shall allow Job Roles to be used across positions, performance templates and basic L&D planning.

**Positions**

* **PW-ORG-05** – System shall maintain Positions with position code, title, Org Unit, linked Job Role and reports-to Position.
* **PW-ORG-06** – System shall support an optional secondary reporting line for Positions while enforcing exactly one primary reporting line.

#### 2.2.3 Position Assignments

**Position assignments**

* **PW-ORG-07** – System shall allow assignment of Employees to Positions, including primary or secondary assignment flags and start/end dates.
* **PW-ORG-08** – System shall maintain a history of Position Assignments to reflect transfers, promotions, secondments and role changes.

#### 2.2.4 Job Requirements (Light)

**Job requirements**

* **PW-ORG-09** – For each Job Role, system shall store high-level job requirements including minimum qualification level, key skills as tags and desired years of experience.
* **PW-ORG-10** – System shall use stored job requirements as context in performance and development conversations and shall not use them for full recruitment/ATS matching in the MVP.

---

### 2.3 Rhythms (Leave & Absence)

#### 2.3.1 Leave Types & Policies

**Leave types**

* **PW-LEAVE-01** – System shall provide configurable Leave Types per tenant, seeded with defaults such as Annual, Sick, Maternity, Paternity, Compassionate, Unpaid and dedicated Wellness/Mental Health leave types.
* **PW-LEAVE-02** – For each Leave Type, system shall capture category, paid/unpaid status, attachment requirement, minimum and maximum duration per request and an indicator if it is wellness-related.

**Leave policy (simple)**

* **PW-LEAVE-03** – For each Leave Type, system shall support basic leave policies including accrual model (NONE/ANNUAL/MONTHLY with days per period), maximum annual entitlement, carry-forward rules and simple pro-rata rules for joiners and leavers.

#### 2.3.2 Leave Period & Balances

**Leave period**

* **PW-LEAVE-04** – System shall support a single active Leave Period per tenant, configurable as calendar year or fiscal year.
* **PW-LEAVE-05** – System shall support Leave Period rollover and apply configured carry-forward rules.

**Leave balances**

* **PW-LEAVE-06** – System shall maintain per-employee, per-leave-type, per-period balances, including opening balance, accrued days, days taken, adjustments and closing balance.
* **PW-LEAVE-07** – System shall update leave balances automatically when leave requests are approved.
* **PW-LEAVE-08** – System shall allow manual leave balance adjustments with an audit trail.

#### 2.3.3 Leave Requests & Workflow

**Leave request (ESS/MSS)**

* **PW-LEAVE-09** – System shall allow employees to submit leave requests that include leave type, start date, end date, partial days where applicable, reason and any required attachments.
* **PW-LEAVE-10** – System shall display the available balance for the selected leave type during request entry and warn when the request exceeds available balance or configured limits.
* **PW-LEAVE-11** – System shall validate leave requests against available balance, overlapping leave and leave period dates.

**Approval workflow**

* **PW-LEAVE-12** – System shall provide a default leave approval workflow of Direct Manager followed by optional HR review leading to Approved or Rejected status.
* **PW-LEAVE-13** – System shall allow per-tenant configuration of leave approval workflows, including one- or two-level approvals and special routing for specified leave types.

#### 2.3.4 Rosters & Team Calendar

**Team leave calendar**

* **PW-LEAVE-14** – System shall provide a calendar view for managers showing approved and pending leave for their teams in weekly and monthly views.
* **PW-LEAVE-15** – System shall allow managers to filter the team leave calendar by leave type, employee and Org Unit.

**Roster rules**

* **PW-LEAVE-16** – System shall allow definition of capacity rules per Org Unit, such as minimum staff required at work and maximum simultaneous leaves.
* **PW-LEAVE-17** – System shall evaluate relevant capacity rules when creating or approving leave requests and shall warn when a rule would be breached.
* **PW-LEAVE-18** – System shall allow overrides of breached capacity rules only for users with appropriate permissions.

#### 2.3.5 Recovery Index & Wellness Signals

**Recovery Index**

* **PW-LEAVE-19** – System shall compute a Recovery Index per Employee based on use of annual and wellness leave relative to entitlement and spacing of breaks.
* **PW-LEAVE-20** – System shall provide each employee with a view of their own Recovery Index.
* **PW-LEAVE-21** – System shall provide managers with aggregated Recovery Index views for their teams.
* **PW-LEAVE-22** – System shall provide HR with Recovery Index distributions across the organization.

**Wellness signals to ZHEP**

* **PW-LEAVE-23** – System shall expose anonymized and/or aggregated leave-based wellness signals to ZHEP, including under-use of leave, over-use of sick leave and extended periods without time off.
* **PW-LEAVE-24** – System shall ensure wellness signals shared with ZHEP can be configured to be non-identifiable at individual level according to policy.

---

### 2.4 Growth Signals (Performance & Check-ins)

#### 2.4.1 Performance Cycles & Templates

**Performance cycles**

* **PW-PERF-01** – System shall support at least two main appraisal cycles per year and allow tenants to add additional cycles.
* **PW-PERF-02** – System shall capture, for each performance cycle, a code, name, start date, end date and status.

**Performance templates & sections**

* **PW-PERF-03** – System shall allow definition of Performance Templates per Job Role or job family.
* **PW-PERF-04** – System shall support configuration of sections within a Performance Template, including sections such as Self Reflection, Job KPIs, OKR Initiatives/Projects, Add Value, Culture/Values and Learning & Development.
* **PW-PERF-05** – System shall capture section-level configuration, including whether the section is scoring, the section weight percentage and the sequence order.

#### 2.4.2 Question Bank for Narrative/Behavioural Sections

**Template questions**

* **PW-PERF-06** – System shall allow configuration of questions per template section, including question text, optional help text, response type and optional weight within the section.
* **PW-PERF-07** – System shall apply configured questions to all employees using that template in a given cycle.

**Appraisal answers**

* **PW-PERF-08** – System shall store, for each appraisal and question, self ratings and comments, manager ratings and comments and agreed/final ratings and comments, as applicable.
* **PW-PERF-09** – System shall maintain links from appraisal answers back to their originating section and template question for reporting and analysis.

#### 2.4.3 Job KPIs & OKR Initiatives

**Job KPIs**

* **PW-PERF-10** – System shall allow managers and employees to define KPI items per appraisal, including title, description, target or measure, weight and ratings/comments.
* **PW-PERF-11** – System shall compute KPI section scores as a weighted sum of KPI item scores.

**OKR initiatives/projects**

* **PW-PERF-12** – System shall allow recording of OKR initiatives or projects per appraisal, including initiative name, objective, employee role, weight and ratings/comments.
* **PW-PERF-13** – System shall compute OKR section scores as a weighted sum of initiative scores.

#### 2.4.4 Appraisal Workflow & Scoring

**Appraisal workflow**

* **PW-PERF-14** – System shall create an appraisal record for each employee and cycle, referencing the applicable template and sections.
* **PW-PERF-15** – System shall support appraisal workflow steps including self review, manager review, optional HR review and finalization.
* **PW-PERF-16** – System shall make finalized appraisals read-only and allow HR overrides only with a full audit trail of changes.

**Scoring & rating bands**

* **PW-PERF-17** – System shall compute self, manager and final scores for each scoring section using configured weights and ratings.
* **PW-PERF-18** – System shall compute an overall appraisal score as a weighted sum across scoring sections using configured section weights.
* **PW-PERF-19** – System shall map overall appraisal scores to tenant-configurable rating bands such as numeric or descriptive scales.

#### 2.4.5 Growth & Wellness Contract

**Growth & wellness action block**

* **PW-PERF-20** – System shall support capturing 3–5 key post-appraisal actions per employee, including performance goals, learning and development actions and at least one wellness-related commitment.
* **PW-PERF-21** – System shall expose wellness-related actions from appraisals to ZHEP as goals or activities via integration.

#### 2.4.6 Check-ins (Micro-Feedback & Wellness)

**Check-ins**

* **PW-PERF-22** – System shall allow managers and employees to schedule and record 1:1 check-ins outside formal appraisal cycles, including date/time, summary and simple indicators for energy, workload and stress.
* **PW-PERF-23** – System shall use recorded check-ins as input signals for the Manager Insight Copilot and internal wellness analytics.
* **PW-PERF-24** – System shall implement safeguards so that check-ins are not used directly as primary inputs for punitive decisions.

---

### 2.5 Gamification Layer

> Principle: Encourage healthy, sustainable work and recovery patterns; avoid rewarding overwork or unhealthy “hustle” behaviours.

#### 2.5.1 Points & Levels

**PeopleWell points**

* **PW-GAME-01** – System shall maintain a points system per Employee per tenant that awards points for actions such as onboarding completion, balanced leave planning, timely self-reviews and check-ins and participation in eligible wellness programs.
* **PW-GAME-02** – System shall allow tenant-level configuration of points rules within safe templates provided by PeopleWell, avoiding arbitrary or unhealthy incentive schemes in the MVP.

**Levels**

* **PW-GAME-03** – System shall define simple employee levels (e.g. Getting Started, Steady, Thriving) based on cumulative points thresholds.
* **PW-GAME-04** – System shall display an employee’s level to the employee and optionally to their manager.
* **PW-GAME-05** – System shall ensure employee levels are not displayed in competitive leaderboards in the MVP.

#### 2.5.2 Team Challenges

**Team challenges**

* **PW-GAME-06** – System shall provide simple team-based wellness-focused challenges such as planned breaks and wellbeing-oriented check-ins.
* **PW-GAME-07** – System shall track team challenge participation and completion on a per-team basis rather than individual rankings.
* **PW-GAME-08** – System shall allow managers and HR to view challenge completion percentages and high-level summaries of behavioural change at team level.

#### 2.5.3 Manager Scorecards

**Manager health scorecard**

* **PW-GAME-09** – System shall compute a non-punitive health stewardship scorecard for each manager using metrics such as proportion of direct reports with planned breaks, check-in cadence and Recovery Index distribution.
* **PW-GAME-10** – System shall restrict visibility of manager health stewardship scorecards to the manager and HR and prevent public comparisons or rankings.

#### 2.5.4 Visual Feedback & Micro-Rewards

**Visual progress & micro-rewards**

* **PW-GAME-11** – System shall provide visual indicators for employees representing Recovery, Reflection and Wellness status based on underlying data.
* **PW-GAME-12** – System shall support lightweight micro-rewards such as positive messages and recognition badges tied to healthy behaviours.

---

### 2.6 AI Layer

> AI is delivered as co-pilots and smart services, always human-in-the-loop and scoped to tenant and role contexts.

#### 2.6.1 Employee People & Wellness Copilot

**Employee copilot**

* **PW-AI-01** – System shall provide an embedded conversational assistant in Employee Self-Service that can answer HR process questions, answer wellness-related process questions and draft simple HR actions for employees to review and submit.
* **PW-AI-02** – System shall ensure the Employee Copilot uses tenant-specific policies, the employee’s own data and read-only ZHEP program catalog data as its primary context sources.

#### 2.6.2 Manager Insight Copilot

**Manager insight copilot**

* **PW-AI-03** – System shall provide a Manager Insight Copilot accessible via Manager Self-Service that can respond to queries about team leave and recovery patterns, employees who may benefit from a check-in and themes from recent appraisals.
* **PW-AI-04** – System shall ensure Manager Insight Copilot responses are in clear natural language, indicate the underlying data used and suggest possible actions without autonomously taking action.

#### 2.6.3 Performance Review Summarizer & Coaching Hints

**Appraisal summarizer**

* **PW-AI-05** – System shall offer an AI-generated draft overall summary for each in-progress or finalized appraisal based on KPI/OKR content, narrative answers and relevant history.
* **PW-AI-06** – System shall allow managers to view, edit or discard AI-generated appraisal summaries.
* **PW-AI-07** – System shall prevent AI-generated appraisal text from being published or shared with employees without human review.

**Coaching suggestions**

* **PW-AI-08** – System shall provide coaching suggestions while managers are entering or editing feedback, proposing constructive phrasing and potential development actions aligned with the performance content.
* **PW-AI-09** – System shall ensure coaching suggestions follow a wellbeing-centric tone and avoid punitive or harmful phrasing patterns.

#### 2.6.4 Smart Routing & Classification for HR Requests

**HR request classification**

* **PW-AI-10** – System shall include a basic HR Requests feature where employees and managers can submit general HR queries.
* **PW-AI-11** – System shall use AI services to classify each HR request into a type and suggest an appropriate assignee or HR queue.
* **PW-AI-12** – System shall use AI services to optionally draft a suggested first response for HR requests for HR to review and send.

#### 2.6.5 AI Governance & Controls

**Transparency & control**

* **PW-AI-13** – System shall ensure all AI-generated outputs are clearly labelled as suggestions or drafts, provide Accept/Edit/Reject options and allow users to flag outputs as incorrect or unhelpful.

**Tenant & role scoping**

* **PW-AI-14** – System shall scope AI context strictly by tenant boundary and user role and permissions so that users only access data they are authorized to see.
* **PW-AI-15** – System shall ensure AI services do not mix data across tenants in prompts, training or responses.

---

### 2.7 ESS & MSS

#### 2.7.1 Employee Self-Service (ESS)

**ESS scope**

* **PW-ESS-01** – Employee Self-Service shall allow employees to:

  * View and update selected personal details according to HR-configured editability rules.
  * View their employment and position details, including job title, manager and Org Unit.
  * Submit, view and track leave requests and view leave balances.
  * Complete performance self-reviews and view historical appraisals.
  * View their Recovery Index, points, level and visual wellbeing indicators.
  * Access the Employee Copilot for questions and drafting simple HR actions.

#### 2.7.2 Manager Self-Service (MSS)

**MSS scope**

* **PW-MSS-01** – Manager Self-Service shall allow managers to:

  * Approve or decline leave requests and view team leave calendars.
  * View team structure and org charts, including basic wellbeing overlays such as Recovery Index distributions for their direct reports.
  * Initiate and complete performance reviews for their team members.
  * View team-level gamification summaries, including challenge progress and team-level indicators.
  * Access the Manager Insight Copilot for team summaries and suggested next actions.

---

### 2.8 Integrations & Non-functional

#### 2.8.1 ZHEP Integration

**ZHEP events & signals**

* **PW-INT-01** – PeopleWell shall emit events to ZHEP for wellness-relevant moments, including appraisal completion (with wellness commitments), leave approvals (with wellness leave indicators) and selected wellness-related check-in signals.
* **PW-INT-02** – PeopleWell shall consume from ZHEP high-level engagement tags and participation summaries for employees, without detailed health or clinical data.

#### 2.8.2 Other Integration Hooks

**Generic integration hooks**

* **PW-INT-03** – System shall provide REST APIs for key entities and processes, including People, Employees, Org Units, Job Roles, Positions, Position Assignments, Leave types, leave balances, leave requests, performance cycles, appraisals, check-ins and gamification states.
* **PW-INT-04** – System shall exclude deep payroll integration from the MVP but shall not block future payroll integrations.

#### 2.8.3 Multi-Tenancy

**Multi-tenancy**

* **PW-NFR-01** – System shall provide strong tenant isolation, including logical or physical partitioning of data per tenant, enforcement of tenant context for all requests and prevention of cross-tenant queries, reports or AI contexts.

#### 2.8.4 Security & RBAC

**Security & RBAC**

* **PW-NFR-02** – System shall offer role-based access control (RBAC), including at minimum Employee, Manager, HR, Admin and Executive roles, with tenant-level customization.
* **PW-NFR-03** – System shall scope manager access to their own direct and indirect reports and relevant Org Units.
* **PW-NFR-04** – System shall provide an audit trail for sensitive actions, including contract changes, overrides, manual leave balance adjustments and appraisal overrides.
* **PW-NFR-05** – System shall follow security best practices for authentication and authorization and support compatibility with external identity providers in future phases.

#### 2.8.5 API-First & Workflows

**API-first**

* **PW-NFR-06** – System shall expose all major operations via REST APIs, including CRUD operations for core entities and actions such as submitting and approving leave and managing performance cycles and appraisals.
* **PW-NFR-07** – System shall provide event or webhook mechanisms for key events, including leave approvals, appraisal completion and employee status changes.

**Configurability & workflows**

* **PW-NFR-08** – System shall support configuration of leave types and policies, performance templates and questions and basic approval workflows.
* **PW-NFR-09** – System shall provide simple, form-based workflow configuration for the MVP and shall not include a full BPMN-style workflow engine.

#### 2.8.6 Onboarding, Imports & Reporting

**Onboarding & imports**

* **PW-NFR-10** – System shall provide Excel/CSV import templates for employees, Org Units, Positions, Position Assignments, initial leave balances and performance templates (sections and questions).
* **PW-NFR-11** – Import processes shall validate input data, provide clear error messages and row-level feedback and allow corrected re-uploads.

**Reporting & exports**

* **PW-NFR-12** – System shall provide curated reports for key stakeholders, including employee lists and headcount by Org Unit, leave usage and balance summaries by type and Org Unit, Recovery Index summaries by Org Unit and manager, performance results by cycle and Org Unit and gamification summaries.
* **PW-NFR-13** – System shall allow all reports to be exported to CSV/Excel.

---

## 3. Explicitly Out of Scope for MVP

The following are not included in the MVP and are explicitly out of scope:

* Full payroll engine and pay-slip generation.
* Complex benefits administration beyond simple dependent and eligibility tagging.
* Detailed recruitment / Applicant Tracking System (ATS) features.
* Complex working patterns such as rotating shifts and multiple calendars per employee beyond basic working pattern and holiday configuration.
* Advanced DEI/fairness analytics and related dashboards.
* Public or competitive health, engagement or gamification leaderboards.
* Any AI feature that:

  * Automatically makes disciplinary, termination or promotion decisions.
  * Uses invasive monitoring (e.g. keystroke logging, private communication monitoring).
