@REQ-ZS-058 @BEH-ZS-057 @mvp
Feature: Cloning the academic structure from N to N+1

  Scenario: Full year cloning
    Given school year 2026-2027 structured (3 cycles, 12 levels, 24 classes, subjects configured)
    And year 2027-2028 not existing
    When the director launches cloning from 2026-2027 to 2027-2028
    Then year 2027-2028 is created in "preparation" status
    And sections, cycles, levels, tracks, classes, groups, subjects, coefficients, grading scales, and template periods are copied identically
    And no student and no enrollment is copied
    And no teacher assignment and no timetable is copied
    And a cloning report is shown with the details of the copied elements

  Scenario: Target year already exists
    Given a year 2027-2028 already created in preparation
    When the director attempts a second cloning into 2027-2028
    Then the operation is refused and the system offers either to cancel or to compare the two structures without overwriting
