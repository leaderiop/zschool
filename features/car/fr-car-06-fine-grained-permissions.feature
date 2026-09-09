@REQ-ZS-199 @BEH-ZS-226 @mvp
Feature: Fine-grained permissions carried by the affiliation (MVP)

  Scenario: A role template changed without affecting other affiliations
    Given the "supervisor" role template limited to the middle-school cycle for one affiliation
    When leadership extends this role to the upper-secondary cycle for that one affiliation
    Then the person sees students of both cycles as soon as the change is made
    And other affiliations carrying the "supervisor" role template stay unchanged
    And the change is logged with author and timestamp

  Scenario: A teacher's rights derive from their courses
    Given a "teacher" affiliation with no active course assignment
    When the teacher opens the student list
    Then no class is visible until at least one course assignment exists
