@REQ-ZS-039 @BEH-ZS-036 @mvp
Feature: Law 59.21 parent contract

  Scenario: Front-desk signature and archiving (MVP)
    Given an enrollment moved to ACTIVE with a complete fee schedule by service category
    And a financial guardian (the grandfather) distinct from the legal guardian
    When the legal guardian and the grandfather sign the printed contract, scanned by the front office
    Then the signed contract is archived in the enrollment file with the date and the author of the upload
    And a copy is sent to the guardians and acceptance is confirmed in the app when claiming the account
    And billing of the payment schedule can start

  Scenario: Advanced electronic signature (V1)
    Given an ACTIVE enrollment with the contract generated
    When the legal guardian signs the contract electronically
    Then the signed contract is timestamped, archived, and verifiable by its code

  Scenario: Mid-year fee change refused
    Given an ACTIVE enrollment with a contract signed for 2026-2027
    When a staff member attempts to apply a new fee to this enrollment
    Then the operation is refused with the reason "mid-year increase prohibited"
    And the new fee only applies to an enrollment for a later school year
