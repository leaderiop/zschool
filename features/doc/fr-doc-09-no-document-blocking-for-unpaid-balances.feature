@REQ-ZS-122 @BEH-ZS-139 @mvp
Feature: No document blocking for unpaid balances

  Scenario: Self-service certificate with arrears
    Given a student whose financial guardian has 2,400 MAD in arrears
    When a legal guardian requests the enrollment certificate
    Then the document is generated immediately
    And a non-blocking arrears alert is shown on the file

  Scenario: A payment condition cannot be configured
    Given school leadership on the document-configuration screen
    When they try to condition an official document or re-enrollment on settling the balance
    Then no such option exists and the list of conditionable services is limited to the single compliance-approved list
