@REQ-ZS-053 @BEH-ZS-051 @mvp
Feature: Instantiating the national structure template

  Scenario: A school instantiates the national template for the 2026-2027 school year
    Given a newly onboarded school with no academic structure
    And whose authorized cycles are primary, middle school, and upper secondary
    When the director launches the instantiation wizard and chooses the "Moroccan national" template
    And confirms school year 2026-2027
    Then sections, cycles, and levels 1AP through 2nd Bac are created per the template
    And the default evaluation periods are two semesters
    And usual subjects are created with default ministry coefficients, editable
    And no class yet contains any student

  Scenario: A template unavailable for the authorized cycles is refused
    Given a school authorized only for preschool and primary
    When the director attempts to instantiate an upper-secondary-only section
    Then the wizard flags the mismatch with the school's authorized cycles
    And no section is created
