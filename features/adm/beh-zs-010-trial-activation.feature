@REQ-ZS-014 @BEH-ZS-010 @mvp
Feature: Trial and activation

  Scenario: Activation at the end of the trial
    Given a tenant on trial with demo data and some real data entered
    When the super-administrator converts the subscription to "active"
    Then the demo data is purged, the real data is retained, and the director is notified

  Scenario: Trial exit without activation (MVP)
    Given a trial that has expired without conversion or extension
    When the deadline passes
    Then the tenant moves to "trial expired," read-only for 30 days with a simple export available
    And the data is purged at the end of the 30 days, the operation being logged
