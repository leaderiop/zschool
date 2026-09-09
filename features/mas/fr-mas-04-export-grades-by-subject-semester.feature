@REQ-ZS-229 @BEH-ZS-264 @mvp
Feature: Exporting a class's first-semester grades with validation

  Scenario: Export blocked by blocking anomalies
    Given class 2AC-B for the first semester of 2026-2027 with the active template "grades-2AC-S1"
    And a student with no Massar code and a test grade out of range (22 out of 20) in the math subject
    When leadership requests the math export for 2AC-B for semester 1
    Then the validation report is produced before any final download
    And it lists the out-of-range grade as a blocking anomaly and the missing Massar code as a warning
    And the final file cannot be downloaded while a blocking anomaly remains

  Scenario: A compliant export handed to the log
    Given the same class with all blocking anomalies corrected
    When leadership relaunches generation and validates a report that only contains warnings
    And confirms submission with a reason for the remaining warnings
    Then the file is downloaded with a kept fingerprint
    And the export log records author, timestamp, template and version, exact scope, the report, and the confirmation

  Scenario: A trimestral school exported by Massar semester
    Given a bilingual school on three trimesters with the default mapping (T1 to S1, T2 to S1 until January 31 then S2, T3 to S2)
    And math grades dated October 15, January 20, and March 10 in 2AC-B
    When leadership requests the math export for 2AC-B for semester 1
    Then the file carries the October 15 and January 20 grades with a semester-1 average recomputed from those grades
    And the March 10 grade is reserved for the semester-2 export
    And the trimestral averages published to families stay unchanged
