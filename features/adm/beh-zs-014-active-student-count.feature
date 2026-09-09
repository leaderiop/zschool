@REQ-ZS-018 @BEH-ZS-014 @mvp
Feature: Counting active students

  Scenario: Monthly count and a mid-month transfer (MVP)
    Given School A with 300 ACTIVE enrollments at midnight on March 1st, Morocco time
    And a student transferred from A to B on March 12th
    When the April count is run
    Then the student is counted at B and not at A in April
    And for the month of March they were counted only once, at A
    And each count is recorded as an append-only entry in the usage statement
