@REQ-ZS-323 @JNY-ZS-044 @mvp
Feature: Evening grade entry on mobile

  Background: Khadija is a part-time math teacher at two Rabat schools
    And her affiliation to School A is active with an assignment on "Math — 2AC-3"
    And the period "First semester" is open for entry

  Scenario: Complete entry and validation of an assessment (MVP)
    Given Khadija signed in in the "School A — teacher" context
    And an assessment "Test 1" on a scale of 20 linked to her course
    When she enters grades for her 31 students, including "12.5" entered with a comma
    And she validates the entry
    Then every grade is recorded with author, course, period, and a UTC+0 timestamp
    And the assessment moves to "submitted" status and feeds the subject average
    And no grade is visible to families until published (a report card, or progressive publication if the school enables it)

  Scenario: A network outage during entry then resumption with no loss (MVP)
    Given 18 grades already entered in the evening's grid
    When the mobile connection is interrupted
    Then the 18 grades are kept in a local draft on the device
    And the screen shows "local save awaiting sync"
    When the connection returns and Khadija finishes and validates the entry
    Then all 31 grades sync with no re-entry and no loss
    And no duplicate assessment is created by the resync

  Scenario: Leadership lock at period closing (MVP)
    Given Khadija's entry validated for the "First semester" period
    When leadership closes the period
    Then every assessment for the period moves to read-only for the teacher
    And any edit attempt is refused with a correction-request option offered
    And the correction request is logged with author, context, and timestamp

  Scenario: An out-of-scale grade refused on entry (MVP)
    When Khadija enters "21" for an assessment on a scale of 20
    Then the value is refused with the message "grade above the scale"
    And the cell stays in edit mode until corrected
