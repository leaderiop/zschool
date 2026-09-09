@REQ-ZS-321 @JNY-ZS-042 @mvp
Feature: The multi-school context switcher

  Scenario: Switching between two schools with data isolation (MVP)
    Given Khadija signed in in the "School A — teacher" context
    And assessments entered the same day for her School A courses
    When she switches to the "School B — teacher" context
    Then no assessment, student, or message from School A is visible
    And only courses from her active School B assignments are offered

  Scenario: Immediate removal of a closed context (MVP)
    Given an active affiliation of Khadija to School A
    When School A closes her affiliation
    Then the "School A — teacher" context disappears from the switcher at the next server request
    And any attempt to access School A's data is refused server-side
    And the grades Khadija entered stay at School A, attributed to their author (INV-ZS-071)
