classDiagram
  class Tenant {
    +tenantId
    +name
  }

  class User {
    +userId
    +username
  }

  class Employee {
    +employeeId
    +employeeNumber
  }

  class PerfAppraisal {
    +appraisalId
    +overallScore
    +overallRating
    +aiSummaryDraft
    +aiSummaryStatus
    +aiSummaryLastGeneratedAt
    +aiSummaryLastActionAt
  }

  class HRRequest {
    +hrRequestId
    +status
    +subject
    +body
    +channel
    +assignedQueue
    +aiDraftReply
    +aiReplyStatus
    +aiReplyLastGeneratedAt
    +aiReplyLastActionAt
  }

  class AIConversation {
    +conversationId
    +type
    +entrySurface
    +subjectEntityType
    +subjectEntityId
    +startedAt
    +endedAt
    +status
  }

  class AIMessage {
    +messageId
    +senderType
    +senderRole
    +content
    +isSuggestion
    +underlyingSources
    +createdAt
  }

  class HRRequestClassification {
    +classificationId
    +predictedType
    +suggestedQueue
    +suggestedAssigneeUserId
    +confidence
    +modelVersion
    +suggestedAt
    +acceptedFlag
    +acceptedByUserId
    +acceptedAt
  }

  class AIFeedback {
    +feedbackId
    +actionTaken
    +helpfulness
    +editedText
    +comment
    +createdAt
  }

  %% Tenant scoping
  Tenant "1" --> "many" AIConversation : owns
  Tenant "1" --> "many" HRRequest : owns
  Tenant "1" --> "many" HRRequestClassification : owns
  Tenant "1" --> "many" AIFeedback : owns

  %% Users & employees
  User "1" --> "many" AIConversation : starts
  User "1" --> "many" HRRequest : submits
  User "1" --> "many" AIFeedback : gives

  Employee "1" --> "many" AIConversation : context
  Employee "1" --> "many" HRRequest : context

  %% Conversations & messages
  AIConversation "1" --> "many" AIMessage : has

  %% Feedback links
  AIMessage "1" --> "many" AIFeedback : feedback_on
  HRRequest "1" --> "many" AIFeedback : feedback_on_ai_reply
  PerfAppraisal "1" --> "many" AIFeedback : feedback_on_summary

  %% HR Requests & classification
  HRRequest "1" --> "many" HRRequestClassification : classified_by
  HRRequest "1" --> "0..1" HRRequestClassification : current_classification
