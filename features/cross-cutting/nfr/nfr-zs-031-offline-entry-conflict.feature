@REQ-ZS-456 @NFR-ZS-031 @mvp
Feature: Offline entry conflict

  Scenario: A grade changed in parallel on the server
    Given a test grade entered offline by a teacher at 21:05
    And a correction to the same grade recorded on the server at 18:30 by the department head
    When the local entry syncs
    Then the server-side change prevails for that field
    And the teacher is alerted to the overwrite with both values shown
    And the tenant's conflict log records the event

  Scenario: Conflict on published data
    Given a published, locked report card
    And a local offline entry targeting that report card
    When the sync attempts the write
    Then the write is denied with an explanation
    And a new report-card version remains the only path to correction
