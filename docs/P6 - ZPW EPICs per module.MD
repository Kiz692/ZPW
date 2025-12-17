 **People Core**  module 

---

## Module: People Core

### EPIC 1 – Unified Person & Employee Identity

*Outcome:* We have a clean, multi-tenant-safe model for people and employees that can be shared across Zimasa products without data leakage.

* Covers:

  * **PW-CORE-01** – System shall maintain a Person record that can be used across Zimasa platforms, including core demographic, contact and ID details.
  * **PW-CORE-02** – System shall maintain an Employee record per tenant that links to a Person record and includes employee number, hire date, employment type and employment status.
  * **PW-CORE-03** – System shall allow a Person to be an Employee in multiple tenants.
  * **PW-CORE-04** – System shall not allow cross-tenant joins or cross-tenant visibility of Employee data.

---

### EPIC 2 – Manage Employment Lifecycle

*Outcome:* HR can manage contracts and employment status changes over time, and report on joiners, leavers and movements.

* Covers:

  * **PW-CORE-05** – System shall maintain employment contract records per Employee, including contract type, dates, probation and primary Position Assignment.
  * **PW-CORE-06** – System shall maintain contract status (e.g. draft, active, ended) and retain contract history.
  * **PW-CORE-07** – System shall track changes in employment status with effective dates and reasons.
  * **PW-CORE-08** – System shall support reporting on joiners, leavers and status changes by period.

---

### EPIC 3 – Enrich Employee Context (Dependents, Qualifications & Experience)

*Outcome:* Managers and HR can view key context about dependents, education and prior experience to support decisions and performance conversations.

* Covers:

  * **PW-CORE-09** – System shall allow capture of dependents per Employee, including relationship, date of birth and inclusion in health cover/wellness eligibility.
  * **PW-CORE-10** – For MVP, dependents shall be used primarily for wellness program eligibility, and full benefits administration is out of scope.
  * **PW-CORE-11** – System shall store education and professional qualification details, including institution, qualification name, level and completion year.
  * **PW-CORE-12** – System shall store prior employment summaries, including employer, role and start/end dates.
  * **PW-CORE-13** – System shall keep the structure for qualifications and experience simple, without deep curriculum or subject hierarchies in the MVP.

---

### EPIC 4 – Wellness Engagement Profile

*Outcome:* Each employee has a wellness engagement profile that can drive personalised, non-punitive wellness nudges and AI insights.

* Covers:

  * **PW-CORE-14** – System shall maintain a wellness engagement profile for each Employee, including consent flag, preferred channel and engagement tags from ZHEP.
  * **PW-CORE-15** – System shall use the wellness engagement profile to tailor nudges and AI suggestions.
  * **PW-CORE-16** – System shall ensure wellness engagement data is not used as a primary basis for punitive actions.

---

## Module: Work Lattice (Org & Jobs)

### EPIC 1 – Design Org Structure & Hierarchy

*Outcome:* HR can model the company structure with departments, teams and cost centres in a flexible hierarchy across multiple legal entities or companies.

* Covers:

  * **PW-ORG-01** – System shall support a multi-level Org Unit hierarchy per tenant, with Org Unit code, name, type, parent Org Unit and effective from/to dates.
  * **PW-ORG-02** – System shall support multiple top-level Org Units per tenant to allow group or multi-company structures.

---

### EPIC 2 – Define Job Roles & Requirements

*Outcome:* The organisation can standardise role definitions and attach simple requirements that drive performance templates and development planning.

* Covers:

  * **PW-ORG-03** – System shall maintain Job Roles that include name, description, job family, level/band and key responsibilities or summary text.
  * **PW-ORG-04** – System shall allow Job Roles to be used across positions, performance templates and basic L&D planning.
  * **PW-ORG-09** – For each Job Role, system shall store high-level job requirements including minimum qualification level, key skills as tags and desired years of experience.
  * **PW-ORG-10** – System shall use stored job requirements as context in performance and development conversations and shall not use them for full recruitment/ATS matching in the MVP.

