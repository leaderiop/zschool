@REQ-ZS-300 @JNY-ZS-021 @mvp
Feature: Mid-year resumption

  Scenario: A payment schedule resumed with five monthly payments settled (MVP)
    Given a student whose September-to-January monthly payments were settled before adopting ZSchool
    When the secretary imports the financial resumption file
    Then the payment schedule shows five payments paid on the imported dates and five still due
    And no reminder is sent for the settled payments
    And the enrollment is ACTIVE with the activation reason "data resumption"
