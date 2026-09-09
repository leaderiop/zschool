@REQ-ZS-104 @BEH-ZS-116 @mvp @v1
Feature: Compliance check with the national reference framework before closing
  Scenario: Warning without blocking (MVP)
    Given a 2AC class in semester 1 whose "Mathematics" subject has only one class test
    When the director opens the closing screen
    Then the subjects x classes table flags the gap
    And closing remains possible and proceeds with the warning listed in the summary

  Scenario: Closing blocked on non-compliance with the national reference framework (V1)
    Given a 2AC class in semester 1 of the 2026-2027 school year
    And the "Mathematics" subject has only one class test and no unified exam
    When the director starts the semester-1 closing for this class
    Then closing is refused and a compliance report lists the gaps subject by subject
    And no grade for the period is locked

  Scenario: Justified waiver by the school leadership (V1)
    Given a class partially non-compliant with the national reference framework
    When the director records a justified waiver
    Then closing is authorized despite the remaining gaps
    And the waiver is logged with author, reason and timestamp
