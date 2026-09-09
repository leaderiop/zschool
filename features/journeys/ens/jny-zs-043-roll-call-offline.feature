@REQ-ZS-322 @JNY-ZS-043 @BEH-ZS-070 @mvp
Feature: Taking roll call for her courses on mobile

  Scenario: Offline roll call in class then sync (MVP)
    Given Khadija in the room for the declared session "Math — 2AC-3, 8 a.m." with no network
    When she marks two students absent and one late, then validates the roll call
    Then the markings are kept locally with a timestamp
    And the screen shows "validation awaiting sync"
    When the connection returns
    Then the synced roll call triggers, after the 3-minute hold window, notification of the two absent students' guardians if it is their first absence of the day
    And the notification is delivered in under 5 minutes after synchronized validation

  Scenario: A declared session with no timetable (MVP)
    Given School A with no timetable entered
    When Khadija opens "My courses today" and declares the session "Math — 2AC-3" on the 8 a.m. slot
    Then the session is created only once for this course, date, and slot
    And the session's roll call is offered immediately

  Scenario: Limited to her courses' students (MVP)
    Given a School A student enrolled in a class where Khadija does not teach
    When Khadija opens her course's roll-call list
    Then this student does not appear in the list
    And no search for a student outside her assignments is possible from the roll-call screen
