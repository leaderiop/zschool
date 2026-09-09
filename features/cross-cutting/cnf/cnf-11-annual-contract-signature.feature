@REQ-ZS-553 @CNF-ZS-005 @mvp
Feature: Signing the annual contract

  Scenario: Contract signed and archived
    Given an active enrollment with a validated fee list
    When the legal guardian signs the contract from their portal
    Then the signed document is timestamped, fingerprinted, and archived in the student's record
    And a PDF copy is accessible to the parent from their portal
    And the contract appears with its reference in the school's compliance file

  Scenario: Signature refused by the portal on a pricing inconsistency
    Given a payment plan that does not match the published fee list
    When the contract is generated
    Then generation is blocked with a message about the inconsistency to be corrected

  Scenario: Countersignature by a distinct financial guardian (MVP)
    Given an enrollment where the legal guardian is the father and the financial guardian is the grandfather
    When the contract is generated at the front desk
    Then it requires the father's signature and the grandfather's countersignature, each with identity verification
    And the payment plan is enforceable against the grandfather as financial guardian
