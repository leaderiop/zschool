@REQ-ZS-074 @BEH-ZS-081 @mvp
Feature: Taking roll call for a course on mobile

  Scenario: Standard roll call for a course with all students present
    Given a teacher assigned to the math course for class 2AC-B this Monday at 8:00am
    And an expected session declared (math 2AC-B, Monday, 8am–9am)
    And the list of students enrolled in this course loaded on their phone
    When the teacher confirms roll call with no student marked absent
    Then a roll call is created for this session with the date, the slot, and the attendance list
    And the roll call carries the status "confirmed," its author, and its timestamp
    And no AbsenceRecorded event is produced

  Scenario: Only one roll call per session
    Given a roll call already confirmed for the session (math 2AC-B, Monday, 8am–9am)
    When the supervisor opens roll call for the same course on the same slot
    Then the system shows the existing roll call in logged-correction mode instead of creating a second one

  Scenario: Half-day roll call for a primary class
    Given a school configured for half-day roll call in primary
    And a supervisor authorized for the primary cycle
    When the supervisor confirms the morning half-day roll call for class CE2-A with one absentee
    Then the roll call is tied to the class and the morning half-day
    And an AbsenceRecorded event is produced for the absent student
