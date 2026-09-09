@REQ-ZS-427 @SEC-ZS-004 @mvp
Feature: Recycled mobile number (MVP)

  Scenario: New holder of a number formerly linked to a parent account
    Given a parent account with no login for eight months
    And a mobile number reassigned by the carrier to another person
    When that person requests a login code from an unrecognized device
    Then the platform requires the date of birth of a linked child before any session opens
    And three failures lock the account, alert the affected schools, and route to front-desk recovery
    And no child data is displayed before the challenge succeeds

  Scenario: Self-service number change
    Given a logged-in parent who still has their old number
    When they declare a new number and confirm both codes received
    Then the login identifier and primary contact are replaced
    And schools with an active relationship are notified of the change
