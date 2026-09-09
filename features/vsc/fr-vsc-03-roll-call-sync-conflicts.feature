@REQ-ZS-076 @BEH-ZS-083 @mvp
Feature: Roll-call synchronization conflicts (MVP)

  Scenario: An offline teacher roll call and a supervisor roll call for the same session
    Given the supervisor confirming online at 8:10am the roll call for the session (Arabic 2AC-B, 8am–9am) with Omar marked absent
    And the teacher who had confirmed offline the same roll call at 8:05am with Omar marked present, synced at 8:20am
    When the teacher's roll-call sync is received
    Then the supervisor's version, received first, remains the reference, and Omar's already-issued absence notification is not duplicated
    And a discrepancy is opened in student life's queue with both timestamped versions
    When student life arbitrates "Omar present"
    Then the absence is corrected, a correction notice is sent to Omar's guardians, and the arbitration is logged
