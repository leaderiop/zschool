@REQ-ZS-307 @JNY-ZS-033 @v1
Feature: Morning tardiness with an entry pass

  Scenario: a student late after roll-call validation (V1)
    Given the morning roll call for 3AC validated at 8:05 a.m.
    And a 3AC student arrives at the student-life office at 8:35 a.m. with no excuse
    When Rachid records the tardiness with the arrival time and stated reason
    Then a numbered, timestamped entry pass is issued and the student is authorized to join their class
    And the tardiness is linked to the student's enrollment and appears in the day's summary
    And the student's tardiness count is updated for thresholds and councils

  Scenario: an early departure handed to an authorized person (V1)
    Given an early-departure request for a Grade 6 student filed by his mother, holder of custody
    And the maternal grandmother is among the people authorized to pick up the student
    When Rachid verifies the identity of the person present and validates the departure
    Then a departure pass is issued with the departure time and the person picking up the student
    And the remaining time slots are recorded as an absence with the reason "early departure"
    And the legal guardians and the holder of custody are notified of the student's departure
