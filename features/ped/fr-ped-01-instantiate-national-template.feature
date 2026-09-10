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
    And no preschool cycle is created, since the school is not authorized for it

  Scenario: A template unavailable for the authorized cycles is refused
    Given a school authorized only for preschool and primary
    When the director attempts to instantiate an upper-secondary-only section
    Then the wizard flags the mismatch with the school's authorized cycles
    And no section is created

  Scenario: Upper-secondary levels receive the standard track list
    Given a school authorized for upper secondary and instantiating the national template
    When the instantiation completes for school year 2026-2027
    Then 1st Bac and 2nd Bac each carry the 12 standard tracks, from Mathematical Sciences A to the International Option in Spanish
    And a track's subject coefficients are configured independently of every other track at the same level

  Scenario: Grading defaults to out of 20
    Given a school instantiating the national template for school year 2026-2027
    When the instantiation completes
    Then the section's grading scale defaults to a maximum score of 20
    And the default is editable afterward without affecting already-recorded grades

  Scenario: Renaming an instantiated level never breaks its existing links
    Given a school that instantiated the national template for school year 2026-2027
    When the director renames level "2AC" to "Collège 2ème année"
    Then the subject-level configurations already created for "2AC" still resolve to it by id
    And the renamed level's coefficients are unchanged

  Scenario: Every created row carries its school_id, backed by an RLS policy on every table
    Given two schools, each instantiating the national template for school year 2026-2027
    When both instantiations complete
    Then each school's academic years, sections, cycles, levels, and subjects carry only that school's school_id
    And every tenant-scoped table created by the migration has a tenant_isolation row-level-security policy keyed on school_id
