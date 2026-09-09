@REQ-ZS-306 @JNY-ZS-032 @mvp
Feature: Handling the day's absentees

  Scenario: phone follow-up before 10 a.m. for unreached absentees (MVP)
    Given 2 unexcused absences notified at 8:12 a.m.
    And Student A's parent only receives the SMS fallback (no smartphone, no WhatsApp)
    And the SMS fallback is delivered with no reply
    When the day's processing queue is shown to Rachid
    Then Student A appears in the "to call back before 10 a.m." list with the primary contact number
    And after Rachid's call, the logged outcome (reached, still absent, or wrong number) is tracked with author and timestamp
    And a wrong number generates a correction flag to the secretariat

  Scenario: parental excuse then validation by student life (MVP)
    Given an absence recorded this morning for Omar, a Grade 8 student
    And his father, a legal guardian, has an active account
    When the father submits an excuse with a photo of the medical certificate from his account
    Then the absence moves to "excuse pending validation" and its status is visible to the parent
    And the excuse appears in student life's processing queue
    When Rachid reviews the attachment and validates the excuse
    Then the absence is marked excused with the decision's author and timestamp
    And the father is informed of the final status on his notification channel

  Scenario: an excuse recorded at the front desk on a parent's behalf with no account (MVP)
    Given an absence recorded yesterday for a Grade 7 student whose guardian has not claimed an account
    When the student hands Rachid a paper medical certificate
    Then Rachid records the excuse under the mother's name with the certificate photo and the note "recorded by the school"
    And the absence is marked excused with the author and timestamp
