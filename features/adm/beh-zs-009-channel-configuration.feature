@REQ-ZS-013 @BEH-ZS-009 @mvp
Feature: Channel configuration

  Scenario: Channels available at MVP
    Given a school on MVP
    When the director opens channel configuration
    Then they can activate in-app, SMS, and "utility" WhatsApp for attendance notifications only
    And push notifications and generalized WhatsApp are shown as "coming in V1" and cannot be activated
    And sending windows for reminders and announcements are configurable, with attendance notifications exempt
