@REQ-ZS-297 @JNY-ZS-018 @mvp
Feature: Re-enrollment and rollover, secretariat side

  Scenario: Campaign tracking and collecting the deposit (MVP wave 2)
    Given a re-enrollment campaign open for the 2027-2028 year
    When a 4AP student's parent confirms re-enrollment and pays the deposit at the front desk
    Then the N+1 enrollment appears in the preparation list with the deposit collected and the receipt issued
    And the class progress table moves the student to "confirmed"
    And no further reminder is sent to this family

  Scenario: Rollover with no re-entry (MVP wave 2)
    Given year-end decisions entered by leadership for a 5AP class
    When the rollover creates the 6AP enrollments for year N+1
    Then every promoted student receives a PRE-ENROLLED N+1 enrollment linked to their existing identity
    And all 5AP enrollments move to COMPLETED with their decision, including students leaving at the start of the next year
    And no identity is recreated or duplicated
