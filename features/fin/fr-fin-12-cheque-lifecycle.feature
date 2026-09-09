@REQ-ZS-140 @BEH-ZS-162 @mvp
Feature: Lifecycle of a bounced cheque

  Scenario: Bounce after deposit
    Given a 3,000-DH cheque handed over in September, in "handed over" status, covering the October monthly fee
    And a bank deposit on November 3 including this cheque
    When the bank returns the cheque for insufficient funds on November 8
    Then the cheque moves to "bounced" status with a reason, date and bounce-notice reference
    And the October monthly fee reverts to "overdue" status and the balance re-includes 3,000 DH in arrears
    And a notification is sent to the financial guardian and a reminder is scheduled
    And the incident is logged with the author of the entry

  Scenario: Regularization
    Given a cheque in "bounced" status and an installment back to unpaid
    When the guardian brings a compensating cash payment
    And the school records the regularization
    Then the cheque moves to "regularized" status with both attempts traced
    And the installment is settled by the new payment and a receipt is issued

  Scenario: Switch to litigation
    Given a "bounced" cheque not regularized after the reminder tiers and the regularization period
    When the school leadership switches the file to "litigation"
    Then automatic reminders stop and the file moves to manual tracking
    And documents (bounce notice, letters, history) are archived in the file
