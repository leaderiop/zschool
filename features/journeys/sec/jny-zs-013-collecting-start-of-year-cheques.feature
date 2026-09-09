@REQ-ZS-292 @JNY-ZS-013 @mvp
Feature: Collecting start-of-year cheques

  Scenario: Handing over three cheques covering three monthly payments (MVP)
    Given an ACTIVE enrollment with September, October, and November installments due
    When the parent hands over three cheques of 800 MAD dated September 5, October 5, and November 5
    And the secretary records the series with bank, numbers, and dates
    Then each cheque is linked to its installment and moves to the HANDED-OVER state
    And an overall receipt listing the three cheques is printed and sent to the parent
    And no reminder is triggered on the covered installments before their date

  Scenario: A cheque bounces and is resolved (MVP)
    Given a cheque deposited at the bank covering the October installment
    When the bank notifies the bounce
    Then the cheque moves to the BOUNCED state with a reason and date
    And the October installment becomes unpaid again and triggers the graduated reminder cycle
    And when the secretary records a new payment for the same installment
    Then the cheque moves to the RESOLVED state with the new payment's reference
    And the full history of both operations stays viewable on the financial record
