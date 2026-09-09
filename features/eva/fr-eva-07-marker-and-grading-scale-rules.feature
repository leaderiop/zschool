@REQ-ZS-105 @BEH-ZS-117 @mvp
Feature: Marker and grading-scale calculation rules (MVP)
  Scenario: Unjustified absence counted as 0
    Given a default "unjustified absence = 0" rule for level 2AC
    And a student marked absent without justification for a test weighted 1, with 12 and 16 on the other two tests
    When the subject average is computed
    Then it equals 9.33 out of 20
    And the report card states the rule applied

  Scenario: Exemption excluded from the denominator
    Given a student exempted from physical education for the period
    When the overall average is computed
    Then the subject is excluded from the weighted denominator and shows "exempted" on the report card

  Scenario: Grading scale out of 10 normalized
    Given an assignment graded out of 10 with the value 7 and a test out of 20 with the value 12, of equal weighting
    When the subject average is computed
    Then the grade of 7/10 is normalized to 14/20 before weighting and the average equals 13/20

  Scenario: Class change mid-period
    Given a student who moved from class 2AC-1 to class 2AC-3 on October 15, with two grades entered in 2AC-1
    When semester 1 is closed
    Then their grades from 2AC-1 are kept on their enrollment and count toward their averages
    And their rank is computed among the students of class 2AC-3
