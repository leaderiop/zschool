@REQ-ZS-106 @BEH-ZS-118 @mvp
Feature: Default national weightings (MVP)
  Scenario: Report card for a certifying level
    Given a 3AC class with the default 30 / 30 / 40 weightings versioned for 2026-2027
    When the semester-2 report card is generated
    Then the weighting table and its text reference appear in full on the report card
  Scenario: Historized variant
    Given the 2021-2022 variant (3AC 50 / 50) kept as a past version
    When the school leadership views the weighting history
    Then the variant appears with its year without being offered by default for 2026-2027
