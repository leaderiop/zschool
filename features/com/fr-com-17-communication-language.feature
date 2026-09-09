@REQ-ZS-176 @BEH-ZS-197 @mvp
Feature: Communication language (MVP)

  Scenario: SMS in the recipient's language
    Given Naïma, whose communication language is Arabic, and Lina's father, whose communication language is French
    When an absence notification is issued for Lina
    Then Naïma receives an SMS in Arabic and the father an SMS in French, each in a single copy

  Scenario: Shared phone
    Given Ahmed (Arabic) and Youssef (French) who use the same phone
    When Youssef opens his session
    Then the interface and the in-app notifications are in French, with no change to Ahmed's preference
