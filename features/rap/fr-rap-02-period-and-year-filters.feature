@REQ-ZS-214 @BEH-ZS-242 @mvp
Feature: Period and school-year filters

  Scenario: Changing the period without a reload
    Given a principal on the 2026-2027 dashboard, "semester 1" period
    When they select the period "semester 2"
    Then every indicator shown is recomputed for semester 2 without a full page reload
    And the export launched afterward carries the "semester 2" filter

  Scenario: A school with trimesters
    Given a school whose assessment periods are trimestral
    When a user opens the period selector
    Then the school's three trimesters are offered, not semesters
