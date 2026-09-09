@REQ-ZS-554 @CNF-ZS-015 @mvp
Feature: Blocking a mid-year increase

  Scenario: An attempt to raise an active student's rate
    Given an ACTIVE enrollment whose rate captured at activation is 800 MAD per month
    When a user raises that enrollment's monthly fee to 900 MAD
    Then the operation is refused with a message explaining the ban on mid-year increases (Law 59.21)
    And no pricing entry is recorded
    And the attempt is logged

  Scenario: Correcting a clerical error
    Given a confirmed data-entry error on an active enrollment's payment plan
    When the principal's office applies the correction via the audited procedure
    Then the reason, author, and approval are recorded
    And installments already paid are not modified
