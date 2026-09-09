@REQ-ZS-012 @BEH-ZS-008 @mvp
Feature: Languages and bilingualism

  Scenario: Per-person language preference (MVP)
    Given a school whose default language is French
    And a father and his son using the same phone with two separate accounts
    When the father chooses Arabic and the son keeps French
    Then each person's interface, SMS, and notifications follow their own preference, independent of the device
