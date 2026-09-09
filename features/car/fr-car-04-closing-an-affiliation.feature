@REQ-ZS-197 @BEH-ZS-224 @mvp
Feature: Closing an affiliation

  Scenario: Immediate access removal
    Given a teacher "active" at School A, having entered grades and taken attendance
    When leadership closes their affiliation with immediate effect
    Then from closure on, the account can no longer access School A's classes, grades, attendance, or messages
    And their affiliations at other schools stay unchanged

  Scenario: Retention of attributed data
    Given grades and attendance produced by the teacher before their closure
    When leadership views this data after the closure
    Then it still appears in the school, attributed to its author
    And none of this data has been deleted or detached from its context

  Scenario: Closed period kept on the teacher's side (MVP)
    Given an affiliation closed covering the 2025-2026 year
    When the teacher views their "My affiliations" area
    Then the period appears with status "ended", with school, years, roles, and contract nature
    And, in V1, the same period is shown "verified" in their professional profile

  Scenario: Scheduled closure with course reassignment (MVP)
    Given a teacher "active" whose contract ends on January 31, 2027
    When leadership records a scheduled closure for January 31, 2027
    Then the affiliation stays "active" until that date with the note "closure scheduled"
    And their courses appear "to be reassigned before 01/31/2027" in the structure alerts
    And on February 1, 2027, closure executes and access is removed
