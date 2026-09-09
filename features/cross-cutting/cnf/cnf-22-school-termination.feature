@REQ-ZS-560 @CNF-ZS-024 @v1
Feature: A school's termination lifecycle

  Scenario: Amicable termination
    Given a subscribed school whose contract is terminated on date J
    When the termination is recorded
    Then the full export is generated and its delivery is tracked before J plus 10 days
    And the tenant switches to read-only for 90 days
    And global identities and published documents remain accessible to data subjects

  Scenario: Delayed deletion
    Given a termination effective on date J
    When the J plus 12 months deadline arrives
    Then the tenant's operational data is deleted
    And a deletion report is produced and kept in the audit log
