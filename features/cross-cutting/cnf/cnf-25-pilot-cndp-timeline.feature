@REQ-ZS-561 @CNF-ZS-001 @mvp
Feature: Activating a pilot tenant conditioned on formalities (MVP)

  Scenario: A pilot with no F211 receipt
    Given a pilot school whose F211 declaration has not yet been filed
    When ZSchool attempts to activate its tenant for production
    Then activation is refused, stating the missing formalities and the pilot agreement to sign

  Scenario: A compliant pilot
    Given a pilot whose F211 receipt and signed pilot agreement are on record
    When ZSchool activates the tenant
    Then activation proceeds and the tracking table carries the formalities' references
    And the national-ID field stays disabled until F112 is obtained
