@REQ-ZS-046 @BEH-ZS-044 @mvp
Feature: Departures (MVP)

  Scenario: Mid-year departure with no destination
    Given an ACTIVE enrollment whose family declares a departure on March 15 with no known destination
    When the front office closes the enrollment WITHDRAWN with a reason and date
    Then the leaving file is prepared (leaving certificate, account statement to the financial guardian)
    And the financial account remains open until settled

  Scenario: Departure for the following school year (wave 2)
    Given a student promoted at year end whose family declares they will not return
    When the rollover is executed
    Then the enrollment moves to COMPLETED with the decision "promoted" and no N+1 enrollment is created
    And the student appears in the year-end departures list with their leaving file prepared
