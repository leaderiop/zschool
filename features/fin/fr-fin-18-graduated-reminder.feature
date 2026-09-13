@REQ-ZS-144 @BEH-ZS-168 @mvp
Feature: Graduated reminder for an unpaid installment

  Scenario: Triggering the tiers
    Given a 900-DH installment unpaid since October 5
    And tiers configured at D+3 (in-app), D+7 (SMS), D+15 (printable mail, from V1 on)
    And a parent with an active account and a mobile number on file
    When the D+7 tier's date is reached with no payment
    Then an SMS reminder is sent from the bilingual template
    And the reminder is logged with its tier, channel and cost
    And the unpaid-balances table reflects the tiers' status

  Scenario: Reminders stop once settled
    Given tiers scheduled on an unpaid installment
    When a payment settles the installment
    Then the remaining reminders are canceled
    And a receipt is sent to the financial guardian

  # Out of scope for ticket #64 (BEH-ZS-168's dispatch/template-management
  # portion, per the finance spec's own Out-of-Scope note): no
  # reminder/letter template management module exists yet in this codebase to
  # apply a content safeguard to — creating a Dunning RECORD is this ticket's
  # whole scope, not the wording of any message.
  @skip
  Scenario: Content safeguard
    Given any reminder tier or letter
    Then no message mentions withholding official documents or exclusion for unpaid balances
    And the template is not published if it contains such wording
