@REQ-ZS-107 @BEH-ZS-119 @mvp
Feature: Period average computation
  Scenario: Subject average with the lowest grade excluded
    Given a calculation rule excluding the lowest grade beyond three grades
    And a student who scored 12, 8, 15 and 17 in mathematics out of 20
    When the subject average is computed
    Then the grade of 8 is excluded and the resulting average is 14.67 out of 20
    And the report card states the exclusion rule and rounding applied

  Scenario: Overall average weighted by subject weightings
    Given the subject weightings defined per level and track
    And a student's subject averages
    When the overall average is computed
    Then each subject counts according to its weighting, not uniformly
    And the rank is computed within the class, with ties handled

  Scenario: Subject not graded at closing
    Given a class whose "Visual Arts" subject carries no grade in semester 1
    When the overall average is computed at closing
    Then the subject is excluded from the overall average
    And the report card shows "NG" for that subject, with the other weightings unchanged

  Scenario: Student excluded from rank
    Given a student who arrived on December 20 and is flagged "excluded from rank" by the school leadership
    When semester-1 ranks are computed
    Then the student is marked "unranked" and keeps their averages
    And the class ranking of the other students is established without them
