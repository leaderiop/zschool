@REQ-ZS-016 @BEH-ZS-012 @v1
Feature: Cancellation with full export

  Scenario: Cancellation at the school's request
    Given an active school whose director requests cancellation
    When the request is confirmed by the second validation
    Then a full export of the school's data is produced and made available via a secure, time-limited link
    And the subscription moves to "cancelled": 90 days read-only, no writes possible
    And active enrollments are closed with a reason and date, and affiliations are ended
    And parents and students retain access to their published documents
    When 12 months since cancellation have passed
    Then the tenant's operational data is deleted
    And global identities and people's access to their published documents are retained
