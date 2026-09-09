@REQ-ZS-559 @CNF-ZS-023 @mvp
Feature: Executing a retention deadline

  Scenario: Anonymizing a former student's attendance records
    Given a student whose last enrollment closed more than 2 years ago
    When the monthly retention process runs
    Then that student's attendance and discipline records are anonymized (identifiers replaced)
    And the school's enrollment registers remain viewable, with the identity snapshot locked at closure (INV-ZS-004)
    And the execution report states the volume anonymized

  Scenario: Reissuing an attestation after the account is anonymized
    Given a former student whose global account was anonymized after three years of inactivity
    When the school reissues an attestation of enrollment on request at the front desk
    Then the attestation is produced from the enrollment register's identity snapshot
    And the operation is logged without re-identifying the global account

  Scenario: Deleting health data
    Given a former student whose health module held data
    When more than a year has passed since the end of schooling
    Then the health data is permanently deleted
    And the operation is logged with no content disclosed
