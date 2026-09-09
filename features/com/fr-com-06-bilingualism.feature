@REQ-ZS-168 @BEH-ZS-186 @mvp
Feature: Bilingualism of institutional content (MVP)

  Scenario: Announcement incomplete in one language
    Given a school announcement written in French only
    When the school leadership attempts to publish it
    Then the system flags the missing Arabic version and only allows sending with both versions or an explicit, traced waiver

  Scenario: SMS in a single language
    Given an absence template available in French and Arabic
    When the notification is sent to a parent whose communication language is Arabic
    Then a single SMS in Arabic is sent, with no French version
