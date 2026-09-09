@REQ-ZS-420 @SEC-ZS-010 @mvp
Feature: Protection against identity enumeration

  Scenario: Probing Massar codes from the identity-claim interface
    Given an unauthenticated user probing the identity-claim interface
    When they submit fifty successive Massar codes in under a minute
    Then every response is identical in content and timing, whether the code exists or not
    And subsequent requests are denied by rate limiting
    And a security alert is recorded in the audit log
    And no message confirms the existence of a code
