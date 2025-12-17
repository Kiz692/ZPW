## 1. Entities in Growth Signals (Performance & Check-ins)

### 1.1 PerfCycle (`PRF_PERF_CYCLE` / `PCL`)

**Purpose**

* Represent a performance appraisal cycle (e.g. H1, H2, Annual) per tenant.
* Provide boundaries for appraisals, templates, and reporting.

**Key attributes**

* Cycle ID
* Tenant reference (→ Tenant)
* Code (e.g. `2025_H1`)
* Name (e.g. “2025 Half Year 1”)
* Start date
* End date
* Status (Planning / Active / Closed – code)
* Optional: default template mapping strategy (by role/family)

**Multi-tenant?**

* **Yes**

---

### 1.2 PerfTemplate (`PRF_PERF_TEMPLATE` / `PTM`)

**Purpose**

* Define the structure of an appraisal for a group of jobs/roles.
* Group sections (KPIs, OKRs, Values, L&D, etc.) under one template.

**Key attributes**

* Template ID
* Tenant reference (→ Tenant)
* Name
* Description
* Active flag
* Optional: default rating scale reference

**Multi-tenant?**

* **Yes**

---

### 1.3 PerfTemplateAssignment *(Template ↔ JobRole/JobFamily)*

**Purpose**

* Map Performance Templates to Job Roles or Job Families.
* Ensure the right template is used for each employee in a cycle.

**Key attributes**

* Template assignment ID
* Tenant reference (→ Tenant)
* Template reference (→ PerfTemplate)
* Job role reference (→ JobRole) **or** job family code
* Effective-from / effective-to dates
* Priority/order (if multiple matches)

**Multi-tenant?**

* **Yes**

> **Cross-domain:** references `ORG_JOB_ROLE` (Work Lattice).

---

### 1.4 PerfSection (`PRF_PERF_SECTION` / `PSC`)

**Purpose**

* Represent a logical section within a template (e.g. KPIs, OKRs, Culture, L&D).
* Carry configuration for scoring and weighting.

**Key attributes**

* Section ID
* Tenant reference (→ Tenant)
* Template reference (→ PerfTemplate)
* Section type (SelfReflection, JobKPIs, OKR, AddValue, Culture, LearningDev – code)
* Display name / label
* Is scoring? (Y/N)
* Weight % (for scoring sections)
* Sequence order

**Multi-tenant?**

* **Yes**

---

### 1.5 PerfQuestion (`PRF_PERF_QUESTION` / `PQS`)

**Purpose**

* Define narrative/behavioural questions within template sections.
* Drive consistent prompts for Self Reflection, Add Value, Culture, L&D, etc.

**Key attributes**

* Question ID
* Tenant reference (→ Tenant)
* Section reference (→ PerfSection)
* Question text
* Help text (optional)
* Response type (TEXT / RATING / RATING_PLUS_TEXT – code)
* Optional weight within section
* Active flag

**Multi-tenant?**

* **Yes**

---

### 1.6 PerfAppraisal (`PRF_PERF_APPRAISAL` / `PAP`)

**Purpose**

* Represent one performance appraisal instance per employee per cycle.
* Anchor all answers, KPIs, OKRs, actions and final scores.

**Key attributes**

* Appraisal ID
* Tenant reference (→ Tenant)
* Cycle reference (→ PerfCycle)
* Employee reference (→ Employee)
* Template reference (→ PerfTemplate)
* Status (NotStarted / SelfInProgress / ManagerInProgress / HRReview / Finalized – code)
* Self-review completion date (optional)
* Manager review completion date (optional)
* Finalization date
* Overall numeric score (computed)
* Overall rating band (code)
* Locked/read-only flag

**Multi-tenant?**

* **Yes**

> **Cross-domain:** references `PID_EMPLOYEE` (People Core).

---

### 1.7 PerfAnswer (`PRF_PERF_ANSWER` / `PAN`)

**Purpose**

