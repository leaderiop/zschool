@REQ-ZS-022 @BEH-ZS-019 @mvp
Feature: Express start-of-year for a 300-student school

  Scenario: Operational school in under one day
    Given a tenant created the day before the start of school with the national structure template
    When the director completes the express path: school year 2026-2027 and periods, importing 300 students and their guardians, class assignment, teacher invitations
    Then morning roll call, front-desk enrollment, and attendance notifications are operational on the first day of school
    And full express-path preparation took under one day

  Scenario: Deferrable steps with no blocking
    Given an express path completed without a fee schedule or advanced grading scales
    When the director opens the full setup wizard after the start of school
    Then the remaining steps are offered without redoing the choices already made
    And no function unlocked by the express path (roll call, front desk, notifications) is degraded
