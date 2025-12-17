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
    +showVisualsFlag
  }

  class PointsTransaction {
    +txnId
    +txnType        // EARN, ADJUSTMENT
    +eventCategory  // ONBOARDING, LEAVE_PLANNING, etc.
    +pointsDelta
    +txnAt
    +sourceDomain
    +sourceId
    +comment
  }

  class PointsRule {
    +ruleId
    +templateCode   // ONBOARDING_COMPLETE, etc.
    +enabled
    +pointsAwarded
    +conditionScope // optional
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
    +challengeType        // PLANNED_BREAKS, etc.
    +eligibilityConfig    // JSON / text
    +targetDefinition     // text
    +isActive
    +startDate
    +endDate
  }

  class ChallengeParticipation {
    +participationId
    +startDate
    +endDate
    +eligibleCount
    +completedCount
    +completionPct    // derived, cached
    +status           // NOT_STARTED, IN_PROGRESS, COMPLETED
    +summary
  }

  class ManagerScorecard {
    +scorecardId
    +timeWindowType   // MONTH, QUARTER, etc.
    +timeWindowKey    // 2025-01, 2025_Q1, ...
    +teamSize
    +pctWithPlannedBreaks    // derived
    +checkInCadence          // derived
    +recoveryGreenCount      // derived
    +recoveryAmberCount      // derived
    +recoveryRedCount        // derived
    +stewardshipScore        // derived
    +computedAt
  }

  class BadgeDefinition {
    +badgeDefId
    +code
    +name
    +description
    +category           // RECOVERY, REFLECTION, WELLNESS
    +criteriaDescription
    +isActive
  }

  class BadgeAward {
    +badgeAwardId
    +awardedAt
    +awardSource    // AUTO_RULE, MANAGER, HR
    +message
  }

  class GamificationVisualState {
    +visualStateId
    +timeWindowType   // DAY, WEEK, MONTH, ...
    +timeWindowKey
    +recoveryRingValue
    +reflectionRingValue
    +wellnessRingValue
    +computedAt
  }

  %% Tenant scoping
  Tenant "1" --> "many" GamificationProfile : owns
  Tenant "1" --> "many" PointsRule : owns
  Tenant "1" --> "many" LevelDefinition : owns
  Tenant "1" --> "many" ChallengeDefinition : owns
  Tenant "1" --> "many" ManagerScorecard : owns
  Tenant "1" --> "many" BadgeDefinition : owns
  Tenant "1" --> "many" GamificationVisualState : owns

  %% Employee links
  Employee "1" --> "0..1" GamificationProfile : has_profile
  Employee "1" --> "many" ManagerScorecard : as_manager
  Employee "1" --> "many" BadgeAward : receives
  Employee "1" --> "many" GamificationVisualState : has_visuals

  %% Org / team links
  OrgUnit "1" --> "many" ChallengeParticipation : participates

  %% Profile-based relationships
  GamificationProfile "1" --> "many" PointsTransaction : has_txns
  GamificationProfile "1" --> "many" GamificationVisualState : visual_snapshots
  GamificationProfile "0..1" --> "many" BadgeAward : optional_link

  LevelDefinition "1" --> "many" GamificationProfile : currentLevel

  ChallengeDefinition "1" --> "many" ChallengeParticipation : instances

  BadgeDefinition "1" --> "many" BadgeAward : awards
