@REQ-ZS-019 @BEH-ZS-015 @mvp
Feature: Consumables

  Scenario: SMS credit exhaustion (MVP)
    Given a school whose SMS credit reaches the configured alert threshold
    When a notification is routed to the SMS channel
    Then the director is alerted immediately and the consumption history shows the cost per send
    And once the credit is exhausted, attendance notifications keep being delivered on the available channels, with the SMS failure remaining visible in delivery tracking

  Scenario: OTP not deducted
    Given a parent logging in with a one-time code
    When the code SMS is sent
    Then no charge appears on the school's counters
