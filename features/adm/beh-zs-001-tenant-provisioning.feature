@REQ-ZS-006 @BEH-ZS-001 @mvp
Feature: Provisioning a new tenant

  Scenario: Creating a tenant with a trial
    Given a school director who has signed with ZSchool
    When the super-administrator creates the tenant with the bilingual name, the city, and status "trial"
    Then the school exists in isolation and a director-administrator account is invited by mobile number
    And no other school's data is accessible from this tenant
    And the creation is recorded in the administration operations log
