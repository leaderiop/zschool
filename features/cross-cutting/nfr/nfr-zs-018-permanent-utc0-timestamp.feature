@REQ-ZS-453 @NFR-ZS-018 @mvp
Feature: Single timestamp at permanent UTC+0

  Scenario: Recording an attendance session in December 2026
    Given a teacher who confirms attendance for their class on December 10, 2026, at 09:30 in Casablanca
    When the entry is saved
    Then the stored timestamp is December 10, 2026, 09:30 UTC
    And the display on every device and document reads 09:30, with no time shift

  Scenario: No residual seasonal alternation
    Given the platform's timezone configuration
    When the annual calendar is traversed from 2026 to 2030
    Then no time transition exists for Africa/Casablanca
    And the displayed offset is consistently UTC+0
