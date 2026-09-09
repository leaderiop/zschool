@REQ-ZS-520 @INT-ZS-002 @mvp
Feature: Massar export of continuous-assessment grades

  Scenario: Exporting one subject for one class for the first semester
    Given a 3AC class whose math entries are all validated and the period is closed
    When the principal's office requests the Massar export for that subject, class, and semester
    Then an Excel file is generated with the current Massar template's structure, grades out of 20 with decimals, and identities in dual script
    And the file is logged as a regulatory data export with author, date, and scope

  Scenario: Period not closed
    Given an assessment period not closed for the targeted class
    When the principal's office requests the Massar export
    Then the system refuses to generate the file and lists the missing or unvalidated entries by subject
