@REQ-ZS-528 @INT-ZS-026 @mvp
Feature: WhatsApp consent and channel fallback

  Scenario: Parent with no WhatsApp opt-in
    Given a guardian who has not consented to the WhatsApp channel for the school
    When an absence is recorded and the rules call for WhatsApp then SMS
    Then the notification is sent by SMS under the school's alias and never by WhatsApp

  Scenario: Opposition received
    Given a guardian who consented and sends the opposition keyword to the school's WhatsApp number
    When the inbound message is processed
    Then consent is revoked and logged, and subsequent sends for that school fall back to other channels
