@REQ-ZS-064 @BEH-ZS-066 @mvp
Feature: Annual calendar

  Scenario: Confirming a movable holiday
    Given Eid al-Fitr preloaded "to confirm" for 03/20/2027
    When ZSchool confirms the date as 03/21/2027 after the official announcement
    Then class days are recalculated, no expected session is generated on 03/21/2027, and the school is notified

  Scenario: No roll call on a public holiday
    Given 11/06/2026 marked as a holiday
    When student life reviews expected sessions for that day
    Then no expected session is listed
