@REQ-ZS-172 @BEH-ZS-191 @mvp
Feature: Absence notification with routing and fallback

  Scenario: Multi-channel delivery within the five-minute window (MVP)
    Given Ahmed, who consented to WhatsApp for attendance notifications, with no email on file
    And an attendance-taking confirmed at 8:10 AM marking Youssef absent with no justification, the day's first absence
    When the AbsenceRecorded event is consumed by the COM module after the 3-minute retention window
    Then an in-app notification is created immediately in Ahmed's language
    And the WhatsApp utility attendance template is sent
    And a channel whose non-delivery is observed within the delay window triggers a fallback SMS alias
    And each channel produces a delivery trace with status and cost
    And the notification is delivered to the operator within 5 minutes of the attendance-taking confirmation

  Scenario: Later absences on the same day (MVP)
    Given Youssef already notified absent for the first 8:00 AM class
    When the 10:00 AM attendance-taking marks him absent again
    Then no new immediate notification is sent
    And the evening summary lists the day's missed classes

  Scenario: Correction after sending (MVP)
    Given an absence notification already delivered to the operator
    When the teacher corrects the attendance record, marking the student present
    Then a correction notice is issued on the same channel and the original notification is flagged "corrected"

  Scenario: A household with no smartphone (MVP)
    Given a parent with no smartphone, no WhatsApp opt-in and no email
    When an absence is recorded for their child
    Then only the SMS (alias) route is used, in addition to the in-app notification
    And the SMS trace is flagged delivered, or carries a failure reason viewable by student life

  Scenario: Push-first hierarchy (V1)
    Given a parent who enabled push on the native app and consented to WhatsApp
    When an absence is recorded for their child
    Then push is sent first, then the WhatsApp utility template, with an SMS fallback on observed non-delivery
