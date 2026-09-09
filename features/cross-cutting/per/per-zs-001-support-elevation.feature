@REQ-ZS-402 @PER-ZS-001 @mvp
Feature: Temporary elevation of ZSchool support on a ticket

  Scenario: Bounded, notified, and logged access
    Given a support ticket reporting an import issue on a tenant
    When a support agent requests an access elevation with scope "enrollment" and a 4-hour duration
    And the principal approves the request in the application
    Then the school is notified that access has been opened
    And the agent sees only the ticket's scope for the stated duration
    And every view and write is logged with the associated ticket
    And on expiry, access is closed and the school is notified of the closure
