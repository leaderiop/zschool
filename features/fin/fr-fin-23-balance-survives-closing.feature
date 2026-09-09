@REQ-ZS-147 @BEH-ZS-173 @mvp
Feature: Balance surviving the enrollment's closing

  Scenario: Settlement after departure
    Given a student whose enrollment moved to TRANSFERRED status with 1,500 DH still due
    When accounting records a 1,500-DH bank transfer against this closed enrollment's account
    Then the payment is accepted with no new enrollment created
    And the balance drops to zero (account settled) with a numbered receipt
    And the file leaves the unpaid-balances table and the operation is logged
