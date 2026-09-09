@REQ-ZS-223 @BEH-ZS-253 @mvp
Feature: Permissions applied to indicators

  Scenario: An aggregate does not bypass a permission
    Given a head supervisor assigned to the middle-school cycle only, with no financial permission
    When they open the school's dashboard
    Then unpaid-balance indicators are neither shown nor derivable from a total
    And the headcount and attendance shown concern the middle-school cycle only

  Scenario: A removed permission takes effect immediately
    Given a weekly report scheduled for an account holding the financial permission
    When leadership removes that permission from the account
    Then the next report is produced without the unpaid-balances section
