@REQ-ZS-041 @BEH-ZS-038 @mvp
Feature: Arrears alert without blocking

  Scenario: Certificate issued despite arrears
    Given an ACTIVE enrollment carrying an unpaid installment of 850 MAD
    When the front office generates the certificate of enrollment
    Then the arrears alert is shown on the file, but issuance is never blocked
    And the account statement can be attached to the file given to the guardian
