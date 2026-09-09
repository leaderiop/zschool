@REQ-ZS-057 @BEH-ZS-055 @mvp
Feature: Grading scales and computation rules

  Scenario: Default national weightings versioned
    Given year 2026-2027 instantiated on the national template
    When the director opens the certifying-exam weightings
    Then the default values 6AP 50/25/25, 3AC 30/30/40, and Baccalaureate 25/25/50 are pre-filled with their textual reference
    And a change creates a dated version for the year, with the previous one still viewable
