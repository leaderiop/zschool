@REQ-ZS-056 @BEH-ZS-054 @mvp
Feature: Evaluation periods

  Scenario: A bilingual school on terms with Massar mapping
    Given a bilingual section configured with three terms for 2026-2027
    When the director records the terms' dates
    Then the three periods are created with statuses and aligned with the annual calendar
    And the mapping table to Massar semesters is offered with a default value, editable

  Scenario: Overlapping periods refused
    Given semester 1 ending on January 24, 2027
    When the director enters semester 2 starting on January 20, 2027
    Then the entry is refused with the overlap reason
