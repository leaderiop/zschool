@REQ-ZS-485 @PAK-ZS-010 @v1
Feature: WhatsApp pricing switch of October 1, 2026
  Scenario: Pricing on either side of the switch
    Given the WhatsApp grid configured with the rate card applicable from October 1, 2026
    When a utility message is delivered on September 30, 2026
    And a utility message is delivered on October 1, 2026
    Then the first is priced per the grid predating October 1
    And the second is priced per the standalone rate card
    And both appear in the school's monthly consumption report

  Scenario: Counting inbound messages after the switch
    Given a parent who replied within the 24-hour window on October 3, 2026
    When the monthly consumption report is produced
    Then the inbound message is counted in the school's WhatsApp consumption
    And it appears distinctly from outbound messages
