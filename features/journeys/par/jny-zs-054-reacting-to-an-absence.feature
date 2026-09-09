@REQ-ZS-339 @JNY-ZS-054 @mvp
Feature: A parent excusing an absence

  Scenario: A standard excuse with an attachment (MVP)
    Given Sara's absence recorded by roll call validated at 8:05 a.m. and notified at 8:09 a.m.
    When Ahmed receives the absence notification and submits a reason with the medical certificate photo
    Then the excuse is at "submitted" status within seconds of sending
    And School A's student life sees it in its processing queue
    And Ahmed receives the final status (validated or refused) with the decision's timestamp

  Scenario: A single immediate notification per day (MVP)
    Given Sara absent at the 8 a.m., 10 a.m., and 2 p.m. sessions
    When all three roll calls are validated
    Then Ahmed receives an immediate notification for the 8 a.m. session only
    And an evening summary lists all three absences

  Scenario: A half-day summary in preschool (MVP)
    Given Adam absent at the 8:30 a.m. session of School B's senior kindergarten
    When the roll call is validated
    Then Ahmed receives the half-day summary at the time School B configured, with no immediate notification

  Scenario: Submitting in a low-connectivity area (MVP)
    Given Ahmed offline at the moment of submission
    When he validates his excuse
    Then the reason and attachment are kept locally with the status "awaiting send"
    And the send happens automatically when the connection returns, with no re-entry
