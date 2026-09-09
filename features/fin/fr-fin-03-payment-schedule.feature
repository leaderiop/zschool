@REQ-ZS-135 @BEH-ZS-153 @mvp
Feature: Payment schedule

  Scenario: Ten-month monthly schedule
    Given a 2026-2027 fee schedule for 2AC with monthly tuition of 1,200 DH and annual insurance of 150 DH
    When Youssef's enrollment moves to ACTIVE on September 5
    Then ten monthly installments of 1,200 DH are created from September to June
    And a single insurance installment of 150 DH is created on the activation date

  Scenario: Mid-year arrival with the month already begun due in full
    Given the same fee schedule and an enrollment activated on January 18
    When the payment schedule is generated with the default rule
    Then six monthly installments of 1,200 DH are created from January to June
    And the month of January is due in full

  Scenario: Mid-year departure
    Given an enrollment closed to WITHDRAWN on March 12
    When the payment schedule is recomputed
    Then the unsettled April-to-June installments are voided with a trace
    And the March installment stays due in full and the balance survives closing
