@REQ-ZS-198 @BEH-ZS-225 @mvp
Feature: Suspending and resuming an affiliation (MVP)

  Scenario: Suspension for extended leave
    Given a teacher "active" at School A
    When leadership suspends their affiliation from March 1 to April 30, 2027 with reason "leave"
    Then from March 1 on, they no longer access School A's classes, grades, attendance, or messages
    And their affiliations at other schools stay unchanged
    And their courses appear "to be covered" for the period in the structure alerts

  Scenario: Resumption without recreation
    Given the same suspended affiliation
    When the resumption date is reached or leadership lifts the suspension
    Then the affiliation returns to "active" with its prior roles and permissions
    And the history keeps the suspension and resumption with their dates
