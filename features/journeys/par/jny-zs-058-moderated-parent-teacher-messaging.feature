@REQ-ZS-343 @JNY-ZS-058 @mvp
Feature: Moderated parent-teacher messaging

  Scenario: A reply in a thread opened by the teacher (MVP)
    Given a thread opened by the math teacher about Youssef
    When Ahmed receives the notification and replies in the thread
    Then his reply is visible to the teacher with the full history
    And the notice of possible leadership viewing is shown throughout the exchange
    And no personal phone number is exposed

  Scenario: Parent-initiated threads not authorized (MVP)
    Given a school that has not enabled parent-initiated threads
    When Ahmed tries to open a new thread with a teacher
    Then the action is unavailable with a bilingual explanation and a contact alternative
    And no notification is sent to the teacher