---

### EPIC 3 – Manage Positions & Reporting Lines

*Outcome:* HR can model concrete positions and reporting lines, including simple matrix reporting where needed.

* Covers:

  * **PW-ORG-05** – System shall maintain Positions with position code, title, Org Unit, linked Job Role and reports-to Position.
  * **PW-ORG-06** – System shall support an optional secondary reporting line for Positions while enforcing exactly one primary reporting line.

---

### EPIC 4 – Manage Position Assignments & Movements

*Outcome:* The organisation can track who sits in which role over time, with clear history of transfers, promotions and secondments.

* Covers:

  * **PW-ORG-07** – System shall allow assignment of Employees to Positions, including primary or secondary assignment flags and start/end dates.
  * **PW-ORG-08** – System shall maintain a history of Position Assignments to reflect transfers, promotions, secondments and role changes.

---

## Module: Rhythms (Leave & Absence)

### EPIC 1 – Configurable Leave Types & Policies

*Outcome:* HR can configure leave types and simple policies that reflect the organisation’s rules, including wellness and mental health leave.

* Covers:

  * **PW-LEAVE-01**
  * **PW-LEAVE-02**
  * **PW-LEAVE-03**

---

### EPIC 2 – Leave Periods & Balance Accounting

*Outcome:* Leave balances are correctly tracked per period and type, with clean rollover and adjustment mechanisms.

* Covers:

  * **PW-LEAVE-04**
  * **PW-LEAVE-05**
  * **PW-LEAVE-06**
  * **PW-LEAVE-07**
  * **PW-LEAVE-08**

---

### EPIC 3 – Employees Manage Their Own Leave

*Outcome:* Employees can easily request leave, see their balances and avoid basic errors like overlapping or over-drawn leave.

* Covers:

  * **PW-LEAVE-09**
  * **PW-LEAVE-10**
  * **PW-LEAVE-11**

---

### EPIC 4 – Flexible Leave Approval Workflows

*Outcome:* Managers and HR can approve leave using simple, configurable workflows that handle special cases like wellness leave.

* Covers:

  * **PW-LEAVE-12**
  * **PW-LEAVE-13**

---

### EPIC 5 – Team Calendars & Capacity Protection

*Outcome:* Managers can see who is off when and protect minimum staffing levels with simple roster rules.

* Covers:

  * **PW-LEAVE-14**
  * **PW-LEAVE-15**
  * **PW-LEAVE-16**
  * **PW-LEAVE-17**
  * **PW-LEAVE-18**

---

### EPIC 6 – Recovery Index for Rest & Recharge

*Outcome:* Employees, managers and HR can see a Recovery Index that highlights whether people are taking healthy breaks.

* Covers:

  * **PW-LEAVE-19**
  * **PW-LEAVE-20**
  * **PW-LEAVE-21**
  * **PW-LEAVE-22**

---

### EPIC 7 – Leave-Based Wellness Signals to ZHEP

*Outcome:* ZHEP receives anonymised leave patterns (under-use, over-use, no-break) to drive broader wellness interventions.

* Covers:

  * **PW-LEAVE-23**
  * **PW-LEAVE-24**

---

## Module: Growth Signals (Performance & Check-ins)

### EPIC 1 – Configure Performance Cycles & Templates

*Outcome:* HR can set up performance cycles and templates that reflect how the organisation actually appraises people.

* Covers:

  * **PW-PERF-01** – System shall support at least two main appraisal cycles per year and allow tenants to add additional cycles.
  * **PW-PERF-02** – System shall capture, for each performance cycle, a code, name, start date, end date and status.
  * **PW-PERF-03** – System shall allow definition of Performance Templates per Job Role or job family.
  * **PW-PERF-04** – System shall support configuration of sections within a Performance Template, including sections such as Self Reflection, Job KPIs, OKR Initiatives/Projects, Add Value, Culture/Values and Learning & Development.
  * **PW-PERF-05** – System shall capture section-level configuration, including whether the section is scoring, the section weight percentage and the sequence order.
  * **PW-PERF-19** – System shall map overall appraisal scores to tenant-configurable rating bands such as numeric or descriptive scales.

