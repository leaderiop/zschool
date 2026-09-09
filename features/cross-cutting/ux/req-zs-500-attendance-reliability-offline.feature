@REQ-ZS-500 @UX-ZS-006 @mvp
Feature: Attendance reliability on an unstable connection

  Scenario: Attendance confirmed offline, then synced
    Given a teacher taking attendance for their class in a room with no network
    When they mark absences and confirm attendance
    Then the screen shows a "sync pending" state with no error message and no lost entries
    And the entry is kept locally on the device
    When the network becomes available again
    Then attendance syncs automatically
    And the state switches to "synced" with no further user action

  Scenario: A sync conflict is never silently overwritten
    Given attendance confirmed offline by the teacher
    And a correction entered in parallel by student life for the same student
    When the sync runs
    Then the conflict is flagged to student life for arbitration
    And neither write is silently lost
