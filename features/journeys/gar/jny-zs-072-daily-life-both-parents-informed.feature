@REQ-ZS-357 @JNY-ZS-072 @mvp
Feature: Default dual notification

  Scenario: An absence notified to both parents
    Given a student whose father and mother are registered active legal guardians
    And no access restriction recorded
    When the morning roll call is validated with the student absent
    Then the father and mother each receive the day's first absence notification within under 5 minutes, each in their language
    And each send produces a distinct delivery trace per parent

  Scenario: One parent cannot remove the other's information
    Given a father holding his own account
    When he changes his own relationship's communication preferences
    Then only his own channels are changed
    And the mother's information rights and notifications stay unchanged
