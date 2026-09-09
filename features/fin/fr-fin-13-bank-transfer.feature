@REQ-ZS-141 @BEH-ZS-163 @mvp
Feature: Collection by bank transfer

  Scenario: Manually reconciled transfer
    Given a 1,200-DH transfer received with the reference "YOUSSEF OCT" into School A's account
    When accounting enters the transfer with its reference and value date and reconciles it against Youssef's October installment
    Then the installment moves to "paid" and a receipt is issued to the financial guardian

  Scenario: Transfer pending confirmation
    Given a transfer entered without validation
    When the unpaid-balances table is viewed
    Then the installment stays due and the transfer shows as "pending confirmation"
