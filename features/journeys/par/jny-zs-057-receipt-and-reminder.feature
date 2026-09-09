@REQ-ZS-342 @JNY-ZS-057 @mvp @v1
Feature: Receipt and unpaid-fee reminder

  Scenario: A receipt after a front-desk payment (MVP)
    Given Adam's September installment paid in cash at School B's front desk
    When the secretary records the cash payment at the front desk
    Then a numbered bilingual receipt is generated and sent to Ahmed with the covered installments' detail
    And the receipt stays downloadable in the payment history

  Scenario: A graduated reminder then stopping after payment (MVP)
    Given Youssef's November installment unpaid for three days
    When the first reminder tier triggers
    Then Ahmed receives a bilingual message stating the amount due and how to pay
    And no official document is blocked despite the arrears, an informational alert only
    When Ahmed pays the installment at the front desk, or via Fatourati in V1
    Then reminders stop and payment confirmation is notified

  Scenario: A "STOP" opt-out limited to reminders (MVP)
    Given Ahmed having replied "STOP" to a reminder SMS
    When a new reminder and an absence notification are issued the same day
    Then the reminder is not sent by SMS
    And the absence notification is sent normally
