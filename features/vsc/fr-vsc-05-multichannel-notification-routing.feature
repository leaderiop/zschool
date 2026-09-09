@REQ-ZS-078 @BEH-ZS-085 @mvp
Feature: Multi-channel routing of absence notifications

  Scenario: Falling back to SMS with no WhatsApp consent (no push at MVP)
    Given a legal guardian who has not given WhatsApp consent
    When an absence notification is routed for this guardian
    Then no WhatsApp message is sent to them, and the system attempts the remaining channels per the configured hierarchy (in-app then SMS at MVP; push at V1)
    And the SMS is sent via the school's aggregator, charged against its message credit
    And the delivery log keeps every attempt, its status, and its cost

  Scenario: Respecting a parent's opposition to the WhatsApp channel
    Given a legal guardian who has withdrawn their WhatsApp consent
    When an absence notification is routed for this guardian
    Then no WhatsApp message is sent to them
    And routing falls back to the remaining channels per the configured hierarchy
    And the consent withdrawal is logged with its timestamp
