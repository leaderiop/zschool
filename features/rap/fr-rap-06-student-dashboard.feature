@REQ-ZS-218 @BEH-ZS-246 @mvp
Feature: Student dashboard

  Scenario: A middle-school student views their data on the family phone
    Given Youssef, 2AC at School A, whose personal access was activated by his father
    And a math grade published and an unjustified absence the day before
    When Youssef opens his dashboard in his own session
    Then he sees today's sessions, the published grade, and the absence with status "justification pending"
    And no other student's data, no financial data, and no unpublished class average are visible

  Scenario: Unpublished grades stay invisible
    Given a grade entered in draft by the teacher for Youssef
    When Youssef opens the "Results" tab
    Then the draft grade does not appear until the school publishes it
