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
    +categoryCode
    +isPaid
    +requiresAttachment
    +minDuration
    +maxDuration
    +isWellnessRelated
    +isActive
  }

  class LeavePolicy {
    +leavePolicyId
    +accrualModelCode
    +daysPerPeriod
    +maxAnnualEntitlement
    +carryForwardAllowed
    +maxCarryForwardDays
    +proRataJoinersRuleCode
    +proRataLeaversRuleCode
    +effectiveFrom
    +effectiveTo
  }

  class LeavePeriod {
    +leavePeriodId
    +code
    +periodTypeCode
    +startDate
    +endDate
    +isActive
  }

  class LeaveBalance {
    +leaveBalanceId
    +openingBalance
    +accrued
    +taken
    +adjustmentTotal
    +closingBalance
    +lastRecalcAt
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
    +requestDateTime
    +startDate
    +endDate
    +totalDurationUnits
    +reason
    +attachmentRef
    +statusCode
    +currentStageCode
  }

  class LeaveRequestDay {
    +leaveRequestDayId
    +date
    +unitTypeCode
    +units
    +segmentNotes
  }

  class LeaveWorkflowRule {
    +workflowRuleId
    +scopeTypeCode
    +scopeValueCode
    +isActive
    +effectiveFrom
    +effectiveTo
    +specialRoutingFlags
  }

  class LeaveWorkflowStep {
    +workflowStepId
    +stepNumber
    +approverTypeCode
    +approverRoleId
    +isFinalStep
    +stepName
  }

  class LeaveApproval {
    +leaveApprovalId
    +decisionStatusCode
    +decisionDateTime
    +decisionComment
  }

  class RosterRule {
    +rosterRuleId
    +minStaffOnDuty
    +maxSimultaneousLeaves
    +scopeCode
    +isActive
    +effectiveFrom
    +effectiveTo
  }

  class RecoveryIndex {
    +recoveryIndexId
    +timeWindowTypeCode
    +timeWindowKey
    +score
    +classificationCode
    +metricsSummaryJson
    +computedAt
  }

  %% Tenant relationships
  Tenant "1" --> "many" LeaveType : owns
  Tenant "1" --> "many" LeavePolicy : owns
  Tenant "1" --> "many" LeavePeriod : owns
  Tenant "1" --> "many" LeaveBalance : owns
  Tenant "1" --> "many" LeaveRequest : owns
  Tenant "1" --> "many" LeaveWorkflowRule : owns
  Tenant "1" --> "many" LeaveWorkflowStep : owns
  Tenant "1" --> "many" RosterRule : owns
  Tenant "1" --> "many" RecoveryIndex : owns

  %% Type / policy / period
  LeaveType "1" --> "0..many" LeavePolicy : configured_for
  LeaveType "1" --> "many" LeaveBalance : typed
  LeaveType "1" --> "many" LeaveRequest : typed
  LeavePeriod "1" --> "many" LeaveBalance : in_period
  LeavePeriod "1" --> "many" LeaveRequest : in_period

  %% Balances & adjustments
  Employee "1" --> "many" LeaveBalance : has
  LeaveBalance "1" --> "many" LeaveBalanceAdjustment : adjustments

  %% Requests & days
  Employee "1" --> "many" LeaveRequest : requests
  LeaveRequest "1" --> "many" LeaveRequestDay : has_days

  %% Workflow
  LeaveType "1" --> "0..many" LeaveWorkflowRule : rules_for_type
  LeaveWorkflowRule "1" --> "many" LeaveWorkflowStep : has_steps
  LeaveRequest "1" --> "many" LeaveApproval : approvals
  LeaveWorkflowStep "1" --> "many" LeaveApproval : approvals_for_step

  %% Rosters & org
  OrgUnit "1" --> "many" RosterRule : constrained_by

  %% Recovery index
  Employee "1" --> "many" RecoveryIndex : has
