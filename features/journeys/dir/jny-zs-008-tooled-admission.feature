@REQ-ZS-282 @JNY-ZS-008 @v1
Feature: Tooled admission

  Scenario: Admission decision and opening pre-enrollment (V1)
    Given a complete CANDIDATE file whose admission test is passed
    When the site director records the decision "admitted"
    Then the family is notified and a reservation deposit is expected
    And the enrollment moves to PRE-ENROLLED on payment of the deposit
    And the decision is tracked with author and timestamp

  Scenario: Cancelling an application (V1)
    Given a CANDIDATE file whose family withdraws
    When the secretariat cancels the application
    Then the enrollment moves to the terminal state CANCELLED and its history is kept
    And a place is freed for the level's waitlist