---

### EPIC 2 – Capture Rich Performance Feedback & Goals

*Outcome:* Employees and managers can capture structured and narrative feedback, KPIs and OKRs within a single, coherent appraisal.

* Covers:

  * **PW-PERF-06** – System shall allow configuration of questions per template section, including question text, help text, response type and optional weight within the section.
  * **PW-PERF-07** – System shall apply configured questions to all employees using that template in a given cycle.
  * **PW-PERF-08** – System shall store, for each appraisal and question, self ratings and comments, manager ratings and comments and agreed/final ratings and comments, as applicable.
  * **PW-PERF-09** – System shall maintain links from appraisal answers back to their originating section and template question for reporting and analysis.
  * **PW-PERF-10** – System shall allow managers and employees to define KPI items per appraisal, including title, description, target/measure, weight and ratings/comments.
  * **PW-PERF-11** – System shall compute KPI section scores as a weighted sum of KPI item scores.
  * **PW-PERF-12** – System shall allow recording of OKR initiatives or projects per appraisal, including initiative name, objective, role, weight and ratings/comments.
  * **PW-PERF-13** – System shall compute OKR section scores as a weighted sum of initiative scores.

---

### EPIC 3 – Run Appraisal Workflow & Scoring

*Outcome:* The organisation can run structured appraisal cycles with clear workflow, finalisation and fair scoring.

* Covers:

  * **PW-PERF-14** – System shall create an appraisal record for each employee and cycle, referencing the applicable template and sections.
  * **PW-PERF-15** – System shall support appraisal workflow steps including self review, manager review, optional HR review and finalization.
  * **PW-PERF-16** – System shall make finalized appraisals read-only and allow HR overrides only with a full audit trail of changes.
  * **PW-PERF-17** – System shall compute self, manager and final scores for each scoring section using configured weights and ratings.
  * **PW-PERF-18** – System shall compute an overall appraisal score as a weighted sum across scoring sections using configured section weights.

---

### EPIC 4 – Growth & Wellness Commitments

*Outcome:* Each appraisal ends with concrete, trackable growth and wellness commitments that can feed into ZHEP.

* Covers:

  * **PW-PERF-20** – System shall support capturing 3–5 key post-appraisal actions per employee, including performance goals, learning and development actions and at least one wellness-related commitment.
  * **PW-PERF-21** – System shall expose wellness-related actions from appraisals to ZHEP as goals or activities via integration.

---

### EPIC 5 – Continuous Check-ins & Wellbeing Signals

*Outcome:* Managers and employees can run regular check-ins that capture energy/stress signals and feed into insights without becoming punitive.

* Covers:

  * **PW-PERF-22** – System shall allow managers and employees to schedule and record 1:1 check-ins outside formal appraisal cycles, including date/time, summary and simple indicators for energy, workload and stress.
  * **PW-PERF-23** – System shall use recorded check-ins as input signals for the Manager Insight Copilot and internal wellness analytics.
  * **PW-PERF-24** – System shall implement safeguards so that check-ins are not used directly as primary inputs for punitive decisions.

---
## Module: Gamification

### EPIC 1 – Points & Levels for Healthy Habits

*Outcome:* Employees earn and see points and levels for healthy, sustainable behaviours without creating unhealthy competition.

* Covers:

  * **PW-GAME-01** – System shall maintain a points system per Employee per tenant that awards points for actions such as onboarding completion, balanced leave planning, timely self-reviews and check-ins and participation in eligible wellness programs.
  * **PW-GAME-02** – System shall allow tenant-level configuration of points rules within safe templates provided by PeopleWell, avoiding arbitrary or unhealthy incentive schemes in the MVP.
  * **PW-GAME-03** – System shall define simple employee levels (e.g. Getting Started, Steady, Thriving) based on cumulative points thresholds.
  * **PW-GAME-04** – System shall display an employee’s level to the employee and optionally to their manager.
  * **PW-GAME-05** – System shall ensure employee levels are not displayed in competitive leaderboards in the MVP.

