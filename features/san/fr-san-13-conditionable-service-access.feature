@REQ-ZS-003 @BEH-ZS-293 @BEH-ZS-282 @v2
Feature: A service conditionable on payment

  Scenario: An unpaid transport subscription with the policy enabled
    Given the access policy for conditionable services enabled by the school
    And a student whose transport subscription has an overdue installment
    When student life staff view the day's boarding list
    Then the student appears with status "access suspended per the school's policy"
    And none of that student's official documents are blocked (report cards, certificates, attestations)
    And the parent sees the arrears and the account statement in their portal
