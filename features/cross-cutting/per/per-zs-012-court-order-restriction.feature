@REQ-ZS-403 @PER-ZS-012 @mvp
Feature: Restricting a parent's access only on a court decision

  Scenario: Attempt without a decision, then a substantiated restriction
    Given a student with two active legal guardians
    When the principal attempts to remove the second parent's school rights without a supporting document
    Then the operation is denied with a notice that a court decision is required
    When the principal records a court decision with a supporting document
    Then the parent's rights are adjusted according to the decision
    And the restriction is logged and visible in the relationship's history
    And the other parent retains their default rights in full
