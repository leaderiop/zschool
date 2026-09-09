@REQ-ZS-173 @BEH-ZS-194 @v1
Feature: Electronic parental authorization for an outing

  Scenario: Acceptance by the legal guardian
    Given a school outing published for class 6AP-1 with a D-2 response deadline
    And a legal guardian holding their own parent account
    When the guardian confirms the authorization from their mobile
    Then the acceptance is timestamped, linked to the enrollment and logged
    And the organizer immediately sees the authorization granted in their class list

  Scenario: No response by the deadline
    Given a response deadline reached and a parent with no response
    When the deadline passes
    Then the parent receives a final reminder on their active channels
    And a student with no granted authorization cannot be enrolled on the outing
    And the organizer sees the student in a pending or not-authorized status

  Scenario: Objection from the second legal guardian
    Given an authorization granted by the father, the legal guardian
    When the mother, a legal guardian, objects within 24 hours
    Then the authorization moves to "contested" status and the school is notified for arbitration
    And the student is not enrolled on the outing until the arbitration is recorded
