@REQ-ZS-059 @BEH-ZS-058 @mvp
Feature: Teacher assignment

  Scenario: Permissions derive from assignments
    Given Khadija, active affiliation, assigned to math for 2AC-1 and 2AC-3
    When she opens her student list
    Then she sees only students from 2AC-1 and 2AC-3, and no student from any other class

  Scenario: Orphaned courses after a scheduled affiliation closure
    Given an affiliation whose end is scheduled for January 31
    When the director reviews assignments on January 15
    Then this teacher's courses are listed "to reassign before January 31" with suggested replacements
    And on the end date, any unreassigned course is flagged orphaned

  Scenario: Only one active homeroom teacher per class
    Given a class with an appointed homeroom teacher
    When the director appoints another teacher assigned to the class
    Then the previous appointment is closed and logged, and the new one is visible to parents and students
