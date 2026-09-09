@REQ-ZS-325 @JNY-ZS-047 @mvp
Feature: Preparing averages before the council

  Scenario: Non-compliance warning before closing (MVP)
    Given the subject "Math — 2AC-3" with two assessments entered
    And the school rule requiring at least one unified assessment per semester
    When Khadija opens the period's compliance check
    Then the subject is flagged "non-compliant: unified assessment missing"
    When Khadija enters and submits the unified assessment
    Then the subject moves to "compliant" status for the period

  Scenario: Visibility limited to her subjects' averages (MVP)
    Given the period closed by leadership
    When Khadija views her class's results
    Then she sees the averages and report cards for her subjects only
    And other subjects' remarks and the general remark are not visible
