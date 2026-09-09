@REQ-ZS-063 @BEH-ZS-063 @v1
Feature: Switching to the reduced-hours Ramadan variant

  Scenario: Scheduling then executing the switch
    Given a "normal" variant active for 2026-2027
    And a "reduced-hours Ramadan" variant built, valid from 08/02/2027 to 09/03/2027 "to confirm"
    When the director schedules the switch for 08/02/2027
    Then the system confirms the schedule and shows it as the next planned variant
    And on the planned date, the "reduced-hours Ramadan" variant becomes active for all profiles
    And students, parents, teachers, and student life receive a bilingual notification with the new schedule
    And the variant history allows viewing past schedules

  Scenario: Changing a scheduled switch
    Given a Ramadan switch scheduled for 08/02/2027
    When the director moves the validity window after the Habous (Ministry of Islamic Affairs) official announcement
    Then the schedule is updated and logged
    And no notification is sent before the new date
