@REQ-ZS-310 @JNY-ZS-038 @mvp
Feature: Adult student and disciplinary data

  Scenario: parental-access restriction on disciplinary data (MVP mechanism; V1 disciplinary effect)
    Given a 2nd-year baccalaureate student, 18 years reached, holder of her account
    And a disciplinary incident recorded concerning her
    And her parents are informed by default as long as no restriction is recorded
    When the student restricts her parents' access to disciplinary data
    Then the restriction is logged and notified to the school
    And subsequent disciplinary notifications are no longer addressed to the parents but to the student herself
    And the disciplinary file stays invisible outside the school
