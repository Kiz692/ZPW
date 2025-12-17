## 1. Entities in the Gamification Layer

### 1.1 GamificationProfile (`GAM_PROFILE` / `GPR`)

**Purpose**

* Represent the gamification state per Employee per tenant.
* Hold current point totals and current level.
* Act as the anchor for transactions, badges, and visual summaries.

**Key attributes**

* Gamification profile ID
* Tenant reference (→ Tenant)
* Employee reference (→ Employee)
* Current total points
* Current level reference (→ LevelDefinition)
* Date of last level change
* Flags for whether rings/visuals should be shown (optional)

**Multi-tenant?**

* **Yes**

---

### 1.2 PointsTransaction (`GAM_POINTS_TXN` / `GPT`)

**Purpose**

* Record each “earn” or adjustment event for gamification points.
* Provide auditability and support recalculation if rules change.

**Key attributes**

* Points transaction ID
* Tenant reference (→ Tenant)
* Gamification profile reference (→ GamificationProfile)
* Transaction type (earn / adjustment – code)
* Event category (onboarding, leave_planning, self_review, check_in, wellness_program – code)
* Points delta (+/-)
* Transaction date/time
* Source domain & source ID (e.g. `LEAVE_REQUEST`, `PAP_APPRAISAL`, `CHK_CHECKIN`)
* Comment / description

**Multi-tenant?**

* **Yes**

> **Cross-domain:** references objects (leave, perf, check-in) via generic “source” fields, not hard FKs.

---

### 1.3 PointsRule (`GAM_POINTS_RULE` – not in mapping but implied)

**Purpose**

* Represent tenant-level configuration for how many points to award for specific actions.
* Keep rules within “safe templates” rather than fully arbitrary logic.

**Key attributes**

* Points rule ID
* Tenant reference (→ Tenant)
* Rule template code (e.g. `ONBOARDING_COMPLETE`, `BALANCED_LEAVE`, `TIMELY_SELF_REVIEW`)
* Enabled flag
* Points awarded (or expression type, if needed later)
* Conditions scope (e.g. per event type, min threshold)
* Effective-from / effective-to dates

**Multi-tenant?**

* **Yes**

> This is a configuration entity backing PW-GAME-02. The “safe templates” are captured via `rule template code` and validations in app/UI.

---

### 1.4 LevelDefinition (`GAM_LEVEL_DEF` / `GLD`)

**Purpose**

* Define global or tenant-specific levels (Getting Started, Steady, Thriving).
* Map cumulative points thresholds to levels.

**Key attributes**

* Level definition ID
* Tenant reference (→ Tenant) (can be null for global defaults, or tenant-specific overrides)
* Level code (e.g. `LEVEL_1`, `LEVEL_2`)
* Level name (e.g. “Getting Started”)
* Level description
* Min points threshold (inclusive)
* Max points threshold (inclusive)
* Sequence/order

**Multi-tenant?**

* Typically **Yes** (per tenant), but can support global defaults (tenant nullable).

---

### 1.5 ChallengeDefinition (`GAM_CHALLENGE_DEF` / `GCD`)

**Purpose**

* Define available team-based challenges (e.g. “Quarter of Recovery”, “Check-In Cadence”).
* Specify what completion means and which behaviours are tracked.

**Key attributes**

* Challenge definition ID
* Tenant reference (→ Tenant)
* Code (e.g. `QTR_RECOVERY`, `CHECKIN_CADENCE`)
* Name
* Description
* Challenge type (planned_breaks / wellbeing_checkins / other – code)
* Eligibility rules (e.g. which org units/teams or all) – could be simplified as JSON/config
* Target metric definition (e.g. “at least one 3+ day break for every team member”)
* Active flag
* Start/end date (if global window, otherwise each team instance defines its own)

**Multi-tenant?**

* **Yes**

---

### 1.6 ChallengeParticipation (`GAM_CHALLENGE_PARTICIPATION` / `GCP`)

**Purpose**

* Track team-level participation and completion of challenges.
* Maintain aggregate stats without per-employee leaderboards.

**Key attributes**

* Challenge participation ID
* Tenant reference (→ Tenant)
* Challenge definition reference (→ ChallengeDefinition)
* Team reference (→ OrgUnit or Position manager’s team)
* Challenge period (start/end dates)
* Number of eligible participants
* Number of participants who met criteria
* Percentage completion
* Status (NotStarted / InProgress / Completed – code)
* High-level summary / notes of behavioural change (text)

**Multi-tenant?**

* **Yes**

> If you later need per-employee progress for a challenge, you can add a separate `GAM_CHALLENGE_MEMBER_PROGRESS` entity; for MVP, this might stay implicit via analytics from other domains.

---

### 1.7 ManagerScorecard (`GAM_MANAGER_SCORECARD` / `GMS`)

**Purpose**

