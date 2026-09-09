@REQ-ZS-174 @BEH-ZS-195 @mvp
Feature: Bilingual message templates (MVP)

  Scenario: Customizing the absence template
    Given the "same-day absence" template supplied in FR and AR at onboarding
    When the school leadership edits the French text and saves
    Then a new template version is created, with the old one restorable
    And the editor shows the SMS segment count for each language

  Scenario: Compliance lock
    Given a reminder template into which the school leadership inserts a mention of withholding the report card
    When they attempt to publish the template
    Then publication is refused with a reminder of the no-document-blocking-for-unpaid-fees rule (ADR-ZS-005)
