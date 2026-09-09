@REQ-ZS-484 @PAK-ZS-009 @mvp
Feature: Managing the SMS credit balance
  Scenario: Balance depleted during the morning attendance run
    Given a school whose SMS credit balance reaches zero
    When an absence notification is triggered after attendance is taken
    Then the notification is delivered through the remaining free channels (in-app notification, then push in V1)
    And no SMS is sent, except messages kept in the configurable emergency queue (INT-ZS-020)
    And the send history keeps a record of the message not delivered by SMS
    And a depleted-balance alert is sent to the principal's office

  Scenario: Topping up a pack
    Given a school under a depleted-balance alert
    When the principal's office purchases a prepaid SMS pack
    Then the credit balance is credited with the pack's amount
    And the SMS channel becomes available again for subsequent sends
    And the pack's amount appears on the next invoice, on a line separate from the subscription
