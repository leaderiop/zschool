@REQ-ZS-247 @BEH-ZS-307 @v2
Feature: Retention and deletion of health records

  Scenario: Deletion one year after the end of schooling
    Given a student who left the school in June 2026, the enrollment closed
    And a complete health record with an active alert and an attached vaccination record
    When the end-of-schooling-plus-1-year deadline is reached
    Then the record, its versions, its alert, and its medical documents are deleted
    And the log keeps access traces with no medical content
    And legal guardians and leadership were warned 30 days before the purge

  Scenario: The adult student stays the holder until the purge
    Given an adult student who has left the school
    When they request access to their record before the deletion deadline
    Then access is granted per the personal-data-rights procedure
    And after the deadline, deletion makes the request moot
