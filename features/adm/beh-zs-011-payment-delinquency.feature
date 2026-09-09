@REQ-ZS-015 @BEH-ZS-011 @v1
Feature: Subscription payment delinquency

  Scenario: Moving to read-only then back to active
    Given an active school whose monthly invoice is unpaid
    And reminders sent to the director without payment
    When the configured delay expires
    Then the subscription moves to "past due" status
    And the school's write operations are blocked, with viewing and exports still possible
    And a banner informs users and the director is notified
    When the payment is recorded
    Then the subscription reverts to "active" and write operations are restored immediately with no data loss
