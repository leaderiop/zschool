@REQ-ZS-242 @BEH-ZS-302 @v2
Feature: Activating the health module

  Scenario: Activation blocked with no F112 authorization
    Given a school whose health-data processing has no CNDP authorization on record
    When the principal attempts to activate the health module
    Then activation is refused with a request for the F112 reference
    And no health record can be created for any student

  Scenario: An inactive record with no consent
    Given an enrolled student for whom no legal guardian has consented to health-data processing
    When the nurse searches for that student's health record
    Then the record appears in state "empty" with the note "consent not obtained"
    And no entry is possible until consent is recorded
    And a refused consent blocks neither the student's enrollment nor their re-enrollment

  Scenario: Consent from a single legal guardian, the other notified
    Given a student whose father and mother are both legal guardians
    When the mother records health consent from her account
    Then the record becomes activatable and the father receives a notification of the consent
    And if the father raises a disagreement, the conflict is escalated to the school for arbitration with no ruling from ZSchool
