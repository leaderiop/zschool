@REQ-ZS-524 @INT-ZS-009 @v1
Feature: Daily Fatourati reconciliation

  Scenario: A duplicate is rejected
    Given a reference already reconciled the previous day appearing again in today's report
    When daily reconciliation runs
    Then the row is rejected as a duplicate, listed in the discrepancy statement, and no second payment is created

  Scenario: A report payment absent from confirmations
    Given a row in the daily report with no prior confirmation received
    When reconciliation runs
    Then the row is placed in a discrepancy queue for front-desk verification with no automatic entry
