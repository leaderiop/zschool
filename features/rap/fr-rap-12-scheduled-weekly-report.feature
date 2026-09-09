@REQ-ZS-222 @BEH-ZS-252 @v1
Feature: Scheduled weekly report

  Scenario: Producing and distributing the weekly report
    Given a weekly report scheduled for Monday at 7:30 a.m. for School A's leadership
    And covering the past week with the headcount, attendance, unpaid-balance, and pending-entries indicators
    When the Monday 7:30 a.m. deadline arrives on a working day of the school's calendar
    Then the report is produced with the past week's data and time-stamped
    And it appears in the report history and is notified to internal recipients
    And its content respects the report's permissions, regardless of the recipients

  Scenario: A deadline falling on a non-working day
    Given the same scheduled report whose deadline falls on a holiday in the school's calendar
    When the deadline arrives
    Then production is deferred to the next working day at the same time
    And no notification is sent before actual production
