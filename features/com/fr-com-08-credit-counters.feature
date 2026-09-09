@REQ-ZS-170 @BEH-ZS-188 @mvp
Feature: Credit counters and threshold alerts

  Scenario: An SMS pack's alert threshold reached
    Given a 5,000-credit SMS pack with an alert configured at 80 percent
    When the balance drops below 1,000 credits
    Then the school leadership receives an in-app and an email alert
    And the consumption projection stays viewable on the costs page

  Scenario: Balance exhausted during a school day
    Given a zero credit balance, a 500-credit authorized overdraft, and a confirmed attendance-taking flagging absences
    When the absence notification is triggered
    Then security alerts keep being delivered on the available channel and the overdraft is decremented
    And non-critical sends are queued with an urgent top-up request to the school leadership

  Scenario: Overdraft exhausted
    Given a 500-credit overdraft fully consumed
    When a new absence notification is triggered
    Then only the in-app notification is sent and the school leadership receives a critical alert
    And the overdraft is re-billed to the school at the next top-up

  Scenario: Authentication SMS outside the pack
    Given a parent receiving a one-time code to log in
    When the SMS is sent
    Then the school's pack counter stays unchanged
