@REQ-ZS-150 @BEH-ZS-178 @mvp
Feature: No document blocking for unpaid balances

  Scenario: Enrollment certificate despite arrears
    Given an active student with 2,400 DH in arrears and three reminders issued
    When the front-desk staff issues the enrollment certificate from the file
    Then the document is generated immediately, with no blocking or blocking warning
    And a non-blocking arrears alert is shown on the file
    And the account statement can be attached in one click
    And the request and the delivery are traced
