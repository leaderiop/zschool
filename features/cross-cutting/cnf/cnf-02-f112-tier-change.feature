@REQ-ZS-550 @CNF-ZS-008 @v1
Feature: Tier change into the F112 authorization

  Scenario: National ID field disabled at MVP
    Given a pilot school whose F112 authorization is not yet on record
    When the registrar opens a parent's record
    Then the "national ID number" field is disabled with a note about the formality in progress
    And the adult's identity relies on first name, last name, date of birth, and mobile number

  Scenario: A national ID number entered in a record (once the field is activated)
    Given a school declared under F211 with no F112 authorization
    When a user records a parent's national ID number in their identity documents
    Then a banner informs them that the national ID number subjects the processing to prior CNDP authorization
    And a "request an F112 authorization" task is created in the compliance assistant
    And the task's reference appears in the processing register
