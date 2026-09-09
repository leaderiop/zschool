@REQ-ZS-276 @JNY-ZS-002 @mvp
Feature: Multi-site year rollover

  Scenario: Year-end decisions entered in bulk (MVP wave 2)
    Given a Grade 8 class at Site A whose annual results are closed
    When the site director enters "promoted" for 31 students and "repeating" for 2 students
    Then every active or suspended enrollment for year N carries a year-end decision
    And the general director's consolidated view reflects the decisions across all three sites
    And no student without a decision is offered for N+1 enrollment creation

  Scenario: Bulk creation of N+1 enrollments with guaranteed uniqueness (MVP wave 2)
    Given year-end decisions validated across the three sites
    And a Grade 9 student already pre-enrolled in the common track by the re-enrollment campaign
    When the batch process creates the N+1 enrollments
    Then every promoted student receives a PRE-ENROLLED enrollment at the next level in their school
    And every repeating student receives a PRE-ENROLLED enrollment at the same level
    And the streamed student receives a PRE-ENROLLED enrollment in their school's chosen track
    And the student already pre-enrolled by the campaign receives no second enrollment
    And no (student, school year) pair carries more than one ACTIVE or SUSPENDED enrollment
    And every year-N enrollment is closed to COMPLETED with its decision and never deleted

  Scenario: Departure at the next start of year with no loss of decision (MVP wave 2)
    Given a student promoted to Grade 4 whose family announces a move to another school at the next start of year
    When the rollover runs
    Then their year-N enrollment is COMPLETED with the decision "promoted"
    And no N+1 enrollment is created for them at the school
    And their year-N enrollment is neither TRANSFERRED nor WITHDRAWN
    And the default transfer profile carries their year-end decision

  Scenario: Structure cloning without copying students (MVP wave 2)
    Given the complete academic structure of year N for a school
    When the site director clones the structure to year N+1
    Then the levels, subjects, coefficients, and grading scales are copied
    And no enrollment and no student is copied
    And coefficients stay carried by level and track
