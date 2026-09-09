@REQ-ZS-305 @JNY-ZS-031 @mvp
Feature: Morning roll call by class in offline mode

  Background:
    Given Rachid is authenticated on the mobile app in the "head supervisor" context of his school
    And the middle-school and high-school cycles are assigned to him
    And class 2AC-3 has 32 students with ACTIVE enrollment for the current year
    And the morning half-day roll call is not yet validated for 2AC-3

  Scenario: roll call validated with no network then automatic sync (MVP)
    When Rachid marks 29 students present, 2 absent, and 1 late, then validates the roll call
    And the phone is offline at the moment of validation
    Then the validation is confirmed locally with the status "awaiting sync"
    And the markings and the local entry time are kept on the device
    When the network connection is restored
    Then the roll call syncs automatically, with no re-entry and no duplicate
    And attendance records carry the author, the local entry time, and the sync timestamp
    And any discrepancy with an already-synced per-course roll call is flagged to Rachid for arbitration, with the first synchronized validation authoritative
    And the 5-minute notification delay runs from the roll call's platform-side sync, not from the local validation time

  Scenario: notification of the day's first absence delivered in under 5 minutes (MVP)
    Given a class roll call validated and synced at 8:12 a.m. with 2 unexcused absent students
    And each absent student has at least one reachable active legal guardian
    When the 3-minute hold window elapses with no correction
    Then each legal guardian and the holder of custody receive the notification in their language on their channel (in MVP: an in-app notification, then WhatsApp utility if express consent, then SMS; push arrives in V1)
    And delivery happens in under 5 minutes after the roll call's actual platform-side validation
    And every send produces a delivery trace with channel, status, and cost charged to the school

  Scenario: subsequent absences grouped and a correction after sending (MVP)
    Given Omar, a Grade 8 student, absent at the 8 a.m. session, then at the 10 a.m. and 2 p.m. sessions
    When all three roll calls are validated
    Then a single immediate notification is sent for the 8 a.m. absence
    And the 10 a.m. and 2 p.m. absences appear in the evening summary with no new immediate send
    When the 8 a.m. teacher corrects Omar to "present" at 8:30 a.m.
    Then a correction notice is sent to the guardians on the same channel

  Scenario: correction within the hold window (MVP)
    Given a roll call validated at 8:12 a.m. with a student wrongly marked absent
    When the teacher corrects the roll call at 8:14 a.m.
    Then no notification is sent to that student's guardians
