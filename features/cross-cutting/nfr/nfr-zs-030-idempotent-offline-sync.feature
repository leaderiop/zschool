@REQ-ZS-455 @NFR-ZS-030 @mvp
Feature: Syncing offline entries

  Scenario: Attendance taken with no network, then synced
    Given a teacher who marked 28 present and 4 absent during a network outage
    And a local timestamp of 08:40 for each check-in
    When the network returns
    Then all 32 check-ins are transmitted automatically without duplication or loss
    And each check-in's timestamp is stored in UTC, corresponding to 08:40 Casablanca time
    And the sync report shows 32 operations accepted

  Scenario: Extended outage with the app closed
    Given attendance two-thirds taken before the battery dies
    When the teacher reopens the app with network access
    Then the attendance sheet is restored to its exact state
    And syncing continues without re-entry
