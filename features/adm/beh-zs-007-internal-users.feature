@REQ-ZS-011 @BEH-ZS-007 @mvp
Feature: Internal users and roles

  Scenario: Inviting a part-time teacher without mandatory MFA (MVP)
    Given a director who invites a teacher by mobile number with the standard "teacher" role and contract type "part-time"
    When the teacher accepts the invitation and activates their account
    Then the affiliation becomes active and their permissions derive from their course assignments
    And two-factor authentication is offered without being required

  Scenario: Dual control on director accounts
    Given a local system administrator
    When they attempt to reset the director's password
    Then the operation is refused and validation by a second director-role account is required
