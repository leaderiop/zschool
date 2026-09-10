@REQ-ZS-064 @BEH-ZS-066 @mvp
Feature: Annual calendar

  Scenario: The ministry calendar is preloaded on year creation
    Given a school instantiating the national template for school year 2026-2027
    Then the fixed national holidays are preloaded, confirmed, with their correct dates
    And the published school breaks are preloaded, confirmed, with their documented dates
    And the movable religious holidays are preloaded "to_confirm" with no date yet

  Scenario: Confirming a movable holiday
    Given a school instantiating the national template for school year 2026-2027
    When ZSchool confirms Eid al-Fitr's date as March 21, 2027 after the official announcement
    Then Eid al-Fitr is recorded as confirmed for that date

  @skip
  Scenario: Confirming a movable holiday recalculates class days
    # Skipped: needs the attendance/expected-sessions capability
    # (BEH-ZS-070/071, VSC module) to exist before "no expected session is
    # generated" and "class days recalculated" mean anything — not part of
    # ticket #5's scope (school year, periods, and calendar).
    Given Eid al-Fitr preloaded "to confirm" for 03/20/2027
    When ZSchool confirms the date as 03/21/2027 after the official announcement
    Then class days are recalculated, no expected session is generated on 03/21/2027, and the school is notified

  @skip
  Scenario: No roll call on a public holiday
    # Skipped: same reason — expected sessions/roll call don't exist yet.
    Given 11/06/2026 marked as a holiday
    When student life reviews expected sessions for that day
    Then no expected session is listed