---

### EPIC 2 – Team Wellness Challenges

*Outcome:* Teams can join simple wellness-focused challenges that encourage balanced leave and check-ins without ranking individuals.

* Covers:

  * **PW-GAME-06** – System shall provide simple team-based wellness-focused challenges such as planned breaks and wellbeing-oriented check-ins.
  * **PW-GAME-07** – System shall track team challenge participation and completion on a per-team basis rather than individual rankings.
  * **PW-GAME-08** – System shall allow managers and HR to view challenge completion percentages and high-level summaries of behavioural change at team level.

---

### EPIC 3 – Manager Health Stewardship Scorecards

*Outcome:* Managers get a private, non-punitive view of how well they support rest and wellbeing in their teams.

* Covers:

  * **PW-GAME-09** – System shall compute a non-punitive health stewardship scorecard for each manager using metrics such as proportion of direct reports with planned breaks, check-in cadence and Recovery Index distribution.
  * **PW-GAME-10** – System shall restrict visibility of manager health stewardship scorecards to the manager and HR and prevent public comparisons or rankings.

---

### EPIC 4 – Wellness Visuals & Micro-Rewards

*Outcome:* Employees see simple, positive visual feedback and badges that reinforce good recovery and reflection habits.

* Covers:

  * **PW-GAME-11** – System shall provide visual indicators for employees representing Recovery, Reflection and Wellness status based on underlying data.
  * **PW-GAME-12** – System shall support lightweight micro-rewards such as positive messages and recognition badges tied to healthy behaviours.

--
## Module: AI Layer

### EPIC 1 – Employee Copilot for HR & Wellness Questions

*Outcome:* Employees can get instant, conversational answers about HR policies, leave and wellness options, and have simple actions drafted for them.

* Covers:

  * **PW-AI-01** – System shall provide an embedded conversational assistant in Employee Self-Service that can answer HR process questions, answer wellness-related process questions and draft simple HR actions for employees to review and submit.
  * **PW-AI-02** – System shall ensure the Employee Copilot uses tenant-specific policies, the employee’s own data and read-only ZHEP program catalog data as its primary context sources.

---

### EPIC 2 – Manager Insight Copilot

*Outcome:* Managers can ask natural-language questions and get summarised insights and nudges about team wellbeing and performance patterns.

* Covers:

  * **PW-AI-03** – System shall provide a Manager Insight Copilot accessible via Manager Self-Service that can respond to queries about team leave and recovery patterns, employees who may benefit from a check-in and themes from recent appraisals.
  * **PW-AI-04** – System shall ensure Manager Insight Copilot responses are in clear natural language, indicate the underlying data used and suggest possible actions without autonomously taking action.

---

### EPIC 3 – Performance Summaries & Coaching Assistance

*Outcome:* Managers get AI help to summarise appraisals and phrase feedback constructively, while keeping humans firmly in control.

* Covers:

  * **PW-AI-05** – System shall offer an AI-generated draft overall summary for each in-progress or finalized appraisal based on KPI/OKR content, narrative answers and relevant history.
  * **PW-AI-06** – System shall allow managers to view, edit or discard AI-generated appraisal summaries.
  * **PW-AI-07** – System shall prevent AI-generated appraisal text from being published or shared with employees without human review.
  * **PW-AI-08** – System shall provide coaching suggestions while managers are entering or editing feedback, proposing constructive phrasing and potential development actions aligned with the performance content.
  * **PW-AI-09** – System shall ensure coaching suggestions follow a wellbeing-centric tone and avoid punitive or harmful phrasing patterns.

---

### EPIC 4 – Smart HR Request Triage

