@REQ-ZS-328 @JNY-ZS-050 @BEH-ZS-231 @BEH-ZS-232 @v1
Feature: Tracking the AREF 8-hour weekly cap

  Scenario: Cross-school total and a cap alert (V1)
    Given Hassan, "public-sector outside teacher," with 6 weekly hours at School A
    And 2 weekly hours declared at School B
    And Hassan having consented to sharing his total with his schools
    When School B adds a one-hour assignment to its timetable
    Then the total shown to Hassan moves to "9 hours out of 8"
    And School B's leadership receives a binary alert "cap exceeded across all affiliations" with no detail of hours at School A
    And saving stays possible with a justification entered by the school

  Scenario: Confidentiality with no sharing consent (V1)
    Given Hassan has not consented to sharing his total
    When School B views Hassan's affiliation
    Then it sees only its own hours and the status of his AREF authorization
    And no information on the existence or volume of other affiliations is shown

  Scenario: The monthly list for AREF (V1)
    Given the past month's timetables and hours worked at School A
    When leadership generates the monthly list of public-sector outside teachers
    Then the export contains, for each: identity, timetables, and hours worked
    And the export is timestamped in UTC+0 and kept in the school's file
