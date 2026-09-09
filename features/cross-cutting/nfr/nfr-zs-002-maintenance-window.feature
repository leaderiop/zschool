@REQ-ZS-451 @NFR-ZS-002 @mvp
Feature: Planned maintenance window

  Scenario: Maintenance announced outside a critical period
    Given a maintenance window planned for a Wednesday in November from 01:00 to 04:00
    When the window opens
    Then administrators were notified at least 7 days in advance
    And an information banner is shown to logged-in users
    And the service is restored with an observed effective downtime of 3 hours

  Scenario: Denying a window during the start of the school year
    Given a maintenance window requested for September 8
    When the maintenance calendar is validated
    Then the request is automatically rejected as falling within a critical period
    And a fallback proposal outside the start of the school year is issued
