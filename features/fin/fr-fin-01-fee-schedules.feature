@REQ-ZS-133 @BEH-ZS-151 @mvp
Feature: Fee schedules

  Scenario: A level's fee schedule with ancillary fees
    Given the 2026-2027 year at School A
    When the school leadership creates the 2AC fee schedule with monthly tuition of 1,200 DH, non-refundable registration of 2,000 DH, annual insurance of 150 DH and monthly transport by zone
    Then each line carries a bilingual label, frequency, amount, mandatory-or-optional status and a tax classification
    And the validated fee schedule can be exported as a fee-disclosure document (Article 49)

  Scenario: Forced-sale safeguard
    Given a "textbooks" line marked mandatory
    When the school leadership confirms the fee schedule
    Then a legal alert is shown and confirmation requires a traced justification
