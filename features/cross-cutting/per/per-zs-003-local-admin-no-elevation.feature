@REQ-ZS-405 @PER-ZS-003 @mvp
Feature: Local system administrator with no elevation path (MVP)

  Scenario: Attempt to reset a principal-track account
    Given a local system administrator of the tenant
    When they attempt to reset the principal's account access
    Then the operation is denied with a notice that dual control by the leadership is required
    And the attempt is logged with author and timestamp
