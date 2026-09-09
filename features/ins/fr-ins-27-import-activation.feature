@REQ-ZS-049 @BEH-ZS-047 @mvp
Feature: Enrollment activation via import (MVP)

  Scenario: Catch-up for a school activated mid-year
    Given an import file of 350 students with effective date 07/09/2026, class, legal guardian, and financial guardian filled in for 340 of them
    When the director commits the import
    Then 340 enrollments are created ACTIVE with the reason "import activation — data catch-up"
    And 10 enrollments are created PRE-ENROLLED and listed for completion
    And each legal guardian receives their claim code and confirms acceptances when claiming the account
    And no second ACTIVE enrollment exists for the same student and the same year
