@REQ-ZS-113 @BEH-ZS-126 @v1
Feature: Authenticity verification of a published report card
  Scenario: Checking a printed report card by QR code
    Given a published, printed semester-1 report card carrying its verification QR code
    When a third party scans the QR code
    Then the verification page shows "authentic", the issuing school, the year, the period and the current version
    And no detailed grade or personal data beyond what is strictly necessary is exposed

  Scenario: Correction after publication
    Given a grading error found after publishing version 1 of a report card
    When the school leadership makes the correction
    Then a version 2 is generated, signed and published
    And version 1 remains viewable marked "superseded"
    And the current version's QR code reflects the version history
