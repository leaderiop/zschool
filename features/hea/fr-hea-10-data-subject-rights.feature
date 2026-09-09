@REQ-ZS-248 @BEH-ZS-310 @v2
Feature: Data subject rights

  Scenario: The adult student restricts parental access
    Given a student who has become an adult with a complete health record
    When they restrict parental access to health data from their account
    Then their legal guardians immediately lose read and write access to the record
    And the restriction is logged and notified to the school

  Scenario: Revocation hides alerts
    Given a student with an allergy alert visible to the homeroom teacher
    When their legal guardians revoke health consent
    Then the alert is immediately hidden from homeroom-teacher and student-life views, with propagation to open clients guaranteed within at most 24 hours
    And the record moves to state "frozen" with no possible write by the school
    And the revocation is logged
