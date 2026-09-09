@REQ-ZS-036 @BEH-ZS-033 @mvp
Feature: Restricting a parent's access

  Scenario: Restriction only under a court ruling
    Given an ACTIVE enrollment with two active legal guardians
    When the director records a court ruling restricting the father's access, with a supporting document attached
    Then the father's rights are adjusted per the ruling
    And the change is logged and the file carries the attached document
    And an attempt to record it with no supporting document is refused

  Scenario: Scope of the restriction for a child enrolled at two schools (ADR-ZS-052)
    Given a restriction recorded by School A with the ruling attached
    And an active enrollment for the same child at School B
    When the restriction is recorded
    Then School B receives a notification inviting it to attach the ruling
    And the father's access at School B is restricted only once School B has recorded it
