@REQ-ZS-143 @BEH-ZS-167 @mvp
Feature: Numbered receipts

  Scenario: Continuous numbering
    Given the school's last receipt numbered 2026-0417
    When two payments are confirmed in a row
    Then the receipts carry numbers 2026-0418 and 2026-0419, assigned server-side at confirmation
    And no numbered receipt can be deleted

  Scenario: Sent to the financial guardian
    Given a payment confirmed for a financial guardian with no email on file
    When the receipt is issued
    Then an in-app notification and an SMS with a link to the receipt are sent to their mobile number
    And the bilingual receipt is downloadable from their account
