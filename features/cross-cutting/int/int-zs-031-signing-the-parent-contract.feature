@REQ-ZS-532 @INT-ZS-031 @mvp @v1
Feature: Signing the parent contract

  Scenario: Signed by the legal tutor
    Given a parent contract generated from an active enrollment's fee schedule
    And the legal tutor authenticated on their account with a verified mobile number
    When the legal tutor confirms the signature after reading it
    Then the advanced signature is applied with a timestamped OTP code, the document's fingerprint, and archiving in the record
    And a copy is accessible to the parent and exportable for the AREF

  Scenario: Signatory not the legal tutor
    Given a parent whose qualities do not include legal tutor
    When they attempt to sign the contract
    Then the signature is refused and the system states that only the legal tutor may sign (INV-ZS-058, INV-ZS-066)
