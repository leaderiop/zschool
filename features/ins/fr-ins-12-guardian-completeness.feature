@REQ-ZS-035 @BEH-ZS-032 @mvp
Feature: Guardian completeness before activation

  Scenario: Move to ACTIVE refused with no financial guardian
    Given a complete pre-enrollment whose only guardian is a legal guardian not designated as financial guardian
    When the staff member attempts to move the enrollment to ACTIVE state
    Then the system blocks the transition and requests that a financial guardian be designated
    And the transition is only possible once the "financial guardian" quality is recorded, held by the legal guardian or by a third party
