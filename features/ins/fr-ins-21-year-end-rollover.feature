@REQ-ZS-043 @BEH-ZS-041 @mvp
Feature: Bulk year-end rollover (MVP wave 2)

  Scenario: Decisions, N+1 enrollment creation, and year-end departures
    Given school year 2026-2027 with 640 ACTIVE enrollments, of which 600 promoted, 30 repeating, and 10 students leaving the school for the following school year
    And 120 of the 600 promoted students already PRE-ENROLLED for 2027-2028 via the re-enrollment campaign
    And the 2027-2028 structure cloned from 2026-2027
    When the director executes the rollover to 2027-2028
    Then the 640 enrollments move to COMPLETED with their year-end decision, including the 10 departing students
    And 510 2027-2028 enrollments are created in PRE-ENROLLED state (next level for the promoted, same level for those repeating)
    And no second 2027-2028 enrollment is created for the 120 already-pre-enrolled students
    And the 10 departing students have no 2027-2028 enrollment, and their year-end decision appears in their transfer profile
    And the bulk operation is logged and viewable

  Scenario: Interrupted execution and resumption with no duplicates
    Given a rollover interrupted after processing 4 of 20 classes
    When the director resumes execution
    Then only the remaining classes are processed
    And no N+1 enrollment is created twice
