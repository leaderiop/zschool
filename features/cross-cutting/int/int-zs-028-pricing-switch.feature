@REQ-ZS-529 @INT-ZS-028 @mvp
Feature: 10/01/2026 pricing switch

  Scenario: A utility message sent after the switch
    Given the switch date configured as 10/01/2026 and Morocco's standalone grid loaded
    When a utility message is delivered on 09/30/2026
    And a utility message is delivered on 10/01/2026
    Then the first is priced per the pre-switch grid
    And the second is priced per the standalone grid
    And both appear in the school's monthly consumption report

  Scenario: Grid not loaded on the switch date
    Given the switch date reached with no up-to-date grid
    When a send is scheduled
    Then a platform alert is raised and sends continue using the last known grid, flagged for correction
