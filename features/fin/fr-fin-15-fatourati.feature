@REQ-ZS-142 @BEH-ZS-165 @v1
Feature: Reconciled Fatourati online payment

  Scenario: Settling a receivable through a banking channel
    Given a 1,200-DH receivable exposed on Fatourati with school reference R-2026-0142
    When the parent pays 1,200 DH from their banking app
    And Fatourati confirms the payment to ZSchool
    Then the payment is automatically recorded with the Fatourati reference
    And it is matched against the receivable, which moves to settled and stops being exposed
    And a receipt is issued and sent to the financial guardian
    And the PaymentReceived event is logged

  Scenario: Rejecting duplicates at daily reconciliation
    Given a Fatourati confirmation already recorded (same transaction reference)
    When the daily reconciliation file contains this confirmation again
    Then the duplicate is rejected and logged
    And no second payment or second receipt is created

  Scenario: Reconciliation discrepancy
    Given a settlement present in the reconciliation file with no prior confirmation recorded
    Then the discrepancy appears in the reconciliation list to process
    And the accountant can match it manually with a reason, the operation staying logged
