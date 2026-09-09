@REQ-ZS-523 @INT-ZS-011 @v1
Feature: Paying an installment via a Fatourati channel

  Scenario: Payment confirmed at a cash agent
    Given a March installment of 800 MAD with an active Fatourati reference for enrollment E-123
    When Fatourati confirms payment of the reference for an amount of 800 MAD
    Then a Fatourati payment of 800 MAD is created and allocated to the installment
    And a receipt is issued, the parent is notified, and the financial account balance is updated

  Scenario: Confirmed amount differs from the amount due
    Given a confirmation carrying an amount lower than the reference's amount due
    When the confirmation is received
    Then the payment is recorded at the amount actually paid, flagged as a discrepancy at the front desk, and the installment remains partially unpaid

  Scenario: Real-time lookup unavailable
    Given a ZSchool lookup-endpoint outage during a maintenance window
    When a parent enters their reference in their banking app
    Then Fatourati serves the amount due from the state of bills deposited the previous night
    And the payment is received by ZSchool upon recovery and reconciled with the "to reconcile" flag
