@REQ-ZS-481 @PAK-ZS-005 @mvp
Feature: Monthly subscription billing
  Scenario: October invoice for a 300-student school
    Given a subscribed school with 300 students at ACTIVE status as of October 1, 2026
    When monthly billing runs
    Then an invoice for 1,500 MAD is issued for October
    And it details the billed headcount (300 students) and the unit price (5 MAD)
    And the invoice can be viewed and printed from the subscription-management area

  Scenario: No summer billing
    Given a school whose subscription is active
    When the July 1 and August 1 counts come due
    Then no subscription invoice is generated for either July or August
    And the subscription remains active with no amount due
