@REQ-ZS-008 @BEH-ZS-004 @mvp
Feature: Organization (school group)

  Scenario: Consolidated dashboard without data merging (MVP)
    Given an organization created by ZSchool grouping three schools (separate tenants)
    And an appointed group administrator
    When the group administrator opens the consolidated dashboard
    Then they see the headcount, attendance rate, and arrears for each site and their total
    And no named data from one site is visible from another site
    And a student search launched from one tenant never returns a student from another tenant

  Scenario: Logged detachment
    Given a school attached to an organization
    When the super-administrator detaches this school
    Then the school retains all of its data and its own subscription in full
    And the detachment is recorded in the administration operations log
