@REQ-ZS-278 @JNY-ZS-004 @mvp @v1
Feature: Multi-site collections

  Scenario: Automatic graduated reminder on an unpaid installment (MVP)
    Given a payment-schedule installment unpaid for 7 days with a reminder tier set at D+7 by SMS
    When the tier date is reached
    Then a bilingual reminder is sent to the financially responsible parent on the configured channel
    And the reminder is logged with channel, status, and cost
    And the site's aged balance and the group's consolidated view show the account as reminded

  Scenario: Issuing a certificate despite arrears (MVP)
    Given a student record showing arrears displayed as an alert
    When the secretary generates the enrollment certificate requested by the parent
    Then the document is generated with no blocking
    And the arrears alert is visible on the record and the account statement is offered to the financially responsible parent
    And the request and the issuance are historized

  Scenario: Daily reconciliation of Fatourati payments (V1)
    Given receivables generated on the Fatourati rail for several enrollments across the three sites
    When parents pay through their banking channels and a daily reconciliation runs
    Then each payment is reconciled against its receivable with no duplicate
    And a receipt is issued and the account balance is updated
    And ZSchool has held no funds
