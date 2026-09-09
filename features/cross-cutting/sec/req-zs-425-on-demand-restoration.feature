@REQ-ZS-425 @SEC-ZS-026 @mvp
Feature: On-demand restoration after a massive accidental deletion

  Scenario: Logged restoration with the school informed
    Given a school hit by a massive accidental deletion
    When the platform restores the school's data from backup
    Then the operation is logged in the audit log
    And the school is informed of the scope restored and of any loss since the last backup
