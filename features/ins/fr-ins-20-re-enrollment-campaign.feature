@REQ-ZS-042 @BEH-ZS-040 @mvp
Feature: Re-enrollment campaign

  Scenario: Converting a confirmed re-enrollment
    Given a re-enrollment campaign open for 2027-2028 with a configured deposit
    And a student Adam in the senior preschool group at School B, eligible for CP
    When the legal guardian confirms re-enrollment from their account
    Then a 2027-2028 enrollment is created in PRE-ENROLLED state at level CP, pre-filled (guardians, arrangement, options)
    And the reservation deposit is requested from the guardian
    And the N+1 payment schedule and the sibling discount are prepared by finance
    And the campaign dashboard moves the file to "confirmed"

  Scenario: Reminding non-responders (V1)
    Given a campaign open for three weeks with files still without a response
    When the scheduled reminder date is reached
    Then the guardians concerned receive a reminder on their configured channels
    And each send is logged with its channel and cost in the campaign tracker

  Scenario: Moving to ACTIVE once the deposit is collected
    Given a confirmed re-enrollment in PRE-ENROLLED state with the deposit requested
    When the deposit collection is recorded by finance (PaymentReceived event)
    Then the N+1 enrollment's activation conditions are met (BEH-ZS-032)
    And the enrollment can move to ACTIVE state
