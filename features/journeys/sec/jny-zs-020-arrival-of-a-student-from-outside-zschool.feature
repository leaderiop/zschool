@REQ-ZS-299 @JNY-ZS-020 @mvp
Feature: Arrival of a student from outside ZSchool

  Scenario: Enrollment with declared prior history (MVP)
    Given a 4AP student arriving from a school not on ZSchool with a paper leaving certificate
    When the secretary creates the enrollment and enters the previous school, the years, levels, and decisions, then attaches the photographed certificate
    Then the prior history appears on the student's record marked "declared, attachment provided"
    And no disciplinary or health data is entered
    And a future departure's default transfer profile carries these years and decisions with their declarative status
