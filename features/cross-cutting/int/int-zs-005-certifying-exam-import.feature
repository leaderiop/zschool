@REQ-ZS-522 @INT-ZS-005 @v1
Feature: Importing certifying-exam results

  Scenario: 3AC results imported
    Given an official results file covering students identified by their Massar code
    When the registrar's office imports the file
    Then each grade is attached to the matching enrollment, marked as originating from the ministry, with an import date
    And unmatched students appear in an exceptions report with no impact on the other rows

  Scenario: Unknown Massar code
    Given a row in the file carrying a Massar code absent from the school
    When the import runs
    Then the row is rejected in the error report and no grade is created for that row