*Outcome:* Generic HR queries are automatically categorised and routed, with helpful draft responses, reducing manual triage overhead.

* Covers:

  * **PW-AI-10** – System shall include a basic HR Requests feature where employees and managers can submit general HR queries.
  * **PW-AI-11** – System shall use AI services to classify each HR request into a type and suggest an appropriate assignee or HR queue.
  * **PW-AI-12** – System shall use AI services to optionally draft a suggested first response for HR requests for HR to review and send.

---

### EPIC 5 – Safe & Transparent AI Governance

*Outcome:* All AI features are clearly labelled, controllable and tenant-safe, with strict boundaries around data access and usage.

* Covers:

  * **PW-AI-13** – System shall ensure all AI-generated outputs are clearly labelled as suggestions or drafts, provide Accept/Edit/Reject options and allow users to flag outputs as incorrect or unhelpful.
  * **PW-AI-14** – System shall scope AI context strictly by tenant boundary and user role and permissions so that users only access data they are authorized to see.
  * **PW-AI-15** – System shall ensure AI services do not mix data across tenants in prompts, training or responses.

---

Nice, let’s wrap the last two modules.

---

## Module: ESS & MSS (Self-Service Experience)

### EPIC 1 – Employee Self-Service Hub

*Outcome:* Employees can self-serve for the most common HR tasks without going through HR, reducing friction and admin work.

* Covers:

  * **PW-ESS-01** – Employee Self-Service shall allow employees to:

    * View/update selected personal details (HR-configured).
    * View employment and position details.
    * Submit, view and track leave requests and balances.
    * Complete performance self-reviews and view historical appraisals.
    * View Recovery Index, points, level and wellbeing indicators.
    * Access the Employee Copilot.

*(All of the above are encapsulated in PW-ESS-01; this EPIC is essentially “full ESS”.)*

---

### EPIC 2 – Manager Self-Service Console

*Outcome:* Managers can handle day-to-day people management (leave, performance, wellbeing) from a single place, instead of relying on HR.

* Covers:

  * **PW-MSS-01** – Manager Self-Service shall allow managers to:

    * Approve/decline leave and view team calendars.
    * View team structure and org charts with wellbeing overlays.
    * Initiate and complete performance reviews.
    * View team-level gamification summaries and indicators.
    * Access the Manager Insight Copilot.

---

### EPIC 3 – Role-Aware Navigation & Permissions in Self-Service

*Outcome:* The same frontend can safely adapt to different roles (Employee, Manager, HR, Exec) and show only what each user should see.

* Covers:

  * **PW-ESS-01** – Employee-specific self-service actions and views.
  * **PW-MSS-01** – Manager-specific self-service actions and views.
  * **PW-NFR-02** – Role-based access control (Employee, Manager, HR, Admin, Exec).
  * **PW-NFR-03** – Manager scoping to their own reports and Org Units.

*(This is a cross-cutting UX/permissions EPIC across ESS & MSS + RBAC.)*

---

### EPIC 4 – Self-Service Wellness Experience

*Outcome:* Employees and managers see wellness as part of normal self-service, not a separate system, with clear visibility of Recovery and gamification.

* Covers:

  * **PW-ESS-01** – Employee view of Recovery Index, points, level and wellness indicators.
  * **PW-MSS-01** – Manager view of team wellbeing overlays and gamification summaries.
  * **PW-GAME-11** – Visual indicators for Recovery, Reflection and Wellness.
  * **PW-GAME-12** – Micro-rewards and badges tied to healthy behaviours.
  * **PW-LEAVE-19** to **PW-LEAVE-22** – Recovery Index computation and views.

---

## Module: Platform (Integrations & NFRs)

### EPIC 1 – ZHEP Wellness Integration

*Outcome:* PeopleWell and ZHEP share just enough data to power wellness journeys, without exposing sensitive HR or health details.

