@REQ-ZS-454 @NFR-ZS-023 @mvp @v1
Feature: Absence notification to families

  Scenario: Notification within the 5-minute deadline (MVP)
    Given a supervisor who confirms attendance for a class of 40 students at 08:05
    And 3 students are absent, each with at least one active legal guardian
    When attendance is confirmed
    Then each affected guardian receives the notification on their priority channel in under 5 minutes, after the 3-minute retention window allowing an attendance correction
    And every notification carries its send timestamp and the status of the channel used
    And a second absence for the same student on the same day does not trigger a new immediate notification but appears in the evening summary

  Scenario: Channel fallback on a push failure (V1)
    Given a parent whose push-enabled device is unreachable
    And who has consented to WhatsApp messages
    When the push notification fails
    Then the WhatsApp utility message is sent automatically
    And on a WhatsApp failure, the SMS is sent within the school's credit limit
