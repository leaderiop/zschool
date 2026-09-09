@REQ-ZS-001 @BEH-ZS-283 @BEH-ZS-284 @v2
Feature: Boarding check-in and guardian notification

  Scenario: A student is checked in as boarded at their stop
    Given a route with 25 subscribers and an assigned bus monitor
    When the bus monitor checks the student in as boarded at the stop at 07:12
    Then the check-in is time-stamped and attributed to the bus monitor
    And the student's guardians receive the milestone notification on their active channels
    And the check-in stays viewable in the day's route history
