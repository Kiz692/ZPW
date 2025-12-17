classDiagram
  class Tenant {
    +tenantId
    +name
    +status
  }

  class User {
    +userId
    +username
    +status
  }

  class Role {
    +roleId
    +code
    +name
  }

  class UserRole {
    +userRoleId
    +roleCode
    +status
  }

  class IntegrationEvent {
    +eventId
    +eventType
    +subjectEntityType
    +subjectEntityId
    +payloadSummary
    +occurredAt
  }

  class IntegrationSubscription {
    +subscriptionId
    +subscriberSystem
    +destinationType
    +destinationUrl
    +isActive
  }

  class IntegrationSubscriptionEventType {
    +id
    +eventType
  }

  class EventDelivery {
    +deliveryId
    +status
    +attemptCount
    +lastAttemptAt
    +lastStatusCode
    +errorMessage
  }

  class EngagementSignal {
    +signalId
    +sourceSystem
    +tags
    +participationSummary
    +receivedAt
    +processed
  }

  class AuditLogEntry {
    +auditId
    +actionType
    +targetEntityType
    +targetEntityId
    +description
    +timestamp
  }

  class WorkflowDefinition {
    +workflowDefId
    +workflowCode
    +processType
    +levels
    +isActive
  }

  class ImportTemplate {
    +templateId
    +templateCode
    +entityType
    +version
    +isActive
  }

  class ImportTemplateColumn {
    +columnId
    +columnName
    +targetField
    +isRequired
    +dataType
    +orderIndex
  }

  class ImportJob {
    +jobId
    +status
    +totalRows
    +successRows
    +errorRows
    +createdAt
    +completedAt
  }

  class ImportJobRowResult {
    +rowResultId
    +rowNumber
    +status
    +errorMessages
  }

  class ReportDefinition {
    +reportDefId
    +code
    +name
    +description
    +allowedFormats
  }

  class ReportRun {
    +reportRunId
    +status
    +parameters
    +outputLocation
    +createdAt
    +completedAt
  }

  class Employee {
    +employeeId
    +employeeNumber
  }

  %% RBAC
  Tenant "1" --> "many" UserRole : owns_roles
  User "1" --> "many" UserRole : has
  Role "1" --> "many" UserRole : role

  %% Events & integrations
  Tenant "1" --> "many" IntegrationEvent : emits
  Tenant "1" --> "many" IntegrationSubscription : config

  IntegrationSubscription "1" --> "many" IntegrationSubscriptionEventType : event_types
  IntegrationEvent "1" --> "many" EventDelivery : deliveries
  IntegrationSubscription "1" --> "many" EventDelivery : to_subscription

  Tenant "1" --> "many" EngagementSignal : receives
  Employee "1" --> "many" EngagementSignal : for_employee

  %% Audit & workflow
  Tenant "1" --> "many" AuditLogEntry : logs
  User "1" --> "many" AuditLogEntry : actor

  Tenant "1" --> "many" WorkflowDefinition : workflows

  %% Imports
  Tenant "1" --> "many" ImportTemplate : templates
  ImportTemplate "1" --> "many" ImportTemplateColumn : columns

  Tenant "1" --> "many" ImportJob : import_jobs
  User "1" --> "many" ImportJob : created_by
  ImportTemplate "1" --> "many" ImportJob : used_in
  ImportJob "1" --> "many" ImportJobRowResult : row_results

  %% Reporting
  Tenant "1" --> "many" ReportDefinition : reports
  ReportDefinition "1" --> "many" ReportRun : runs
  Tenant "1" --> "many" ReportRun : report_runs
  User "1" --> "many" ReportRun : requested_by
