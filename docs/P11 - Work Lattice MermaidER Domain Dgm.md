classDiagram
    class SYS_TENANT {
      +TEN_ID
      +TEN_NAME
    }

    class PID_EMPLOYEE {
      +EMP_ID
      +EMP_TENANT_ID
      ...
    }

    class ORG_UNIT {
      +UNT_ID
      +UNT_TENANT_ID
      +UNT_CODE
      +UNT_NAME
      +UNT_TYPE_CODE
      +UNT_PARENT_UNT_ID
      +UNT_EFFECTIVE_FROM
      +UNT_EFFECTIVE_TO
    }

    class ORG_JOB_ROLE {
      +JBR_ID
      +JBR_TENANT_ID
      +JBR_CODE
      +JBR_NAME
      +JBR_FAMILY
      +JBR_LEVEL_BAND
      +JBR_SUMMARY
    }

    class ORG_JOB_REQUIREMENT {
      +JRE_ID
      +JRE_TENANT_ID
      +JRE_JBR_ID
      +JRE_MIN_QUAL_LEVEL_CODE
      +JRE_DESIRED_YEARS_EXP
    }

    class ORG_JOB_SKILL {
      +JSK_ID
      +JSK_TENANT_ID
      +JSK_JRE_ID
      +JSK_SKILL_CODE
      +JSK_LEVEL_CODE
      +JSK_IS_MANDATORY
    }

    class ORG_POSITION {
      +POS_ID
      +POS_TENANT_ID
      +POS_CODE
      +POS_TITLE
      +POS_UNT_ID
      +POS_JBR_ID
      +POS_PRIMARY_POS_ID
      +POS_SECONDARY_POS_ID
      +POS_EFFECTIVE_FROM
      +POS_EFFECTIVE_TO
    }

    class ORG_POSITION_ASSIGNMENT {
      +PAS_ID
      +PAS_TENANT_ID
      +PAS_EMP_ID
      +PAS_POS_ID
      +PAS_ASSIGNMENT_TYPE_CODE
      +PAS_START_DATE
      +PAS_END_DATE
      +PAS_IS_CURRENT
    }

    %% Tenant scoping
    SYS_TENANT "1" <-- "many" ORG_UNIT : tenant
    SYS_TENANT "1" <-- "many" ORG_JOB_ROLE : tenant
    SYS_TENANT "1" <-- "many" ORG_JOB_REQUIREMENT : tenant
    SYS_TENANT "1" <-- "many" ORG_JOB_SKILL : tenant
    SYS_TENANT "1" <-- "many" ORG_POSITION : tenant
    SYS_TENANT "1" <-- "many" ORG_POSITION_ASSIGNMENT : tenant

    %% Org hierarchy
    ORG_UNIT "1" <-- "many" ORG_UNIT : parent-child
    ORG_UNIT "1" <-- "many" ORG_POSITION : positions

    %% Role & requirements
    ORG_JOB_ROLE "1" <-- "many" ORG_POSITION : has positions
    ORG_JOB_ROLE "1" <-- "1" ORG_JOB_REQUIREMENT : has requirements
    ORG_JOB_REQUIREMENT "1" <-- "many" ORG_JOB_SKILL : has skills

    %% Reporting lines
    ORG_POSITION "1" <-- "many" ORG_POSITION : primary reports-to
    ORG_POSITION "1" <-- "many" ORG_POSITION : secondary reports-to

    %% Assignments
    PID_EMPLOYEE "1" <-- "many" ORG_POSITION_ASSIGNMENT : employee assignments
    ORG_POSITION "1" <-- "many" ORG_POSITION_ASSIGNMENT : position assignments
