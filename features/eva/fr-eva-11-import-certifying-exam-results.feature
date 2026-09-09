@REQ-ZS-109 @BEH-ZS-121 @v1
Feature: Import of certifying-exam results
  Scenario: Invalid file rejected with no partial import
    Given a ministry results file for a 2nd-year baccalaureate class
    And three lines do not match any Massar code at the school
    When the import is run
    Then no result is written and the error report lists the rejected lines with a reason
    And the source file and the report are kept as audit records

  Scenario: Valid import logged and protected after closing
    Given a valid results file for 3AC candidates
    And the grades match the announced session and subjects
    When the import is confirmed
    Then each grade is linked to the student, subject and session with source "ministry" and the import's author
    And any later edit after closing requires the school leadership's logged unlock procedure
