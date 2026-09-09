@REQ-ZS-482 @PAK-ZS-007 @mvp
Feature: Converting a trial to a subscription
  Scenario: Subscribing after a trial
    Given a school on trial for 20 days
    And a preloaded demo dataset
    And real data entered by the registrar's office during the trial
    When the principal's office subscribes to the single plan
    Then the subscription switches to active status
    And the demo data is deleted
    And the school's entered data is kept unchanged
    And the first subscription invoice is issued on the 1st day of the following month
