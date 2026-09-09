@REQ-ZS-190 @BEH-ZS-210 @mvp @v2
Feature: Fate of the receivable on a transfer
  Scenario: Receivable kept at the origin with no transfer
    Given a validated transfer from "School A" to "School B" with a balance of three remaining monthly installments
    When the origin enrollment's closure is executed
    Then the receivable stays carried on the financial guardian's account at the "School A" tenant
    And the account statement handed to the legal tutor documents the remaining balance due
    And no amount is automatically transmitted to the destination enrollment's account at "School B"

  Scenario: Cross-site transfer within the same group (V2+, option enabled)
    Given an Organization grouping "School A" and "School B" with the transfer option enabled
    And a remaining balance of three monthly installments on the "School A" enrollment
    When "School A"'s leadership proposes the transfer and the financial guardian accepts
    Then the receivable is recorded as an opening receivable on the destination enrollment at "School B"
    And the operation is logged with the time-stamped agreement on both files

  Scenario: Outside the group, no transfer possible
    Given a transfer to a school outside the Organization
    When leadership reviews the financial closure options
    Then the transfer option does not exist before V2+ and is not offered
    And the receivable stays fully tracked by the origin school
