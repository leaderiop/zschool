@REQ-ZS-505 @UX-ZS-001 @mvp
Feature: A device shared between a parent and a student (MVP)

  Scenario: Two accounts, two languages, no data leak
    Given a family phone with both Ahmed's account (Arabic) and Youssef's account (French) registered
    When Youssef chooses his account on the selection screen and enters his secret
    Then the interface opens in French in a session distinct from Ahmed's
    And none of Ahmed's financial data or notifications are accessible from this session
    When Youssef's session ends
    Then the device returns to the account selection screen without revealing either session's content

  Scenario: SMS in the recipient's language
    Given a mother who chose Arabic and a father who chose French for the same student
    When an absence notification is sent by SMS
    Then the mother receives the SMS in Arabic and the father in French, each as a single message
