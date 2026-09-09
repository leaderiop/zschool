@REQ-ZS-166 @BEH-ZS-184 @mvp
Feature: Notification routing (MVP)

  Scenario: SMS fallback on WhatsApp failure
    Given a parent who consented to WhatsApp for attendance notifications
    And an absence notification whose WhatsApp send fails (the number is unreachable on WhatsApp)
    When the failure is observed within the delay window
    Then an SMS alias is sent to the same number
    And both attempts are traced with status and cost

  Scenario: Non-critical message with no paid channel
    Given a courtesy announcement, and a school whose matrix reserves SMS for critical messages
    When the announcement is published
    Then only the in-app notification is sent
