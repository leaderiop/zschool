@REQ-ZS-280 @JNY-ZS-006 @mvp
Feature: Inter-site transfer

  Scenario: Internal transfer preserving the identity (MVP)
    Given a student enrolled and active at group Site A
    When the legal tutor requests a transfer to Site B, Site A validates it, and Site B accepts and activates it
    Then Site A's enrollment moves to TRANSFERRED with a reason and date in the same transaction as the Site B activation
    And Site B's enrollment links to the same global identity
    And no new student identity is created

  Scenario: A validated transfer never activated (MVP)
    Given a transfer request validated by Site A on March 10
    When Site B has neither accepted nor activated the receiving enrollment by April 9
    Then the request moves to "expired"
    And Site A's enrollment stays ACTIVE with no interruption
    And the legal tutor and both sites are notified

  Scenario: Refusal by the receiving school (MVP)
    Given a transfer request validated by the origin
    When the receiving site refuses for lack of capacity
    Then the request carries the status "refused" with the reason
    And the origin's enrollment stays ACTIVE
    And the origin can never refuse a transfer for a financial reason

  Scenario: Shared scope consented to and logged (MVP)
    Given a transfer request accepted between two group schools
    When the legal tutor chooses the default transfer profile with no extension
    Then the receiving site gets only: identity, Massar code, schools attended, years, levels and year-end decisions, official documents
    And detailed grades, absences, and disciplinary data are not transmitted without explicit sharing
    And health data is never transferred automatically
    And the consent is logged with scope and timestamp

  Scenario: Validation with no financial blocking (MVP)
    Given a student record showing a debit balance at the time of the transfer request
    When the origin site director validates the transfer
    Then validation is not blocked by the balance
    And the arrears alert is visible on the record and the account statement is given to the financially responsible parent
    And the origin site's financial account stays active until settled