* Capture a “health stewardship” view for each manager over a given period.
* Aggregate metrics like planned breaks, check-in cadence, Recovery Index distribution.

**Key attributes**

* Manager scorecard ID
* Tenant reference (→ Tenant)
* Manager reference (→ Employee)
* Time window (e.g. month/quarter; start & end dates, or key like `2025_Q1`)
* Team coverage (number of direct reports in window)
* Metric: proportion with planned breaks (e.g. % of directs with at least one planned break of X days)
* Metric: check-in cadence (e.g. average check-ins per employee per quarter)
* Metric: Recovery Index distribution summary (e.g. counts in green/amber/red)
* Optional: derived “stewardship score” (numeric or band)
* Last computed date/time

**Multi-tenant?**

* **Yes**

> **Cross-domain:** computed from Leave (RecoveryIndex), Performance (CheckIns) and maybe ZHEP; stored here as a snapshot/read model.

---

### 1.8 BadgeDefinition (`GAM_BADGE` / `GBD`)

**Purpose**

* Define badges representing healthy behaviours (e.g. Recovery Planner, Reflection Champion).
* Provide semantics used when awarding micro-rewards.

**Key attributes**

* Badge definition ID
* Tenant reference (→ Tenant) (allow global defaults + tenant-specific)
* Code (e.g. `RECOVERY_PLANNER`)
* Name
* Description
* Badge category (Recovery / Reflection / Wellness – code)
* Criteria description (human-readable; system may hard-code logic elsewhere)
* Active flag

**Multi-tenant?**

* **Yes** (or nullable for global).

---

### 1.9 BadgeAward (`GAM_BADGE_AWARD` / `GBA`)

**Purpose**

* Represent that a specific Employee earned a specific badge at a certain time.
* Provide history of micro-rewards and recognition.

**Key attributes**

* Badge award ID
* Tenant reference (→ Tenant)
* Badge definition reference (→ BadgeDefinition)
* Employee reference (→ Employee)
* Award date/time
* Award source (automatic rule / manual HR / manager – code)
* Optional comment or message shown to employee

**Multi-tenant?**

* **Yes**

---

### 1.10 VisualIndicator / Rings *(conceptual read model)*

**Purpose**

* Provide “Recovery”, “Reflection” and “Wellness” ring values for display.
* Aggregate underlying metrics from other domains into a simple visual state.

**Key attributes (conceptual)**

* Employee reference (→ Employee)
* Recovery ring value (e.g. 0–100%)
* Reflection ring value (e.g. on-time self reviews, check-ins)
* Wellness ring value (e.g. participation in wellness actions/programs)
* Time window

**Multi-tenant?**

* Might be **computed on-the-fly** rather than persisted. If persisted, it becomes a tenant-scoped snapshot table.

> For now, treat this as an application-level projection; not necessarily a first-class persisted entity.

---

## 2. Relationships (Gamification Domain)

Using `A (1) -- (many) B` to mean one A to many B.

### Core gamification

1. **Tenant – GamificationProfile**
   `Tenant (1) -- (many) GamificationProfile`

2. **Employee – GamificationProfile**
   `Employee (1) -- (0..1) GamificationProfile`
   (one profile per employee per tenant; may be created lazily).

3. **GamificationProfile – PointsTransaction**
   `GamificationProfile (1) -- (many) PointsTransaction`

4. **Tenant – PointsRule**
   `Tenant (1) -- (many) PointsRule`

5. **Tenant – LevelDefinition**
   `Tenant (1) -- (many) LevelDefinition`
   (or global levels if tenant is nullable).

6. **LevelDefinition – GamificationProfile**
   `LevelDefinition (1) -- (many) GamificationProfile`
   (many employees can share the same level).

---

### Challenges

7. **Tenant – ChallengeDefinition**
   `Tenant (1) -- (many) ChallengeDefinition`

8. **ChallengeDefinition – ChallengeParticipation**
   `ChallengeDefinition (1) -- (many) ChallengeParticipation`

9. **OrgUnit (Team) – ChallengeParticipation** *(cross-domain)*
   `OrgUnit (1) -- (many) ChallengeParticipation`
   (participation is tracked per team/org unit).

---

### Manager scorecards

10. **Tenant – ManagerScorecard**
    `Tenant (1) -- (many) ManagerScorecard`

11. **Employee (as manager) – ManagerScorecard**
    `Employee (1) -- (many) ManagerScorecard`
    (one or more scorecards per period).

> Underlying metrics for ManagerScorecard are read from external domains: `LEA_RECOVERY_INDEX`, `PRF_CHECKIN`, etc., not hard-keyed.

---

### Badges / micro-rewards

12. **Tenant – BadgeDefinition**
    `Tenant (1) -- (many) BadgeDefinition`
    (with possibility of global defaults).

13. **BadgeDefinition – BadgeAward**
    `BadgeDefinition (1) -- (many) BadgeAward`

