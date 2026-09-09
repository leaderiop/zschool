@REQ-ZS-193 @BEH-ZS-213 @mvp
Feature: Immutable timeline of the transfer file (MVP)
  Scenario: Every state change is logged
    Given a file that has passed through the statuses initiated, consent recorded, validated by the origin, accepted by the destination, and activated
    When the origin school's leadership opens the timeline
    Then every state change appears with author, timestamp, and, where relevant, a reason
    And no entry can be modified or deleted

  Scenario: Reading scope of the destination
    Given the same file opened by the destination's leadership
    When they view the timeline
    Then they see the file's steps but neither the financial checklist nor the origin's financial detail
