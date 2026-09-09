@REQ-ZS-221 @BEH-ZS-251 @v1
Feature: Preparing ESISE data

  Scenario: Completeness check before submission
    Given a school of 812 students preparing the May census
    And the "1AC female headcount" field auto-filled from ACTIVE 1AC enrollments
    And the "number of part-time teachers" field of the HR referential with no source filled in for 3 affiliations under an unqualified contract
    When leadership opens the census preparation screen
    Then each field shows its ZSchool source, computed value, and completion rate
    And the 3 affiliations under an unqualified contract show up as anomalies with a link back to their affiliation records
    And the "mark ready for submission" button stays unavailable while a blocking anomaly remains

  Scenario: Per-school isolation
    Given an organization of two schools A and B
    When school A's leadership prepares its ESISE data
    Then the dataset produced contains only tenant A's data
    And no consolidated A+B file is offered
