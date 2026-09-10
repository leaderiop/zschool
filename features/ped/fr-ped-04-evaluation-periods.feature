@REQ-ZS-056 @BEH-ZS-054 @mvp
Feature: Evaluation periods

  Scenario: Recording a period's dates aligned with the calendar
    Given a school instantiating the national template for school year 2026-2027
    When the director records semester 1's dates as September 7, 2026 to January 24, 2027
    Then semester 1's dates are stored as entered

  Scenario: Overlapping periods refused
    Given a school instantiating the national template for school year 2026-2027
    And semester 1 already dated September 7, 2026 to January 24, 2027
    When the director enters semester 2 starting on January 20, 2027 through July 4, 2027
    Then the entry is refused with the overlap reason
    And semester 1's original dates are preserved

  Scenario: Adding a dated sub-period within an evaluation period
    Given a school instantiating the national template for school year 2026-2027
    And semester 1 already dated September 7, 2026 to January 24, 2027
    When the director adds a mock exam sub-period from December 15, 2026 to December 18, 2026
    Then the sub-period appears within semester 1