* Store responses to template questions for each appraisal.
* Capture self, manager and final/agreed ratings and comments.

**Key attributes**

* Answer ID
* Tenant reference (→ Tenant)
* Appraisal reference (→ PerfAppraisal)
* Question reference (→ PerfQuestion)
* Self rating (optional)
* Self comment (optional)
* Manager rating (optional)
* Manager comment (optional)
* Final/agreed rating (optional)
* Final/agreed comment (optional)

**Multi-tenant?**

* **Yes**

---

### 1.8 PerfKPI (`PRF_PERF_KPI` / `PKP`)

**Purpose**

* Represent a KPI item defined for a specific appraisal.
* Allow weighting and scoring at item level for the KPI section.

**Key attributes**

* KPI ID
* Tenant reference (→ Tenant)
* Appraisal reference (→ PerfAppraisal)
* Optional section reference (→ PerfSection, usually KPI section)
* Title
* Description
* Target / measure
* Weight % within the KPI section
* Self rating & comment
* Manager rating & comment
* Final rating & comment

**Multi-tenant?**

* **Yes**

---

### 1.9 PerfOKR (`PRF_PERF_OKR` / `POK`)

**Purpose**

* Represent an OKR initiative/project item per appraisal.
* Provide structure for objectives/outcomes tracked in the OKR section.

**Key attributes**

* OKR ID
* Tenant reference (→ Tenant)
* Appraisal reference (→ PerfAppraisal)
* Optional section reference (→ PerfSection, usually OKR section)
* Initiative name
* Objective description
* Employee role in the initiative
* Weight % within the OKR section
* Self rating & comment
* Manager rating & comment
* Final rating & comment

**Multi-tenant?**

* **Yes**

---

### 1.10 PerfAction (`PRF_PERF_ACTION` / `PAC`)

**Purpose**

* Capture 3–5 key post-appraisal actions per employee.
* Distinguish performance goals, L&D actions, and wellness commitments.

**Key attributes**

* Action ID
* Tenant reference (→ Tenant)
* Appraisal reference (→ PerfAppraisal)
* Action type (PerformanceGoal / LearningDev / Wellness – code)
* Description
* Owner (usually the employee; could also reference manager)
* Target date
* Status (Planned / InProgress / Completed / Cancelled – code)

**Multi-tenant?**

* **Yes**

> **Cross-domain:** wellness-type actions are exposed to ZHEP as goals/activities.

---

### 1.11 RatingBand (`PRF_RATING_BAND` – conceptual)

**Purpose**

* Define tenant-specific mapping between numeric scores and rating labels.
* Provide a consistent rating scale (e.g. 1–5, “Exceeds / Meets / Below”).

**Key attributes**

* Rating band ID
* Tenant reference (→ Tenant)
* Name (e.g. “Default 5-point scale”)
* Description
* Active flag

**Multi-tenant?**

* **Yes**

---

### 1.12 RatingBandRange (`PRF_RATING_BAND_RANGE` – conceptual)

**Purpose**

* Represent individual ranges within a rating band (e.g. 4.5–5.0 = “Exceeds”).
* Allow different rating scales per tenant and per band.

**Key attributes**

* Range ID
* Rating band reference (→ RatingBand)
* Code (e.g. “E”, “M”, “B”)
* Label (e.g. “Exceeds Expectations”)
* Min score (inclusive)
* Max score (inclusive)
* Sequence/order

**Multi-tenant?**

* **Yes** (via RatingBand’s tenant).

---

### 1.13 CheckIn (`PRF_CHECKIN` / `CHK`)

**Purpose**

* Record 1:1 check-ins between employee and manager outside formal appraisals.
* Capture micro-feedback and simple wellness indicators (energy, workload, stress).

**Key attributes**

* Check-in ID
* Tenant reference (→ Tenant)
* Employee reference (→ Employee – the person receiving support/feedback)
* Manager reference (→ Employee – line manager at time)
* Date/time
* Summary / notes
* Energy indicator (e.g. 1–5)
* Workload indicator (e.g. 1–5)
* Stress indicator (e.g. 1–5)

