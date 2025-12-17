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

  %% New normalized entity
  class FieldDefinition {
    +fieldDefId
    +targetEntityType
    +fieldKey
    +label
    +helpText
    +fieldGroup
    +dataType
    +isActive
  }

  class SelfServiceFieldRule {
    +ruleId
    +portalType  "ESS/MSS"
    +visible
    +editable
    +requiresApproval
    +justificationRequired
    +effectiveFrom
    +effectiveTo
    +status
  }

  %% System / RBAC
  Tenant "1" --> "many" UserRole : owns_roles
  User "1" --> "many" UserRole : has
  UserRole "many" --> "1" Role : role
  UserRole "many" --> "1" Tenant : scope

  %% Conversations (context)
  User "1" --> "many" AIConversation : starts
  Tenant "1" --> "many" AIConversation : owns

  %% ESS/MSS config
  Tenant "1" --> "many" SelfServiceFieldRule : owns
  Role "1" --> "many" SelfServiceFieldRule : context
  FieldDefinition "1" --> "many" SelfServiceFieldRule : rules_for_field

  %% People & org context (read-only from ESS/MSS perspective)
  Person "1" --> "1" Employee : identity
  Employee "1" --> "many" PositionAssignment : assigned
  PositionAssignment "many" --> "1" OrgUnit : in_unit

  Employee "1" --> "many" LeaveRequest : submits
  Employee "1" --> "many" LeaveBalance : has
  Employee "1" --> "many" RecoveryIndex : has
  Employee "1" --> "many" PerfAppraisal : has
  Employee "1" --> "many" GamificationProfile : has
  Employee "1" --> "many" ManagerScorecard : as_manager
