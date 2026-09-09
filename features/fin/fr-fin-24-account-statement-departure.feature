@REQ-ZS-148 @BEH-ZS-174 @mvp
Feature: Account statement on departure

  Scenario: Statement handed to the financial guardian
    Given Youssef's enrollment closed to TRANSFERRED with 1,500 DH still due
    When the exit file is assembled
    Then a detailed account statement (settled and due installments, payments, discounts) is generated and handed to Ahmed, the financial guardian
    And the leaving certificate carries no balance mention

  Scenario: A guardian who is not the financial guardian
    Given Naïma, holder of custody with no financial-guardian status
    When she views her daughter's exit file
    Then the account statement is not shown to her
