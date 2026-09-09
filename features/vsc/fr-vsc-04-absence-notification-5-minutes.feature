@REQ-ZS-077 @BEH-ZS-084 @mvp
Feature: Absence notification within 5 minutes

  Scenario: Notification delivered to guardians after roll-call confirmation
    Given an 8:00am course roll call received server-side at 8:06am with two students absent
    And each absent student having at least one reachable legal guardian
    When the roll-call confirmation is recorded server-side
    Then a bilingual absence notification is issued to each absentee's guardians
    And every notification is delivered, or reaches a final failure state, less than 5 minutes after confirmation
    And every send produces a delivery-log entry with the channel, status, and cost
    And student life sees notification failures for manual follow-up

  Scenario: No notification for a present student
    Given a confirmed roll call where student Youssef is marked present
    When the confirmation is recorded server-side
    Then no absence notification is issued for Youssef
    And no other student's notification mentions Youssef

  Scenario: A single notification per day for a student absent all day
    Given Omar absent from all six Monday sessions
    When the six roll calls are confirmed over the course of the day
    Then his guardians receive a single notification, within 5 minutes of the first roll call
    And the evening summary mentions the six missed sessions
    And six SMS sends are not deducted from the school's credit — only one is
