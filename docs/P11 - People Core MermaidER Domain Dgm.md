classDiagram
  class Tenant {
    +tenantId
    +name
  }

  class Person {
    +personId
    +firstName
    +middleName
    +lastName
    +genderCode
    +dateOfBirth
    +nationalityCode
  }

  class PersonContact {
    +contactId
    +contactTypeCode
    +contactValue
    +isPrimary
    +label
    +countryCode
  }

  class PersonIdentifier {
    +identifierId
    +identifierTypeCode
    +identifierValue
    +countryCode
    +validFrom
    +validTo
  }

  class Employee {
    +employeeId
    +employeeNumber
    +hireDate
    +employmentTypeCode
    +currentStatusCode
    +currentStatusEffectiveDate
  }

  class EmploymentContract {
    +contractId
    +contractTypeCode
    +startDate
    +endDate
    +probationEndDate
    +standardHoursPerWeek
    +standardDaysPerWeek
    +statusCode
  }

  class EmploymentStatusHistory {
    +statusHistoryId
    +statusCode
    +effectiveDate
    +reasonCode
    +reasonNote
  }

  class Dependent {
    +dependentId
    +name
    +relationshipCode
    +dateOfBirth
    +includedInHealthCover
    +wellnessEligible
  }

  class Qualification {
    +qualificationId
    +qualificationTypeCode
    +institution
    +qualificationName
    +levelCode
    +completionYear
  }

  class EmploymentHistory {
    +employmentHistoryId
    +employerName
    +roleTitle
    +startDate
    +endDate
    +summary
  }

  class WellnessProfile {
    +wellnessProfileId
    +consentFlag
    +preferredChannelCode
    +lastZhepSyncAt
  }

  class WellnessProfileTag {
    +wellnessProfileTagId
    +tagCode
    +sourceSystem
    +firstSeenAt
    +lastUpdatedAt
    +isActive
  }

  %% Cross-domain reference (simplified)
  class PositionAssignment {
    +positionAssignmentId
    +isPrimary
    +startDate
    +endDate
  }

  Tenant "1" --> "many" Employee : has
  Person "1" --> "many" Employee : identifies
  Person "1" --> "many" PersonContact : has
  Person "1" --> "many" PersonIdentifier : has
  Person "1" --> "many" Qualification : has
  Person "1" --> "many" EmploymentHistory : has

  Employee "1" --> "many" EmploymentContract : has
  Employee "1" --> "many" EmploymentStatusHistory : status history
  Employee "1" --> "many" Dependent : has
  Employee "1" --> "0..1" WellnessProfile : has

  WellnessProfile "1" --> "many" WellnessProfileTag : tags

  EmploymentContract "0..many" --> "0..1" PositionAssignment : primary position
