@REQ-ZS-533 @INT-ZS-040 @mvp
Feature: Data residency in Morocco

  Scenario: Residency check at launch
    Given the platform deployed for the pilots
    When the residency check runs
    Then all student, guardian, and school data is located in af-casablanca-1 and backups are in Morocco
    And the check report is archived with messaging exceptions explicitly listed

  Scenario: A new external service proposed
    Given a proposal to integrate a new external vendor
    When it is evaluated
    Then it is refused until data location and Law 09.08 governance are demonstrated
