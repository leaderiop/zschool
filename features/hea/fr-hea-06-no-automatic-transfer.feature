@REQ-ZS-246 @BEH-ZS-306 @v2
Feature: No automatic transfer of the health record

  Scenario: An inter-ZSchool-school transfer with no health data
    Given a 3AC student whose health record is complete at the origin school
    And a transfer validated to another ZSchool school with the default transfer profile
    When the destination school opens the student's file
    Then it sees the identity, Massar code, school history, and shared official documents
    And it sees no health section, no alert, and no medical document
    And its local health record is empty and awaits the legal guardians' consent

  Scenario: An exceptional voluntary share only on consent
    Given a legal guardian wishing to send the record to a non-ZSchool school
    When they request the share from their account
    Then the system requires an express, separate consent with scope, duration, and recipient
    And the share is logged and revocable
    And absent that consent, no health content is included in the exit package
