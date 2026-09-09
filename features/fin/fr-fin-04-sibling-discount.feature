@REQ-ZS-136 @BEH-ZS-154 @mvp
Feature: Automatic sibling discount

  Scenario: Second child enrolled
    Given a sibling discount configured at 10 percent on tuition from the second child on
    And Youssef enrolled ACTIVE at School A with Ahmed as financial guardian
    When Sara's enrollment, same guardian, moves to ACTIVE at the same school
    Then the 10 percent discount is applied to Sara's tuition installments as a distinct line
    And Ahmed's payment schedule shows the discount, referenced

  Scenario: A sibling leaves
    Given the sibling discount applied to Sara
    When Youssef's enrollment closes mid-year
    Then the discount is removed from Sara's unsettled installments, with the recomputation traced
