@REQ-ZS-066 @BEH-ZS-070 @mvp
Feature: Expected sessions with no timetable

  Scenario: A simple weekly grid declared by student life
    Given class 2AC-3 and a declared grid "Monday 8am-9am: math; Monday 9am-10am: Arabic"
    When Monday, September 21, 2026 arrives
    Then two expected sessions are generated for 2AC-3 that day and appear in student life's expected roll calls
    And no session is generated on a Sunday or a calendar holiday

  Scenario: A session created on the fly by the teacher
    Given a physics course for 3AC-1 with no expected session declared that day
    When the teacher opens roll call and chooses the "10am-11am" slot
    Then a session (physics 3AC-1, today's date, 10am-11am) is created and roll call is attached to it
    And a second attempt on the same triplet redirects to the existing roll call instead of creating a duplicate
