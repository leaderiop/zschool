@REQ-ZS-341 @JNY-ZS-056 @v1
Feature: Paying a monthly installment via Fatourati

  Scenario: A payment at a cash agent with a status received (V1)
    Given Youssef's October installment at "due" status at School A
    When Ahmed gets the creditor reference and QR code from his app
    And he goes to a cash agent, enters the reference, and pays the amount confirmed in real time
    Then the payment is confirmed by the Fatourati network and recorded by the platform as a PaymentReceived event
    And the covered installments move to "paid" status and the balance is updated
    And Ahmed receives a bilingual notification confirming the payment's status with the receipt accessible
    And the funds are credited to School A, with ZSchool having held no funds

  Scenario: A duplicate payment attempt rejected (V1)
    Given Youssef's October installment already paid the same day
    When a second payment attempt is made with the same reference
    Then the payment is rejected as a duplicate per Fatourati reconciliation
    And the installment's balance stays unchanged and no double entry is created

  Scenario: Creditor isolation between schools (V1)
    Given Adam enrolled at School B with an overdue installment
    When Ahmed pays Youssef's installment at School A
    Then School B's balance stays unchanged
    And each school sees only its own receivables
