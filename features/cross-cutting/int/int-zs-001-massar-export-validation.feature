@REQ-ZS-521 @INT-ZS-001 @mvp
Feature: Validating a Massar export

  Scenario: An out-of-range grade is detected
    Given a grade entry above the scale's maximum for a student in the class
    When the Massar export is requested
    Then generation is blocked and the error report identifies the student, the subject, and the value at issue

  Scenario: A compliant file
    Given a file passing every structure and value check
    When validation runs
    Then the report confirms compliance and the file is marked validated for submission
