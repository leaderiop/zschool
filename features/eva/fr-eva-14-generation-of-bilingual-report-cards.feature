@REQ-ZS-111 @BEH-ZS-124 @mvp
Feature: Generation of bilingual report cards (MVP)
  Scenario: Bilingual report card for a national-system class
    Given the default bilingual template for the middle-school cycle and class 2AC-3 closed for semester 1
    When the school leadership generates the class's report cards
    Then each PDF report card carries the student's identity in dual script, subjects with weightings, averages, rank, honors and remarks
    And the Arabic layout renders right-to-left with correct Arabic fonts
    And the weighting table and its text reference appear on certifying-level report cards

  Scenario: Generation under a performance constraint
    Given a school of 2,000 students whose classes are all closed
    When the school leadership starts generating all report cards
    Then each report card is produced in under 3 seconds and the full batch in under 10 minutes
