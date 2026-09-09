@REQ-ZS-186 @BEH-ZS-206 @mvp
Feature: Transfer closure and destination enrollment
  Scenario: Mid-year transfer on the same identity (MVP)
    Given an ACTIVE enrollment at "School A" and a file "accepted by the destination" with an immediate effective date
    And a destination enrollment PRE-ENROLLED at "School B" with a complete file and the initial payment collected
    When "School B" activates the destination enrollment
    Then, in the same transaction, the origin enrollment moves to status TRANSFERRED with reason, date, and destination
    And the destination enrollment moves to ACTIVE on the same Person, with no new identity
    And the (student, year) pair holds only one ACTIVE enrollment, at "School B"

  Scenario: Failed activation without effect on the origin (MVP)
    Given the same file and a destination enrollment whose financial guardian is not filled in
    When "School B" attempts activation
    Then activation is refused and the origin enrollment stays ACTIVE with no change
    And the student still appears on "School A"'s attendance lists

  Scenario: Departure at the following school year's start closed as COMPLETED (MVP, wave 2)
    Given a validated file with an effective date of "following school year's start" for a 6th-grade primary student at "School A"
    When "School A" runs the year-end rollover
    Then the year-N enrollment moves to COMPLETED with the decision "promoted to the next level"
    And no year-N+1 enrollment is created at "School A" for that student
    And "School B" holds the file to create the year-N+1 enrollment on the same Person
