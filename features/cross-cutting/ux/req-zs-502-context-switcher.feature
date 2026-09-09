@REQ-ZS-502 @UX-ZS-004 @mvp
Feature: Profile x school context switcher

  Scenario: A part-time teacher switching between two schools
    Given a teacher account affiliated with two schools at the same time
    When the user opens the context switcher
    Then the list shows every available profile x school pair with the school year
    When she switches to the second school
    Then all data shown belongs to the chosen context
    And the available actions are recalculated per that context's permissions

  Scenario: A multi-school parent keeps the same learned interface
    Given a parent with children at two schools
    When they switch from School A's context to School B's
    Then the app's structure, labels, and gestures stay identical
    And only the content changes: children, classes, payment plans, messages

  Scenario: A removed context, no delay
    Given a teacher whose affiliation was just closed by the school
    When they view their context switcher
    Then the corresponding context has disappeared immediately
    And if it was active, an explicit message states that access to that school's data has ended
