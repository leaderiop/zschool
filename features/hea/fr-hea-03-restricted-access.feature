@REQ-ZS-243 @BEH-ZS-303 @v2
Feature: Restricted access to the health record

  Scenario: A course teacher does not see the record
    Given a teacher assigned to the math course of class 2AC-3
    And a 2AC-3 student whose health record is complete
    When the teacher opens the class's student list
    Then no health section and no alert badge appears
    And any direct attempt to access the record by URL is refused

  Scenario: The front office stays out of scope
    Given a front-office staff member enrolling a new student
    When she completes the student's identity file
    Then the health record appears neither in the file nor in enrollment screens
    And she cannot delegate its entry to any role other than the nurse or the parent
