@REQ-ZS-457 @NFR-ZS-011 @mvp
Feature: Quarterly restore test

  Scenario: Full restore succeeds within targets
    Given day J's daily backup of a production environment
    And an isolated restore environment
    When the quarterly exercise runs
    Then the sample tenants' data is restored and verified by integrity checks
    And documents and configuration are restored
    And the observed restore time meets the disaster-recovery target
    And an exercise report is archived

  Scenario: Restore failure
    Given an exercise whose restore fails or overruns the target
    When the report is produced
    Then a dated action plan is opened before the end of the quarter
    And a new exercise is scheduled to verify the fix
