@REQ-ZS-400 @PER-ZS-009 @PER-ZS-004 @mvp
Feature: Assigning a role and the immediate effect of its scope

  Scenario: A supervisor only sees their assigned cycles
    Given a school with a middle-school cycle and a high-school cycle
    And a supervisor affiliated with the "Supervisor" role limited to the middle-school cycle
    When the supervisor opens today's absence list
    Then only classes from the assigned cycle are visible
    And no class from the high-school cycle is accessible, even via direct search
    And the role assignment appears in the log with author, beneficiary, and scope
