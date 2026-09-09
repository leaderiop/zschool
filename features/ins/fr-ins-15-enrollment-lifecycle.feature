@REQ-ZS-038 @BEH-ZS-035 @mvp
Feature: Closing an enrollment

  Scenario: Deletion forbidden after activation
    Given an enrollment that was once ACTIVE and then moved to WITHDRAWN with a reason and date
    When a staff member attempts to delete this enrollment
    Then the operation is refused
    And the enrollment remains closed, with its full history viewable

  Scenario: Temporary suspension with a return (V1)
    Given an ACTIVE enrollment
    When the director records a temporary suspension with a reason, a start date, and an end date
    Then the enrollment moves to SUSPENDED, and guardians are notified
    And on the end date, or on a resumption decision, the enrollment returns to ACTIVE

  Scenario: Year end for a suspended student (V1, ADR-ZS-044)
    Given a SUSPENDED enrollment on the year's closing date
    When the director enters the student's year-end decision
    Then the enrollment moves directly from SUSPENDED to COMPLETED with its decision, without going back through ACTIVE

  Scenario: Cancelling a pre-enrollment (MVP, ADR-ZS-044)
    Given a PRE-ENROLLED enrollment whose family withdraws
    When the front office cancels the enrollment with a reason
    Then the enrollment moves to the terminal CANCELLED state and remains viewable in the campaign history

  Scenario: Mid-year reinstatement (MVP, ADR-ZS-044)
    Given a student whose 2026-2027 enrollment has been WITHDRAWN since November
    When the front office creates a new 2026-2027 enrollment with the reason "reinstatement"
    Then the creation is accepted, linked to the prior enrollment, and the single-active-enrollment rule is upheld
