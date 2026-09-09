@REQ-ZS-483 @PAK-ZS-008 @v1
Feature: Consolidated invoice for a school group
  Scenario: A two-school organization
    Given an organization grouping a primary school with 300 active students
    And a middle-and-high school with 800 active students as of November 1, 2026
    When the organization's monthly billing runs
    Then a consolidated invoice of 5,500 MAD is issued in the organization's name
    And it details 1,500 MAD for the primary school and 4,000 MAD for the middle-and-high school
    And no student is counted at both schools
