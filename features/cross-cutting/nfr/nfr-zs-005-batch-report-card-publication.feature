@REQ-ZS-452 @NFR-ZS-005 @mvp
Feature: Publishing a period's report cards

  Scenario: Publishing for a 2,000-student school within the deadline
    Given a 2,000-student school whose class councils are closed
    And an assessment period ready to publish
    When the principal's office triggers publication of the period
    Then every report card is locked with its version, fingerprint, and signatory in under 10 minutes total
    And active legal guardians receive the publication notification
    And no published report card can be edited, with any correction creating a new version

  Scenario: Resuming after a partial failure
    Given a publication run interrupted after 1,200 report cards were locked
    When the operation is restarted
    Then only the remaining 800 report cards are generated
    And no already-published report card is regenerated or re-notified
