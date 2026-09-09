@REQ-ZS-401 @PER-ZS-011 @mvp
Feature: Immediate access revocation when an affiliation closes

  Scenario: A part-time teacher whose affiliation is closed
    Given a teacher active at the school with grades entered
    When the principal closes the affiliation with a reason and a date
    Then any request from that account against the school's data is denied immediately
    And open sessions are invalidated
    And the grades and attendance records produced remain viewable in the school, attributed to their author
