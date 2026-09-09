@REQ-ZS-558 @CNF-ZS-019 @mvp
Feature: Restricting a parent's access

  Scenario: Restriction with no court decision
    Given an active parent–student relationship
    When a user attempts to restrict the father's access with no court document
    Then the operation is refused with the message "restriction is possible only on a court decision"
    And no rights change is recorded

  Scenario: Restriction based on a recorded decision
    Given a restrictive court order provided by the school
    When the principal's office records the decision with a reference and a supporting document
    Then the targeted parent's access and notifications are immediately suspended per the decision's scope
    And the other guardians keep their rights
    And the operation is logged with its associated supporting document
