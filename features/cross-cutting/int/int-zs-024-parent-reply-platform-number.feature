@REQ-ZS-530 @INT-ZS-024 @mvp
Feature: A parent replying on the platform's WhatsApp number (MVP)

  Scenario: Reply to an absence notification
    Given an absence notification sent to a parent from the platform number in School A's name
    When the parent replies "he's sick, doctor's note tomorrow"
    Then the parent receives an automatic bilingual receipt inviting them to justify the absence in the app or at the front desk
    And the message is placed in School A's student-life inbound-message queue
    And the inbound message is counted in School A's WhatsApp consumption
    And it appears in no moderated parent-teacher thread
