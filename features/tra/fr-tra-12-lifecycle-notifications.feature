@REQ-ZS-192 @BEH-ZS-212 @mvp
Feature: Notifications across the transfer lifecycle (MVP)
  Scenario: Activation notified on the MVP channels
    Given a transfer file activated between "School A" and "School B"
    When the TransferValidated event is emitted
    Then the legal tutor receives an in-app and SMS notification in their preferred language
    And the leadership of "School A" and of "School B" receive an in-app notification
    And no school data is contained in the message, only the file reference

  Scenario: Expiry notified
    Given a file that has moved to status "expired"
    When the platform detects the expiry
    Then the legal tutor and both schools are notified with the reminder that the student stays enrolled at "School A"
