@REQ-ZS-099 @BEH-ZS-111 @mvp
Feature: Assessment types (MVP)
  Scenario: Creating a test within the teacher's scope
    Given the middle-school-cycle library with the "class test" type out of 20, weighting 1
    When Khadija creates an assessment of this type for her math course in 2AC-3 in semester 1
    Then the assessment is linked to the subject, the class, the period and her course
    And it does not appear in other teachers' courses
  Scenario: Local unified exam entered as an internal assessment
    Given the "unified school exam" type from the library
    When the school leadership creates the end-of-semester-1 unified exam for 3AC classes
    Then grades are entered via BEH-ZS-113 and no re-entry is offered on the external-exam screen
