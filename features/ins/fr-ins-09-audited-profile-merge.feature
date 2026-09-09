@REQ-ZS-032 @BEH-ZS-029 @mvp
Feature: Audited merge of two student profiles (MVP)

  Scenario: Merge after a multi-site group import
    Given two student profiles created by two sites of the same group for the same person, flagged as a probable duplicate
    When ZSchool support selects the target profile and obtains confirmation from a legal guardian
    Then the enrollments and relationships of both profiles are linked to the target profile
    And each site keeps its own academic data in its tenant, with only identity unified
    And the operation is fully traced and the two sites are notified
