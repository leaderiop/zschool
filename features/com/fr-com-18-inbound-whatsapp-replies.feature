@REQ-ZS-177 @BEH-ZS-198 @mvp
Feature: Inbound WhatsApp replies (MVP)

  Scenario: A reply to an absence notification
    Given Ahmed, who replies "he is sick" to Youssef's absence WhatsApp notification
    When the reply is received
    Then an automatic bilingual acknowledgment offers him the link to the absence-justification screen in the app
    And the reply appears in School A's student-life queue, linked to the original notification
    And, after 01/10/2026, the inbound conversation counts toward the school's costs
