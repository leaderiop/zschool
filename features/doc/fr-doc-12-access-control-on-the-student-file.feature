@REQ-ZS-125 @BEH-ZS-142 @mvp
Feature: Access control on the student file

  Scenario: Unauthorized viewing of a court ruling
    Given a custody ruling filed as "school-leadership confidential" in a student's file
    When a teacher opens the student's file
    Then the document is neither visible nor downloadable
    And the refused access attempt is logged with author, context and timestamp

  Scenario: Authorized viewing logged
    Given a front-desk staff member authorized for administrative documents
    When they view a student's birth certificate
    Then the view is logged with author, context and timestamp
    And the document stays unchanged (no edit possible from viewing)
