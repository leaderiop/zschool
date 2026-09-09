@REQ-ZS-031 @BEH-ZS-028 @mvp
Feature: Claiming a provisional profile via an invitation code

  Scenario: A legal guardian claims their child's identity
    Given a provisional student profile created by the school with two guardians, one a legal guardian reachable at 0662345678
    When the legal guardian enters the invitation code received by SMS from their account
    Then the student profile moves from "provisional" to "linked"
    And the parent-student relationship becomes active with the recorded qualities
    And the creating school is notified of the claim

  Scenario: Expired invitation code
    Given an invitation code past its validity period
    When the guardian attempts to claim the profile with this code
    Then the claim is refused with an invitation to request a new code from the front office
    And the front office can regenerate a code

  Scenario: Invitation sent to a wrong number (ADR-ZS-049)
    Given an invitation code sent by mistake to a third party's number
    When this third party enters the code without knowing the child's date of birth
    Then the claim is refused after three failures and the code is invalidated
    And the front office corrects the number, revokes any wrongful claim, and reissues a code, the operation being logged
