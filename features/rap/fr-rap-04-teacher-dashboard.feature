@REQ-ZS-216 @BEH-ZS-244 @mvp
Feature: Teacher dashboard and least privilege

  Scenario: A teacher sees only their courses
    Given a math teacher assigned to the 2AC-3 and 2AC-4 courses
    And a 2AC-3 attendance check not yet validated today and a 2AC-4 "quiz 1" assessment created with no grades
    And a 2AC-4 overall average available after closure
    When the teacher opens her dashboard
    Then she sees only 2AC-3 and 2AC-4 among today's classes
    And her pending entries list the 2AC-3 attendance check and the 2AC-4 "quiz 1" assessment with their age
    And the averages shown are limited to the math subject in her two classes
    And she cannot access 2AC-4's overall average, nor any student's unpaid balances or incidents
