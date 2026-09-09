@REQ-ZS-033 @BEH-ZS-030 @mvp
Feature: Shared identity correction

  Scenario: Correction notified to other schools
    Given a student enrolled at School A with an active enrollment also at School B
    When School A's front office corrects the Arabic spelling of the student's name
    Then the correction is logged with author, before and after values, and reason
    And School B and the guardians receive the correction notification
    And the corrected identity is identical as seen from both schools
