@REQ-ZS-233 @BEH-ZS-271 @mvp @v1
Feature: Massar reference of a transfer

  Scenario: Later entry of the reference after provincial validation
    Given a student whose enrollment has moved to state TRANSFERRED with no Massar reference
    When the front office returns to the log and enters the reference communicated by the family
    Then the log entry is updated with author and timestamp
    And the "transfer with no reference" signal disappears

  Scenario: Following up on transfers with no reference
    Given several transfers closed with no Massar reference after the configured deadline
    When leadership views the log filtered on missing references
    Then each entry offers the action "enter the reference" or "follow up with the family"
    And no transfer closure is undone by this follow-up
