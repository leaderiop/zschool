@REQ-ZS-004 @BEH-ZS-289 @v2
Feature: Enrollment in a capacity-limited activity

  Scenario: Quota reached
    Given an activity limited to 15 seats with 15 validated enrollments
    When a parent attempts to enroll their child from the portal
    Then the request is placed on a waiting list
    And the front office sees the request and can validate it when a seat frees up
