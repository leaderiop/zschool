@REQ-ZS-213 @BEH-ZS-241 @mvp
Feature: Leadership dashboard

  Scenario: Opening the dashboard at the start of the day
    Given a principal authenticated in their school's context for the 2026-2027 year
    And 247 ACTIVE enrollments spread over 12 classes, of which 4 students absent today after attendance checks were validated
    And 31 students with at least one overdue installment for a total outstanding of 46,500 MAD
    When the principal opens the school's dashboard
    Then the headcount shown is 247, broken down by level and by class
    And today's attendance rate is computed over expected sessions with a validated attendance check and shown with detail of the 4 absent students
    And the outstanding amount shown is 46,500 MAD for 31 students, broken down by class and by guardian
    And each indicator links to its corresponding detailed list without re-entering a filter
