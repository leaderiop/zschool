@REQ-ZS-525 @INT-ZS-014 @v2
Feature: Automatic payment of an installment by registered card

  Scenario: Successful debit
    Given an active recurring-payment mandate linked to an enrollment's financial guardian
    And an 800 MAD installment due today
    When the payment request is sent to the acquirer and confirmed
    Then an 800 MAD card payment is created, allocated to the installment, with a receipt and a notification to the parent

  Scenario: Debit declined by the issuer
    Given a payment request declined by the card issuer
    When the decline is received
    Then no payment is created, the installment remains unpaid, and the existing graduated reminder applies with the failure reason logged
