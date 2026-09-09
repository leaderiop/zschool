@REQ-ZS-152 @BEH-ZS-180 @mvp
Feature: Family payment

  Scenario: One payment for two children
    Given Ahmed, financial guardian of Youssef (October installment 1,200 DH) and Sara (October installment 1,000 DH) at School A
    When Fatima collects 2,200 DH in cash, selecting both children
    Then a single payment is recorded, split 1,200 DH to Youssef's account and 1,000 DH to Sara's
    And a single numbered receipt lists both children and both settled installments
    And the unpaid-balances table no longer shows any October installment for Ahmed

  Scenario: Split partial payment
    Given the same installments and a payment of 1,500 DH
    When automatic splitting is applied with the "oldest first, then by child" order
    Then Youssef's installment is settled and Sara's moves to "partially paid" with 700 DH remaining due
    And the single receipt details the split
