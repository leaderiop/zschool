@REQ-ZS-182 @BEH-ZS-202 @mvp
Feature: Transfer file lifecycle (MVP)
  Scenario: Decline by the destination for capacity reached
    Given a file "validated by the origin" toward "School B"
    And the target class at "School B" at capacity with no leadership waiver
    When "School B"'s leadership declines the file with the reason "capacity reached"
    Then the file moves to status "declined" with a reason, author, and timestamp
    And the origin enrollment stays ACTIVE with no change
    And the legal tutor and the origin school are notified

  Scenario: The origin cannot decline over an unpaid balance
    Given a file "consent recorded" with an unpaid balance of 3,000 MAD at the origin
    When the origin school's leadership opens the file
    Then no "decline" action is offered
    And validation stays possible, the balance being only an alert

  Scenario: Expiry of a validated file never activated
    Given a file "validated by the origin" for 30 days with no acceptance or activation by the destination
    When the configured expiry period is reached
    Then the file moves to status "expired"
    And the origin enrollment stays ACTIVE and the student keeps appearing on its attendance lists
    And the legal tutor and both schools are notified

  Scenario: Cancellation by the legal tutor before activation
    Given a file "accepted by the destination" not yet activated
    When the legal tutor cancels the request from their account
    Then the file moves to status "cancelled" and the prepared destination enrollment is cancelled (CANCELLED state)
    And the origin enrollment stays ACTIVE
