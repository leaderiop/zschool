@REQ-ZS-116 @BEH-ZS-129 @mvp
Feature: Progressive publication of grades (MVP)
  Scenario: Publishing a test as it happens
    Given a school that has enabled progressive publication for class tests
    And a test whose grades are all entered as drafts
    When the teacher publishes the assessment
    Then the grades move to "published" status and become visible to guardians and the student
    And a grouped daily notification is sent to guardians
    And the period average remains invisible until the date set by the school

  Scenario: School without progressive publication
    Given a school keeping the default setting
    When a teacher finishes entering a test
    Then no grade is visible to families before the report card is published