**Multi-tenant?**

* **Yes**

> **Cross-domain:** used as input for AI Manager Insight Copilot and wellness analytics.

---

## 2. Relationships (Growth Signals Domain)

Cardinalities expressed as `A (1) -- (many) B` meaning one A to many B.

### Core performance structure

1. **Tenant – PerfCycle**
   `Tenant (1) -- (many) PerfCycle`

2. **Tenant – PerfTemplate**
   `Tenant (1) -- (many) PerfTemplate`

3. **Tenant – PerfSection / PerfQuestion / RatingBand / CheckIn etc.**
   Each is tenant-scoped, e.g. `Tenant (1) -- (many) PerfSection`.

4. **PerfTemplate – PerfSection**
   `PerfTemplate (1) -- (many) PerfSection`

5. **PerfSection – PerfQuestion**
   `PerfSection (1) -- (many) PerfQuestion`

6. **PerfTemplate – PerfTemplateAssignment**
   `PerfTemplate (1) -- (many) PerfTemplateAssignment`

7. **JobRole – PerfTemplateAssignment** *(cross-domain)*
   `JobRole (1) -- (many) PerfTemplateAssignment`
   (or JobFamily if you model that explicitly).

---

### Appraisals & answers

8. **PerfCycle – PerfAppraisal**
   `PerfCycle (1) -- (many) PerfAppraisal`

9. **Employee – PerfAppraisal** *(cross-domain)*
   `Employee (1) -- (many) PerfAppraisal`

10. **PerfTemplate – PerfAppraisal**
    `PerfTemplate (1) -- (many) PerfAppraisal`

11. **PerfAppraisal – PerfAnswer**
    `PerfAppraisal (1) -- (many) PerfAnswer`

12. **PerfQuestion – PerfAnswer**
    `PerfQuestion (1) -- (many) PerfAnswer`

---

### KPIs & OKRs

13. **PerfAppraisal – PerfKPI**
    `PerfAppraisal (1) -- (many) PerfKPI`

14. **PerfSection – PerfKPI** (optional explicit link)
    `PerfSection (0..1) -- (many) PerfKPI`
    (typically the “KPIs” section).

15. **PerfAppraisal – PerfOKR**
    `PerfAppraisal (1) -- (many) PerfOKR`

16. **PerfSection – PerfOKR** (optional explicit link)
    `PerfSection (0..1) -- (many) PerfOKR`
    (typically the “OKRs/Initiatives” section).

---

### Actions & scoring

17. **PerfAppraisal – PerfAction**
    `PerfAppraisal (1) -- (many) PerfAction`

18. **RatingBand – RatingBandRange**
    `RatingBand (1) -- (many) RatingBandRange`

19. **Tenant – RatingBand**
    `Tenant (1) -- (many) RatingBand`

20. **PerfAppraisal – RatingBand**
    `RatingBand (0..1) -- (many) PerfAppraisal`
    (Appraisal may reference the rating band used to derive its rating code.)

---

### Check-ins

21. **Employee – CheckIn (as subject)**
    `Employee (1) -- (many) CheckIn`
    (employee being checked-in with).

22. **Employee – CheckIn (as manager)**
    `Employee (1) -- (many) CheckIn`
    (manager conducting the check-in).

23. **Tenant – CheckIn**
    `Tenant (1) -- (many) CheckIn`

> CheckIns are then consumed by AI/analytics, but those relationships live in the AI domain.

---

## 3. Cross-domain / Overlap Flags

* **Employee (`PID_EMPLOYEE`)**

  * Owned by People Core, referenced by PerfAppraisal and CheckIn.

* **JobRole / JobFamily (`ORG_JOB_ROLE`)**

  * Owned by Work Lattice, referenced by PerfTemplateAssignment.

