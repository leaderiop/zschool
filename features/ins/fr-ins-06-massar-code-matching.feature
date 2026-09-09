@REQ-ZS-029 @BEH-ZS-026 @mvp
Feature: Identity matching by Massar code

  Scenario: Strong match offered, never enforced
    Given an existing student profile on the platform carrying Massar code R134520789
    When the front office enters an admission with Massar code R134520789
    Then the system offers linking to the existing profile without creating a duplicate
    And a distinct identity is created only after the staff member's explicit confirmation, with the choice logged

  Scenario: Invalid Massar code rejected at entry
    Given an admission being entered
    When the staff member enters a Massar code that does not match the one-letter-plus-nine-digit format
    Then the entry is flagged invalid before it is saved
