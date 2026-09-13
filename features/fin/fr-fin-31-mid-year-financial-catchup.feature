@REQ-ZS-010 @BEH-ZS-006 @BEH-ZS-162 @mvp
Feature: Mid-year financial catch-up import

  Scenario: Already-paid installments settle on import
    Given a pilot student enrolled since September with a freshly generated, entirely-unpaid payment schedule
    When the director imports that 3 months of tuition are already paid as of December
    Then the payment schedule shows those 3 installments paid and the rest due

  Scenario: A post-dated cheque already in hand does not count as paid until it clears
    Given a pilot student with a payment schedule
    When the director imports a cheque already in hand, still only deposited
    Then the cheque appears in cheque tracking at its imported status
    And none of the student's installments are marked paid by it

  Scenario: A discount already granted before onboarding is imported with a trace
    Given a pilot student with a payment schedule
    When the director imports a discount already granted by the school before onboarding
    Then the earliest installment's amount is reduced by the discount
    And the reduction is traced with its reason

  Scenario: A student whose fee schedule was never configured fails clearly
    Given a pilot student with no fee schedule configured for their level
    When the director imports that student's already-paid amount
    Then the row fails with a clear reason instead of a silently-wrong catch-up

  Scenario: Retrying the same import file never double-applies a row
    Given a pilot student whose financial history has already been imported once
    When the director re-imports the exact same file
    Then the row is recognized as already applied and nothing is double-recorded
