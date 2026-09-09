@REQ-ZS-196 @BEH-ZS-223 @mvp
Feature: Simultaneous multi-affiliation of a part-time teacher across two schools

  Scenario: Two active affiliations in the same year
    Given a teacher whose affiliation with School A is "active" for the 2026-2027 year
    When she accepts School B's invitation for the same school year
    Then she holds two simultaneous "active" affiliations, with no error or conflict
    And each school sees only its own affiliation and its own dates

  Scenario: Switching context without losing entries
    Given a grade entry in progress in School A's context
    When the teacher switches to School B's context and back
    Then her School A entry is found exactly as she left it

  Scenario: Combining roles at a single school
    Given a person affiliated with School A
    When leadership adds a second "supervisor" role to their existing affiliation
    Then a single affiliation carries both roles and their combined permissions
