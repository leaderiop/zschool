@REQ-ZS-337 @JNY-ZS-052 @mvp
Feature: A parent claiming a child

  Scenario: Claiming Adam with an invitation code and a knowledge challenge (MVP)
    Given a provisional student profile for Adam created by School B with no Massar code
    And an invitation code sent to Ahmed's number
    When Ahmed enters the code then Adam's date of birth, which is not displayed
    Then Ahmed's parent-student relationship with Adam is active with its qualities (father, legal guardian, financially responsible)
    And School B is notified of the claim
    And Ahmed sees Adam in his dashboard with School B's context

  Scenario: An invitation received by a third party at a wrong number (MVP)
    Given an invitation code sent by mistake to the number of a person unrelated to the family
    When this person enters the code and fails the knowledge challenge three times
    Then the code is locked and no relationship is created
    And School B is alerted, revokes the claim, and reissues the invitation to the corrected number

  Scenario: No automatic linking on a weak match (MVP)
    Given a student profile with no Massar code whose first name, last name, date of birth, and a guardian's phone number partly match an existing identity
    When a parent attempts a claim with no invitation code
    Then no automatic linking happens
    And a probable-duplicate alert is sent to the school for a decision
