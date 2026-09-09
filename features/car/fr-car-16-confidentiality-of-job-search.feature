@REQ-ZS-203 @BEH-ZS-236 @v2
Feature: Confidentiality of a job search

  Scenario: The "open" status stays invisible to the current employer
    Given a teacher actively affiliated with School A
    When she enables her "open to opportunities" status
    Then no School A user can see this status, today or retroactively
    And no notification is emitted to School A

  Scenario: Searches are never notified
    Given the same teacher browsing schools in the directory
    When she views School B's profile, a competitor of her employer
    Then no event of this view is notified, either to School A or to School B
    And the platform's audit log exposes this view only for internal security purposes, never to a school
