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
    +statusCode
  }

  class PerfTemplate {
    +templateId
    +name
    +description
    +isActive
  }

  class PerfTemplateAssignment {
    +templateAssignmentId
    +scopeTypeCode
    +scopeValue
    +effectiveFrom
    +effectiveTo
    +priority
  }

  class PerfSection {
    +sectionId
    +sectionTypeCode
    +label
    +isScoring
    +weightPct
    +sequence
  }

  class PerfQuestion {
    +questionId
    +text
    +helpText
    +responseTypeCode
    +innerWeight
    +isActive
  }

  class PerfAppraisal {
    +appraisalId
    +statusCode
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

  class PerfItem {
    +perfItemId
    +itemTypeCode
    +title
    +description
    +roleContext
    +targetOrMeasure
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
    +actionTypeCode
    +description
    +ownerEmployeeId
    +targetDate
    +statusCode
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

  %% Tenant scoping
  Tenant "1" --> "many" PerfCycle : owns
  Tenant "1" --> "many" PerfTemplate : owns
  Tenant "1" --> "many" PerfSection : owns
  Tenant "1" --> "many" PerfQuestion : owns
  Tenant "1" --> "many" PerfAppraisal : owns
  Tenant "1" --> "many" PerfItem : owns
  Tenant "1" --> "many" PerfAction : owns
  Tenant "1" --> "many" RatingBand : owns
  Tenant "1" --> "many" CheckIn : owns

  %% Template & sections
  PerfTemplate "1" --> "many" PerfSection : has
  PerfSection "1" --> "many" PerfQuestion : has

  %% Template assignment
  PerfTemplate "1" --> "many" PerfTemplateAssignment : assigned_to
  JobRole "0..1" --> "many" PerfTemplateAssignment : when_scope_is_job_role

  %% Appraisals
  PerfCycle "1" --> "many" PerfAppraisal : has
  Employee "1" --> "many" PerfAppraisal : reviewed_in
  PerfTemplate "1" --> "many" PerfAppraisal : uses
  RatingBand "0..1" --> "many" PerfAppraisal : band_used

  %% Questions & answers
  PerfAppraisal "1" --> "many" PerfAnswer : has
  PerfQuestion "1" --> "many" PerfAnswer : answered_in

  %% Items (KPIs/OKRs)
  PerfAppraisal "1" --> "many" PerfItem : has_items
  PerfSection "0..1" --> "many" PerfItem : item_section

  %% Actions
  PerfAppraisal "1" --> "many" PerfAction : has_actions
  Employee "1" --> "many" PerfAction : owns_actions

  %% Rating bands
  RatingBand "1" --> "many" RatingBandRange : has_ranges

  %% Check-ins
  Employee "1" --> "many" CheckIn : as_subject
  Employee "1" --> "many" CheckIn : as_manager
