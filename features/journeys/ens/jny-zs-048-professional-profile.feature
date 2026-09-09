@REQ-ZS-326 @JNY-ZS-048 @v1
Feature: The teacher's professional profile

  Scenario: A verified period and declared experience (V1)
    Given an active affiliation of Khadija to School A since September 2026
    And declared experience at a school not on ZSchool
    When School A's leadership views Khadija's shared profile
    Then the 2026 affiliation period appears "verified"
    And the declared experience appears "unverified" (ADR-ZS-033)
    And no rating of Khadija from School A is visible from another school

  Scenario: History kept after closing (V1)
    Given Khadija's affiliation to School A closed in June 2027
    When Khadija views her profile
    Then the 2026-2027 period stays shown "verified"
    And Khadija's access to School A's operational data is removed (INV-ZS-071)
