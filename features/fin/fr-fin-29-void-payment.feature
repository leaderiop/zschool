@REQ-ZS-151 @BEH-ZS-179 @mvp
Feature: Voiding a payment

  Scenario: A receipt issued for the wrong student
    Given a 1,200-DH payment confirmed the same day against Youssef's October installment, receipt 2026-0418
    And the payment actually concerned Sara
    When Fatima voids the payment with the reason "wrong student"
    Then a reversing entry is recorded and a void receipt 2026-0419 references receipt 2026-0418
    And Youssef's October installment reverts to "due" and Ahmed's balance is recomputed
    And Ahmed is notified of the voiding and receipt 2026-0418 is flagged "voided" in his space

  Scenario: Voiding outside the day it was entered
    Given a payment confirmed three days earlier
    When the front desk requests it be voided
    Then the voiding stays pending until the school leadership approves it, with the reason and author traced
