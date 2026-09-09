@REQ-ZS-422 @SEC-ZS-016 @mvp
Feature: Strengthened encryption of identity documents

  Scenario: Viewing an identity document in a student's file
    Given an identity document filed in a student's record
    When an authorized registrar's-office staff member opens the document
    Then the view is logged with author, school context, and timestamp
    And the document appears in no notification and in no export outside a controlled procedure

  Scenario: Denial for an unauthorized role
    Given the student's course teacher
    When they attempt to open the identity document in the record
    Then access is denied and the attempt is logged
