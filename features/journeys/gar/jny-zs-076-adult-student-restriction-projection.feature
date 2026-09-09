@REQ-ZS-361 @JNY-ZS-076 @mvp
Feature: Parental-access restriction by the adult student

  Scenario: A school and disciplinary restriction with finance maintained
    Given an 18-year-old student enrolled in 2nd-year baccalaureate
    And her father registered as financially responsible and owing fees
    When the student restricts her parents' access to school and disciplinary data
    Then the father's and mother's portals no longer show grades, absences, report cards, or school documents
    And the father keeps access to financial and contractual data as long as he owes fees
    And the restriction is logged and notified to the school
    And both parents are informed of the restricted scope

  Scenario: Information on rights at majority
    Given a student reaching 18 during the school year
    When the majority event is issued
    Then the student receives information on her rights in her portal
    And she receives this information again at the next re-enrollment
    And no parental access changes until she exercises her restriction power
