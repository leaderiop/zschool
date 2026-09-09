@REQ-ZS-145 @BEH-ZS-170 @mvp
Feature: Unpaid-balances table

  Scenario: View by multi-child financial guardian
    Given Ahmed, financial guardian of Youssef and Sara at School A, with two overdue installments
    When the school leadership opens the unpaid-balances table by guardian
    Then one row groups Ahmed with the total of both installments and the per-child detail
    And the collect and remind actions are available from the row

  Scenario: Closed file not settled
    Given a TRANSFERRED enrollment with 1,500 DH still due
    When the table is shown
    Then the row carries the "closed file" tag and stays in the unpaid totals
