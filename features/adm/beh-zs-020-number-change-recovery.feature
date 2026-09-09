@REQ-ZS-023 @BEH-ZS-020 @mvp
Feature: Number change and recycled numbers

  Scenario: Self-service number change (MVP)
    Given a parent whose account is identified by number +212661234567
    When they enter the new number +212677654321 and confirm the two codes received on the old and new numbers
    Then their account is identified by the new number, the operation is logged, and the schools of their children are notified

  Scenario: Front-desk recovery after phone loss
    Given a parent who no longer has access to their old number
    When School A's front office verifies their ID and records the request with the new number
    And the director validates the request
    Then the account is linked to the new number, the old number receives an information message, and the operation is logged

  Scenario: Number reassigned by the carrier
    Given an account with no login for seven months
    When someone attempts to log in with this number and receives the one-time code
    Then a knowledge challenge (date of birth of a linked child) is required before any access
    And three wrong answers lock the account and alert the schools involved
