@REQ-ZS-503 @UX-ZS-005 @mvp
Feature: Notification preferences and consent

  Scenario: Revocable WhatsApp opt-in
    Given a parent who has not consented to the WhatsApp channel
    When they view their notification settings
    Then the WhatsApp channel appears disabled with a note that consent is required
    When they enable the channel and confirm their consent
    Then eligible notifications can be delivered to them via WhatsApp
    And revoking consent covers all future sends
    And revocation affects neither the in-app channel nor the SMS fallback for critical alerts

  Scenario: A parent never reduces the other's rights
    Given two active legal guardians of the same student
    When one of them disables a notification category for themselves
    Then the other guardian keeps receiving their own notifications
    And no setting changes the other parent's access rights, restriction requiring a court decision on record