14. **Employee – BadgeAward**
    `Employee (1) -- (many) BadgeAward`

15. **GamificationProfile – BadgeAward** *(optional explicit link)*
    `GamificationProfile (0..1) -- (many) BadgeAward`
    (awards could be looked up via Employee, but linking to the profile is optional).

---

### Visual indicators (rings)

16. **GamificationProfile – VisualIndicator** *(if persisted)*
    `GamificationProfile (1) -- (many) VisualIndicator`
    (different time windows).

17. **Employee – VisualIndicator**
    `Employee (1) -- (many) VisualIndicator`
    (if stored independently of profile).

> In many implementations, the rings are computed from RecoveryIndex, PerfAppraisal, CheckIn and Points/Badges without a dedicated table.

---

## 3. Cross-domain / Overlap Flags

* **Employee (`PID_EMPLOYEE`)**

  * Owned by People Core; referenced by GamificationProfile, ManagerScorecard, BadgeAward.

* **OrgUnit (`ORG_UNIT`)**

  * Owned by Work Lattice; referenced by ChallengeParticipation.

* **RecoveryIndex (`LEA_RECOVERY_INDEX`)**

  * Owned by Rhythms (Leave & Absence); used as read-only input to ManagerScorecard and Recovery ring.

* **CheckIn (`PRF_CHECKIN`)**

  * Owned by Growth Signals; used as read-only input to ManagerScorecard, Challenge metrics, Reflection ring.

* **PerfAppraisal / PerfAction (`PRF_PERF_APPRAISAL`, `PRF_PERF_ACTION`)**

  * Owned by Performance; may feed into Reflection/Wellness rings or trigger points/badges (e.g. on-time self-review, wellness commitments).

* **PointsRule vs external rules engine**

  * PointsRule is a lightweight, gamification-specific configuration; you may later move complex logic into a shared rules engine domain.

* **VisualIndicator**

  * Might sit better in a cross-domain “Reporting/Analytics” context. For MVP, you can compute it directly in services, without separate storage.

---

## 4. Mermaid Class Diagram (Gamification Domain)

Conceptual domain-level view:

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

  class GamificationProfile {
    +profileId
    +currentPoints
    +currentLevelCode
    +lastLevelChangeAt
  }

  class PointsTransaction {
    +txnId
    +txnType
    +eventCategory
    +pointsDelta
    +txnAt
    +sourceDomain
    +sourceId
    +comment
  }

  class PointsRule {
    +ruleId
    +templateCode
    +enabled
    +pointsAwarded
    +effectiveFrom
    +effectiveTo
  }

  class LevelDefinition {
    +levelId
    +code
    +name
    +description
    +minPoints
    +maxPoints
    +sequence
  }

  class ChallengeDefinition {
    +challengeDefId
    +code
    +name
    +description
    +challengeType
    +eligibilityConfig
    +targetDefinition
    +isActive
  }

  class ChallengeParticipation {
    +participationId
    +startDate
    +endDate
    +eligibleCount
    +completedCount
    +completionPct
    +status
    +summary
  }

  class ManagerScorecard {
    +scorecardId
    +timeWindowKey
    +teamSize
    +pctWithPlannedBreaks
    +checkInCadence
    +recoveryGreenCount
    +recoveryAmberCount
    +recoveryRedCount
    +stewardshipScore
  }

  class BadgeDefinition {
    +badgeDefId
    +code
    +name
    +description
    +category
    +criteriaDescription
    +isActive
  }

  class BadgeAward {
    +badgeAwardId
    +awardedAt
    +awardSource
    +message
  }

  %% Optional projection
  class VisualIndicator {
    +visualId
    +timeWindowKey
    +recoveryRing
    +reflectionRing
    +wellnessRing
  }

  Tenant "1" --> "many" GamificationProfile : owns
  Tenant "1" --> "many" PointsRule : owns
  Tenant "1" --> "many" LevelDefinition : owns
  Tenant "1" --> "many" ChallengeDefinition : owns
  Tenant "1" --> "many" ManagerScorecard : owns
  Tenant "1" --> "many" BadgeDefinition : owns

  Employee "1" --> "0..1" GamificationProfile : has
  Employee "1" --> "many" ManagerScorecard : as_manager
  Employee "1" --> "many" BadgeAward : receives

  OrgUnit "1" --> "many" ChallengeParticipation : participates

  GamificationProfile "1" --> "many" PointsTransaction : has
  GamificationProfile "0..1" --> "many" BadgeAward : optional_link
  GamificationProfile "1" --> "many" VisualIndicator : if_persisted

  LevelDefinition "1" --> "many" GamificationProfile : currentLevel

  ChallengeDefinition "1" --> "many" ChallengeParticipation : instances

  BadgeDefinition "1" --> "many" BadgeAward : awards

