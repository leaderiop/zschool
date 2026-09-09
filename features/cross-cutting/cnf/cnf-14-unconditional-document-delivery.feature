@REQ-ZS-556 @CNF-ZS-016 @mvp
Feature: An exit certificate despite arrears

  Scenario: Delivery with an alert and an account statement
    Given a transferred student with an outstanding balance of 1,200 MAD
    When the parent requests the exit certificate
    Then the certificate is generated and delivered normally
    And the arrears alert remains visible to staff on the record
    And the balance statement is attached to the exit file given only to the financial guardian
