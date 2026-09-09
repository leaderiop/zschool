@REQ-ZS-344 @JNY-ZS-059 @v1
Feature: An electronic parental authorization for an outing

  Scenario: Signing then revoking before the deadline (V1)
    Given a school outing published by School A with a response deadline
    When Ahmed signs the authorization from his account then revokes it before the deadline
    Then the signature and the revocation are timestamped and logged
    And the school sees the final status, not authorized, with the action history
    And automatic reminders were sent to unresponded guardians before the deadline
