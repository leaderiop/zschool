@REQ-ZS-057 @BEH-ZS-055 @mvp
Feature: Grading scales and computation rules

  Scenario: Default national weightings versioned
    Given year 2026-2027 instantiated on the national template
    When the director opens the certifying-exam weightings
    Then the default values 6AP 50/25/25, 3AC 30/30/40, and Baccalaureate 25/25/50 are pre-filled with their textual reference
    And a change creates a dated version for the year, with the previous one still viewable

  Scenario: An invalid weighting is refused
    Given year 2026-2027 instantiated on the national template
    When the director attempts to set 6AP's weighting to 50/25/30
    Then the change is refused since the weights do not sum to 100
    And the previous weighting is unchanged

  Scenario: Editing the grading scale
    Given year 2026-2027 instantiated on the national template
    When the director changes the grading scale to a maximum score of 100
    Then the section's grading scale reflects the new maximum score
