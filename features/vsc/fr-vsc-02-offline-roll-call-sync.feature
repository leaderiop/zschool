@REQ-ZS-075 @BEH-ZS-082 @mvp
Feature: Offline roll call and synchronization

  Scenario: Roll call confirmed with no network, then synchronized automatically
    Given a teacher in class whose phone has lost network connectivity
    And an in-progress roll call for the 8:00am slot with three absences marked
    When the teacher confirms roll call while the phone is offline
    Then the confirmation is saved locally and the roll call is kept on the device with its timestamp
    And a pending-sync indicator is shown
    When the network connection is restored
    Then the roll call is transmitted to the server automatically with no further action from the teacher
    And the AbsenceRecorded events for the three absentees are produced once synchronization completes
    And notifications to guardians start within the 5-minute limit after this receipt
