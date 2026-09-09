@REQ-ZS-244 @BEH-ZS-304 @v2
Feature: Least-privilege allergy alerts

  Scenario: The homeroom teacher sees the alert, not the record
    Given a 2AC-3 student with an alert "peanut allergy — high severity"
    And a 2AC-3 homeroom teacher
    When they view their class list
    Then the alert badge and short label appear on the student
    And no button gives them access to the full record or to treatments

  Scenario: Student life staff are bounded to their cycles
    Given a supervisor assigned to the middle-school cycle only
    When they view student-life views
    Then upper-secondary students' alerts do not appear
    And middle-school alerts appear with no access to the full record