* **PerfAction (Wellness actions)**

  * Wellness-type actions are shared/integrated with ZHEP (Wellness Engagement domain). PeopleWell owns the HR-facing record; ZHEP may maintain its own goal/activity entities.

* **CheckIn**

  * Owned by Growth Signals, but used as an input to AI/Analytics domain (Manager Insight Copilot, wellness analytics). No punitive decisions should directly rely on these.

* **RatingBand / RatingBandRange**

  * Could potentially be reused by other modules (e.g. gamification or other scoring features). For MVP, scoped to Performance.

---

## 4. Mermaid Class Diagram (Growth Signals Domain)

Conceptual domain-level diagram:

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

  class JobRole {
    +jobRoleId
    +code
    +name
  }

  class PerfCycle {
    +cycleId
    +code
    +name
    +startDate
    +endDate
    +status
  }

  class PerfTemplate {
    +templateId
    +name
    +description
    +isActive
  }

  class PerfTemplateAssignment {
    +assignmentId
    +effectiveFrom
    +effectiveTo
    +priority
  }

  class PerfSection {
    +sectionId
    +type
    +label
    +isScoring
    +weightPct
    +sequence
  }

  class PerfQuestion {
    +questionId
    +text
    +helpText
    +responseType
    +innerWeight
    +isActive
  }

  class PerfAppraisal {
    +appraisalId
    +status
    +selfCompletedAt
    +managerCompletedAt
    +finalizedAt
    +overallScore
    +overallRatingCode
    +isLocked
  }

  class PerfAnswer {
    +answerId
    +selfRating
    +selfComment
    +managerRating
    +managerComment
    +finalRating
    +finalComment
  }

  class PerfKPI {
    +kpiId
    +title
    +description
    +target
    +weightPct
    +selfRating
    +selfComment
    +managerRating
    +managerComment
    +finalRating
    +finalComment
  }

  class PerfOKR {
    +okrId
    +initiativeName
    +objective
    +employeeRole
    +weightPct
    +selfRating
    +selfComment
    +managerRating
    +managerComment
    +finalRating
    +finalComment
  }

  class PerfAction {
    +actionId
    +type
    +description
    +owner
    +targetDate
    +status
  }

  class RatingBand {
    +ratingBandId
    +name
    +description
    +isActive
  }

  class RatingBandRange {
    +rangeId
    +code
    +label
    +minScore
    +maxScore
    +sequence
  }

  class CheckIn {
    +checkInId
    +dateTime
    +summary
    +energyScore
    +workloadScore
    +stressScore
  }

  Tenant "1" --> "many" PerfCycle : owns
  Tenant "1" --> "many" PerfTemplate : owns
  Tenant "1" --> "many" RatingBand : owns
  Tenant "1" --> "many" CheckIn : owns

  PerfTemplate "1" --> "many" PerfSection : has
  PerfSection "1" --> "many" PerfQuestion : has

  PerfTemplate "1" --> "many" PerfTemplateAssignment : assigned_to
  JobRole "1" --> "many" PerfTemplateAssignment : uses

  PerfCycle "1" --> "many" PerfAppraisal : has
  Employee "1" --> "many" PerfAppraisal : reviewed_in

  PerfAppraisal "1" --> "many" PerfAnswer : has
  PerfQuestion "1" --> "many" PerfAnswer : answered_in

  PerfAppraisal "1" --> "many" PerfKPI : has_kpis
  PerfSection "0..1" --> "many" PerfKPI : kpi_section

  PerfAppraisal "1" --> "many" PerfOKR : has_okrs
  PerfSection "0..1" --> "many" PerfOKR : okr_section

  PerfAppraisal "1" --> "many" PerfAction : has_actions

  RatingBand "1" --> "many" RatingBandRange : has_ranges
  RatingBand "0..1" --> "many" PerfAppraisal : applied_to

  Employee "1" --> "many" CheckIn : as_subject
  Employee "1" --> "many" CheckIn : as_manager
