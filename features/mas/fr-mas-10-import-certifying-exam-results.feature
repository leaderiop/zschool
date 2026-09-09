@REQ-ZS-232 @BEH-ZS-270 @v1
Feature: Importing national baccalaureate results

  Scenario: Nominal import with a Massar-code match
    Given a 2026-2027 national baccalaureate results file deposited by leadership
    And every row carrying a Massar code matching an enrolled 2nd-year student
    When leadership runs the wizard and confirms the match preview
    Then each grade is recorded read-only, attached to the enrollment, marked "ministry" with the session
    And the summary shows the number of rows attached, arbitrated, and rejected
    And the operation is logged in the import log with the file's fingerprint

  Scenario: An ambiguous match placed in arbitration
    Given a row with no Massar code whose name, first name, and date of birth match two namesakes
    When the wizard completes the matching
    Then the row is placed in the arbitration queue with no automatic attachment
    And leadership picks the correct student or rejects the row, the choice being logged

  Scenario: An unreadable file rejected with no effect
    Given a file whose columns cannot be matched to the expected template at all
    When leadership launches the import
    Then the wizard fails with a readable error report
    And no grade is changed and no row is imported

  Scenario: Updating the year-end decision after the rollover
    Given a 2nd-year baccalaureate student whose enrollment has been COMPLETED since the June 25 rollover with the decision "undetermined"
    When leadership imports the national baccalaureate results on July 12, where she appears as passed
    Then the year-end decision moves to "graduated" during the grace period, with the import logged as the source
    And no additional audited procedure is required
