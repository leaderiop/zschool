@REQ-ZS-060 @BEH-ZS-059 @mvp
Feature: Building courses

  Scenario: Generating a class's courses from its mandatory subjects
    Given a class under level 1AC with the national template's mandatory subjects configured
    When the director generates the class's courses
    Then one course exists for each mandatory subject at that level

  Scenario: Deactivating a course
    Given a class under level 1AC with its courses generated
    When the director deactivates one of its courses with a reason
    Then the course no longer appears among the class's active courses
