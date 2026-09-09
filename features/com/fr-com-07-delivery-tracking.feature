@REQ-ZS-169 @BEH-ZS-187 @mvp
Feature: Delivery tracking (MVP)

  Scenario: Per-channel statuses
    Given a summons sent in-app and by SMS to a guardian
    When the guardian opens the summons in the app
    Then the in-app trace moves to "read" with a timestamp, and the SMS trace stays at most "delivered"

  Scenario: Traced failure
    Given an SMS to an unreachable number
    When the operator returns a failure
    Then the trace carries the failure reason, and student life sees it in the tracking table
