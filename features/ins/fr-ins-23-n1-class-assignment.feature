@REQ-ZS-045 @BEH-ZS-043 @mvp
Feature: N+1 class assignment (MVP wave 2)

  Scenario: Bulk assignment with capacity control
    Given 90 students pre-enrolled in 1AC for 2027-2028 and three 1AC classes with a capacity of 30 each
    When academic leadership distributes students in a batch
    Then each enrollment carries its class and a history entry
    And any class exceeding 30 students is flagged and blocked pending the director's documented approval
