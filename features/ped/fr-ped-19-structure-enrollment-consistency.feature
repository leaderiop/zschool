@REQ-ZS-065 @BEH-ZS-069 @mvp
Feature: Structure/enrollment consistency

  Scenario: A closed year is read-only
    Given year 2026-2027 closed by the rollover
    When the director attempts to rename a class from this year
    Then the change is refused, with the year remaining viewable for archiving and certificates
