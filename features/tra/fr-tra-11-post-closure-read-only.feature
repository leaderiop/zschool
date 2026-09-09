@REQ-ZS-191 @BEH-ZS-211 @mvp
Feature: Immutability after transfer closure
  Scenario: Correction during the grace period
    Given an enrollment closed TRANSFERRED 10 days ago
    When leadership corrects a mistaken attendance record from the past week
    Then the correction is accepted and logged with author, reason, and timestamp

  Scenario: Correction refused outside grace without an audited procedure
    Given an enrollment closed TRANSFERRED 75 days ago (60-day grace period)
    When a user attempts to modify a school data item of the enrollment
    Then the change is refused as a direct write
    And the only path is the audited correction procedure, logged in the audit log
