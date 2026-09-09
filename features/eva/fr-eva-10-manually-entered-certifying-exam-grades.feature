@REQ-ZS-108 @BEH-ZS-120 @mvp
Feature: Manually entered certifying-exam grades (MVP)
  Scenario: Entering regional-exam results
    Given the 3AC regional-exam results sent by the ministry in July 2027
    When the front desk enters each student's grade with the session and subject
    Then each grade carries the source "ministry", the author and the timestamp
    And the weighted summary from BEH-ZS-119 is recomputed and the "undetermined" decision may be updated (BEH-ZS-123)
  Scenario: Grade protected after closing
    Given a regional-exam grade entered and then the period closed
    When a user attempts to edit it
    Then the edit requires the school leadership's logged unlock procedure
