@REQ-ZS-138 @BEH-ZS-160 @mvp
Feature: Front-desk payment collection

  Scenario: Cash with no cash session
    Given Youssef's October installment of 1,200 DH in "due" status
    When Fatima collects 1,200 DH in cash at the front desk
    Then the payment is recorded with method, amount, value date and collector, with no cash session required in MVP
    And the installment moves to "paid", the balance is updated and a numbered receipt is printed and sent to the financial guardian

  Scenario: Partial payment
    Given the same 1,200-DH installment
    When the guardian settles 700 DH by a confirmed bank transfer
    Then the installment moves to "partially paid" with 500 DH remaining due
    And the receipt states the remaining balance

  Scenario: Surplus carried as credit
    Given a guardian who pays 1,500 DH against a 1,200-DH installment
    When the payment is confirmed
    Then 300 DH are carried as a credit on the guardian's account, usable against the next installment or refundable (V1)
