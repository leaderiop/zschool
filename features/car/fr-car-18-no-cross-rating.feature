@REQ-ZS-204 @BEH-ZS-238 @mvp
Feature: Structural absence of cross-rating (all versions)

  Scenario: No rating function is exposed
    Given a principal viewing a teacher's affiliation card
    When they browse every available action
    Then no rating, review, recommendation, or ranking action exists
    And no free-text "teacher appraisal" field is shared outside the school

  Scenario: A verified period carries no judgment
    Given a verified affiliation period viewed by another school on the teacher's share
    When that school opens the period
    Then it sees school, years, roles, and contract nature, and nothing else
