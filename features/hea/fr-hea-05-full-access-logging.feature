@REQ-ZS-245 @BEH-ZS-305 @v2
Feature: Logging health-data access

  Scenario: A nurse's access is logged
    Given a nurse affiliated with the school holding the nurse role
    And a 6AP student whose health record is complete
    When the nurse opens that student's health record
    Then a log entry records her identity, role, the student, the action "view", and the timestamp
    And the entry is visible to leadership in the health-access log
    And no change to the entry is possible, an immutable log

  Scenario: Printing an emergency summary is tracked
    Given an allergic reaction during a school outing
    When the nurse prints the student's emergency summary sheet
    Then a log entry records the printing with the author, the student, and the timestamp
    And the entry states the type of document produced
