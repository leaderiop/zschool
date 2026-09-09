@REQ-ZS-081 @BEH-ZS-088 @mvp
Feature: Validating a justification via student life

  Scenario: Validating a justification
    Given a justification in "submitted" status with a legible attachment
    And a student-life staff member authorized for the cycle concerned
    When the staff member validates the justification with a comment
    Then the justification moves to "validated" status with author and timestamp
    And the associated absence record is marked "justified"
    And the parent is notified of the validation

  Scenario: Refusing an illegible justification
    Given a justification in "submitted" status whose attachment is illegible
    When the staff member refuses the justification with a reason
    Then the justification moves to "refused" status with author and timestamp
    And the absence stays unjustified and keeps counting in attendance counters
    And the parent is notified of the refusal with the reason
