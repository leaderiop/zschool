@REQ-ZS-311 @JNY-ZS-039 @mvp
Feature: A session not held

  Scenario: a teacher's absence declared in the morning (MVP)
    Given a math session expected at 10 a.m. for 2AC-3
    When Rachid declares the teacher absent for the day
    Then the 10 a.m. session moves to "not held" and disappears from expected roll calls
    And no missing-roll-call alert is issued for this session
    And 2AC-3's attendance rate for the day is computed without this session
