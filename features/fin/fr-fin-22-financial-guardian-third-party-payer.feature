@REQ-ZS-146 @BEH-ZS-172 @mvp
Feature: Financial guardian, multi-payer split and third-party payer

  Scenario: Grandfather as third-party payer
    Given Lina's enrollment, whose legal guardian is the father and whose custodial parent is Naïma
    When the front desk registers the grandfather as third-party payer
    Then a "third-party payer" relationship carrying only the "financial guardian" status is created
    And the grandfather receives receipts and reminders but sees no grades, absences or documents

  Scenario: Split between two payers
    Given a 1,200-DH installment split 50/50 between the father and the mother
    When the father pays 600 DH
    Then his share is settled, the mother's stays due, and each payer receives their own receipt
