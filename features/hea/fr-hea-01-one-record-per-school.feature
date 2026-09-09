@REQ-ZS-241 @BEH-ZS-301 @v2
Feature: One health record per school

  Scenario: Two schools, two independent records
    Given a student enrolled ACTIVE at "School A" with a complete health record
    And a second enrollment of that student at "School B" the following year, after a transfer
    When "School B"'s infirmary opens the student's health record
    Then it finds an empty record specific to "School B", pending the legal guardians' consent
    And "School A"'s record stays invisible from "School B" and follows its own deletion deadline
