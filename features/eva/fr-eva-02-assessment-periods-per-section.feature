@REQ-ZS-100 @BEH-ZS-112 @mvp
Feature: Assessment periods per section (MVP)
  Scenario: Bilingual section on trimesters
    Given the bilingual pilot school whose section runs on three trimesters
    When the school leadership instantiates the 2026-2027 periods
    Then three periods bounded within the calendar are created with the default Massar mapping (T1 -> S1, T2 -> S1 then S2, T3 -> S2)
    And the continuous-assessment export produces two semester averages recomputed from dated grades
  Scenario: Cloning without grades
    Given the 2026-2027 periods closed
    When the structure is cloned to 2027-2028
    Then the periods are reproduced with shifted dates and no grade is copied
