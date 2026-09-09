@REQ-ZS-086 @BEH-ZS-105 @mvp
Feature: Retention and correction notices (MVP)

  Scenario: A false positive corrected during the retention window
    Given a roll call received server-side at 8:06am with Sara marked absent by mistake
    When the teacher corrects the roll call at 8:08am to mark Sara present
    Then no notification is sent to Sara's guardians, and the correction is logged

  Scenario: A correction notice after sending
    Given an absence notification for Sara delivered at 8:10am
    When student life corrects the roll call at 8:30am to mark Sara present
    Then a correction message is sent to the same guardians on the same channel, referenced to the original notification
    And the delivery log carries the original send, the correction notice, and their costs

  Scenario: The evening summary
    Given Omar notified absent at 8:10am, then absent for the next five sessions
    When the configured summary time (6pm) is reached
    Then his guardians receive a single summary listing the six missed sessions
