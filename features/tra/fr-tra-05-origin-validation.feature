@REQ-ZS-185 @BEH-ZS-205 @mvp
Feature: Transfer validation by the origin school
  Scenario: Validation with an unpaid balance not blocking
    Given a transfer file with status "consent recorded"
    And a nonzero financial balance of 1,200 MAD on the enrollment's account
    When the leadership reviews the situation, hands the account statement to the financial guardian, and completes the checklist
    Then the file moves to status "validated by the origin"
    And the leaving certificate is generated and available to the legal tutor
    And the receivable stays tracked by the origin school until settled

  Scenario: Missing equipment recorded without delaying the departure
    Given a textbook not returned at the time of validation
    When leadership closes the return checklist
    Then the missing item is recorded in the time-stamped checklist
    And the transfer is not blocked by this missing item
