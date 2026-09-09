@REQ-ZS-480 @PAK-ZS-004 @mvp
Feature: Counting the active student
  Scenario: Student enrolled mid-month
    Given a subscribed school with an established headcount as of October 1, 2026
    And an enrollment that switched to ACTIVE status on October 5, 2026
    When the monthly count runs on November 1, 2026, at midnight
    Then the student is counted in November's billable headcount
    And they are not counted retroactively in October's headcount
    And the count is logged in UsageMetric with the date, headcount, and rule version

  Scenario: Suspended student not counted
    Given an enrollment with SUSPENDED status as of November 1, 2026
    When the monthly count runs
    Then the student is not counted in November's billable headcount
    And their return to ACTIVE status on November 20 makes them countable on December 1
