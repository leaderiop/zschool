@REQ-ZS-137 @BEH-ZS-157 @mvp
Feature: Tamper-proof numbering

  Scenario: A receipt numbered at server-side confirmation
    Given a payment entered on a workstation whose connection then drops
    When the cashier confirms it
    Then no number is assigned until the server confirms, and confirmation resumes with no duplicate number on reconnection

  Scenario: Deletion attempt
    Given a receipt numbered 2026-0418
    When a user attempts to delete it or edit its number
    Then the action is blocked and logged; only voiding through a reversing entry is offered
