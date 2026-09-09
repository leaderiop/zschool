@REQ-ZS-134 @BEH-ZS-152 @mvp
Feature: Parents' contract under Law 59.21

  Scenario: Generation and acceptance at activation
    Given a PRE-ENROLLED enrollment for Sara in CE2, whose legal guardian is Ahmed, also the financial guardian
    When the enrollment moves to ACTIVE
    Then a bilingual contract is generated with the applicable fee schedule, the payment schedule and statutory notices
    And Ahmed accepts it via a one-time code from his account, the acceptance timestamped with the document's fingerprint
    And the contract is archived in the enrollment's file and a copy is given to Ahmed

  Scenario: Distinct financial guardian
    Given an enrollment whose legal guardian is the father and whose financial guardian is the grandfather
    When the contract is generated
    Then the father's signature and the grandfather's countersignature are both required
    And the payment schedule is enforceable against the grandfather only after his traced countersignature

  Scenario: Tariff fixed for the year
    Given an ACTIVE enrollment with an archived contract
    When the school leadership publishes a new version of the fee schedule
    Then this enrollment's payment schedule stays unchanged and the new fee schedule only applies to new enrollments