* Covers:

  * **PW-INT-01** – Emit events to ZHEP for appraisal completion, leave approvals and selected check-in signals.
  * **PW-INT-02** – Consume high-level engagement tags and participation summaries from ZHEP, not detailed health data.
  * **PW-LEAVE-23**, **PW-LEAVE-24** – Anonymised/aggregated leave-based wellness signals and configurability for non-identifiable data.
  * **PW-PERF-21** – Expose wellness-related appraisal actions to ZHEP.

---

### EPIC 2 – External Integrations & Open APIs

*Outcome:* PeopleWell plugs cleanly into payroll, BI and other systems via stable APIs and exports, without becoming a payroll engine itself.

* Covers:

  * **PW-INT-03** – Provide REST APIs for People, Employees, Org Units, Positions, Leave, Appraisals and Gamification states.
  * **PW-INT-04** – Exclude deep payroll integration for MVP but design not to block it.
  * **PW-NFR-06** – Expose all major operations via REST APIs.
  * **PW-NFR-07** – Provide events/webhooks for key changes (leave approved, appraisal completed, etc.).
  * **PW-NFR-12**, **PW-NFR-13** – Export reports to CSV/Excel for BI tools.

---

### EPIC 3 – Strong Multi-Tenancy & Isolation

*Outcome:* Multiple customers can safely share the platform without any risk of cross-tenant data leakage or AI cross-contamination.

* Covers:

  * **PW-NFR-01** – Strong tenant isolation (data partitioning, tenant context enforcement, no cross-tenant queries/contexts).
  * **PW-CORE-03**, **PW-CORE-04** – Multi-tenant Employee model and prohibition of cross-tenant joins.
  * **PW-AI-14**, **PW-AI-15** – Tenant- and role-scoped AI context; no cross-tenant data mixing in AI.

---

### EPIC 4 – Security, RBAC & Auditability

*Outcome:* Access is controlled by roles and org scope, and sensitive changes are always auditable.

* Covers:

  * **PW-NFR-02** – RBAC with Employee, Manager, HR, Admin, Exec roles and tenant-level customization.
  * **PW-NFR-03** – Manager scoping by direct/indirect reports and Org Units.
  * **PW-NFR-04** – Audit trail for sensitive actions (contracts, overrides, manual leave changes, appraisal overrides).
  * **PW-NFR-05** – Security best practices for authN/authZ and compatibility with external IdPs.

---

### EPIC 5 – Configurability & Simple Workflow Engine

*Outcome:* Tenants can adapt PeopleWell to their HR patterns (leave, performance, approvals) without heavy workflow tooling.

* Covers:

  * **PW-NFR-08** – Configuration of leave types/policies, performance templates/questions and basic approval workflows.
  * **PW-NFR-09** – Simple, form-based workflow configuration; full BPMN engine explicitly out of scope.
  * **PW-LEAVE-12**, **PW-LEAVE-13** – Configurable leave approval workflows.
  * **PW-PERF-15** – Configurable appraisal workflow steps.

---

### EPIC 6 – Onboarding at Speed (Imports & Setup)

*Outcome:* New tenants can be onboarded quickly using import templates and clear validation so they can see value fast.

* Covers:

  * **PW-NFR-10** – Excel/CSV import templates for employees, Org Units, Positions, Position Assignments, leave balances and performance templates.
  * **PW-NFR-11** – Validated import processes with clear error messages and re-upload capability.

---

### EPIC 7 – Insightful Reporting & Analytics Foundations

*Outcome:* HR and leadership get the essential views on people, leave, wellbeing, performance and gamification to run the business.

* Covers:

  * **PW-NFR-12** – Curated reports: employee list/headcount, leave usage & balance, Recovery Index summaries, performance results, gamification summary.
  * **PW-NFR-13** – Export of all reports to CSV/Excel.
  * **PW-LEAVE-21**, **PW-LEAVE-22** – Recovery Index views for managers and HR.
  * **PW-GAME-08**, **PW-GAME-10** – Challenge completion and manager scorecard visibility for managers and HR.

---

