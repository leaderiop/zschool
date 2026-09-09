@REQ-ZS-060 @BEH-ZS-059 @mvp
Feature: Building courses

  Scenario: Generating a class's courses
    Given class 1AC-2 and eight subjects configured for level 1AC, one of them optional
    When the director generates the class's courses
    Then seven mandatory courses are created, and the optional course is created only if the option is selected for the class
    And a course deactivated with a reason no longer appears in assignments or in expected sessions
