@REQ-ZS-079 @BEH-ZS-086 @mvp
Feature: Notification configuration (MVP)

  Scenario: Quiet hours have no effect on absences
    Given quiet hours configured from 8pm to 8am, and a 7:50am roll call confirmed with one absence
    When the confirmation is received server-side
    Then the absence notification goes out within 5 minutes despite quiet hours
    And an announcement published at 9pm is deferred to the next day at 8am

  Scenario: Half-day grouping in preschool
    Given the preschool cycle configured for half-day summaries
    When a senior-preschool child is marked absent at 8:30am
    Then no immediate notification is sent, and the absence appears in the end-of-morning summary
