@REQ-ZS-324 @JNY-ZS-046 @ADR-ZS-034 @mvp
Feature: Messages to her students' parents in moderated mode

  Scenario: Opening a thread with a student's parent (MVP)
    Given Khadija teaches a student, Youssef, at School A
    When Khadija opens a thread with Youssef's guardian
    Then the thread is created in School A's context and the parent is notified
    And the parent can reply in the thread with no ability to start another thread
    And the interface shows that leadership can view threads (ADR-ZS-034)

  Scenario: Unable to write to parents outside her courses (MVP)
    Given a student in a School A class where Khadija does not teach
    When Khadija searches for this student's parents from messaging
    Then no result is returned
    And no path to message these parents is offered (INV-ZS-091)

  Scenario: Leadership viewing a thread (MVP)
    Given a thread open between Khadija and one of her students' guardians
    When leadership views the thread
    Then the viewing is logged with author, context, and timestamp
    And the notice of this capability stays shown in the thread
