@REQ-ZS-527 @INT-ZS-020 @mvp
Feature: SMS credit balance depletion

  Scenario: Alert threshold reached
    Given a credit balance falling below the configured alert threshold
    When consumption is recorded
    Then the principal's office and the registrar's office receive a threshold-alert notification

  Scenario: Balance depleted
    Given a zero credit balance
    When a non-critical notification is sent
    Then the SMS send is held pending, other channels in the hierarchy keep serving the message, and the event is logged
