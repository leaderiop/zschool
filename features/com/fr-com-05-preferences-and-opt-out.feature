@REQ-ZS-167 @BEH-ZS-185 @mvp
Feature: Preferences and opt-out (MVP)

  Scenario: STOP limited to reminders and announcements
    Given Ahmed, who replies "STOP" to a payment-reminder SMS
    When the opt-out is recorded
    Then reminders and announcements by SMS stop for Ahmed, and a confirmation is sent to him
    And the confirmation states that absence and security notifications keep reaching him
    And the next day's absence notification is indeed sent to him by SMS

  Scenario: Two parents, two preferences
    Given Naïma and the father, legal guardians of Lina
    When Naïma chooses Arabic and the father chooses French as their communication language
    Then every notification is issued to each of them in their own language, both staying informed by default
