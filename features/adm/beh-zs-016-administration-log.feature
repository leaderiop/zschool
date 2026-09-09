@REQ-ZS-020 @BEH-ZS-016 @mvp
Feature: Administration log and support access

  Scenario: Support access via ticket with director approval (MVP)
    Given a support ticket opened for School A
    When the support agent requests temporary tenant access
    Then access opens only after the director's explicit in-app approval, for at most the requested duration
    And every write made during this access is logged with the ticket identifier
