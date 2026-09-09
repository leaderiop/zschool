@REQ-ZS-101 @BEH-ZS-113 @mvp
Feature: Draft grade entry (MVP)
  Scenario: Mobile entry of a test with markers
    Given Khadija, a math teacher assigned to the course of class 2AC-3 at School A
    And a class test out of 20 created for semester 1
    When she enters 14.5 for Youssef, the "absent" marker for one student and "exempted" for another
    Then each grade is saved as a draft with author, timestamp and context, linked to the student's enrollment
    And none of these values is visible to families or other teachers
    And the subject's provisional average is recomputed per BEH-ZS-117

  Scenario: Entry refused outside scope
    Given a teacher with no assignment to the physics course of class 2AC-3
    When she attempts to open the entry grid for that course
    Then access is denied (INV-ZS-091, INV-ZS-011) and the attempt is logged
