@REQ-ZS-110 @BEH-ZS-123 @mvp
Feature: End-of-year decisions (MVP, wave 2)
  Scenario: Bulk entry of a class's decisions
    Given class 2AC-3 with semester 2 of the 2026-2027 school year closed
    When the director enters "promoted to the next level" for 28 students and "repeating the year" for 2 students
    Then each decision is recorded with author and timestamp and shown on the end-of-year report card
    And the class's bilingual simplified minutes are generated and archived
    And the decisions are available for the BEH-ZS-041 rollover

  Scenario: Certifying level awaiting results
    Given class 3AC-1, whose regional exam is held after the June closing
    When the director runs the rollover
    Then each student's decision is "undetermined"
    And once results are imported in July, it is updated to "promoted" or "repeating" with the update traced
