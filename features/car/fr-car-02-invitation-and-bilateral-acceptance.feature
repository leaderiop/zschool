@REQ-ZS-195 @BEH-ZS-222 @mvp
Feature: Invitation and bilateral acceptance of an affiliation

  Scenario: A teacher accepts an invitation from their second school
    Given a teacher active at School A, with her own account
    And an invitation from School B for a "teacher" role under a part-time contract
    When she opens the notification, reviews the roles, and accepts the invitation
    Then her affiliation with School B moves to status "active" as of that day
    And the context switcher offers the (teacher, School B) pair
    And School B sees the active affiliation in its register, without seeing School A's data

  Scenario: Declining an invitation
    Given an invitation with status "invited"
    When the person declines the invitation
    Then the affiliation stays at status "invited" with a "declined" note, with no access
    And the school is notified of the decline and may invite again

  Scenario: An invitation alone grants no rights
    Given an invitation sent and not yet accepted
    When the person browses the platform
    Then they see no content of the inviting school beyond the invitation itself
