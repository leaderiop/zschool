@REQ-ZS-424 @SEC-ZS-001 @mvp
Feature: Tier-change alert toward the prior CNDP authorization

  Scenario: Activating collection of the national ID number
    Given a school whose recorded formality is an F211 declaration with no sensitive data or national ID
    When the principal's office activates collection of staff national ID numbers
    Then the assistant flags that the processing tier changes to the F112 prior authorization
    And the formalities register carries the required action with a deadline
    And the principal's office is informed of the review timeline

  Scenario: Activating the health module
    Given a school preparing to open the health record
    When the compliance questionnaire records collection of health data
    Then the assistant requires the F112 authorization to be tracked before any operational processing
    And the school's compliance status stays flagged until the authorization is obtained
