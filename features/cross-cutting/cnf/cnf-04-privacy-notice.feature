@REQ-ZS-551 @CNF-ZS-009 @mvp
Feature: Privacy notice at enrollment

  Scenario: Enrolling a new student at the front desk
    Given a complete enrollment file for student Youssef
    When the registrar submits the enrollment for the guardian's signature
    Then the full privacy notice is displayed first, in FR or AR per the interface language
    And acceptance is possible only after it is displayed, and carries the notice's version
    And the operation is logged with the author, timestamp, and version accepted

  Scenario: A student comes of age
    Given a student who turns 18
    When civil majority is detected at their next login
    Then the student receives an information message about their rights (account ownership, restricting parental access)
    And the information is logged
