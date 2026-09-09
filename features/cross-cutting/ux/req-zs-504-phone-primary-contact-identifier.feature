@REQ-ZS-504 @UX-ZS-009 @mvp
Feature: Phone as the primary contact identifier

  Scenario: Creating an account with no email address
    Given a parent with no active email address
    When they create their account
    Then only the mobile number is required, in international format with +212 suggested by default
    And the email address stays optional at every step
    When they enter the code received by SMS
    Then their account is active immediately

  Scenario: Access recovery with no email
    Given an account created with a mobile number and no email
    When the user requests an access reset
    Then the verification code is sent by SMS to the registered number
    And no screen requires an email address to continue

  Scenario: Activating access for a student with no phone of their own (MVP)
    Given a logged-in legal guardian whose 2AC-level child has no mobile number
    When they activate student access from the child's record
    Then the platform generates a readable login identifier for the student and asks for an initial password
    And the confirmation code is sent to the guardian's number
    And the student can then open their own session on the family phone, distinct from the guardian's
