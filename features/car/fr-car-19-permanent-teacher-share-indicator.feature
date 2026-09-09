@REQ-ZS-205 @BEH-ZS-239 @v1
Feature: Permanent-teacher share indicator (V1)

  Scenario: Crossing below the threshold
    Given a school with 40 active teachers, 33 of them permanent, and a threshold set at 80%
    When a new part-time affiliation is activated, bringing the headcount to 41 with 33 permanent
    Then the indicator shows 80.5% and stays above the threshold
    When a second part-time affiliation is activated (42, with 33 permanent)
    Then the indicator shows 78.6% and leadership receives a non-blocking alert
