@REQ-ZS-215 @BEH-ZS-243 @v1
Feature: Today's student-life dashboard

  Scenario: Tracking absences after morning checks
    Given a head supervisor assigned to the middle-school and upper-secondary cycles
    And the 8 a.m. class of 2AC-3 validated with 2 unjustified absences and 1 tardiness
    And class 1AC-1 whose 8 a.m. attendance has not yet been taken
    When the supervisor opens today's student-life dashboard
    Then 2AC-3's 2 absent students appear with status "unjustified" and the family-notification state
    And 2AC-3's tardiness appears in today's tardiness list
    And class 1AC-1 appears with the note "attendance pending", not among the absences
    And no class from the pre-school cycle is visible, that cycle not being assigned to the supervisor
