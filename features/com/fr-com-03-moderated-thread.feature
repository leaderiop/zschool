@REQ-ZS-165 @BEH-ZS-183 @mvp
Feature: Moderated parent-teacher discussion thread (MVP)

  Scenario: Opened by the teacher, with the parent replying
    Given a teacher assigned to the math course of class 3AC-2
    And a school whose configuration disallows parental thread initiation
    When the teacher opens a thread with the legal guardian of a student in this course
    Then the thread is created, linked to the student's enrollment, the interface staying bilingual and messages written in their author's own language (UX-ZS-08)
    And the parent can reply within this thread
    And the parent cannot initiate a thread or write to a teacher outside their child's courses

  Scenario: Traced viewing by the school leadership
    Given a thread open between a parent and a teacher
    When a member of the school leadership opens this thread
    Then the view is logged with author, context and timestamp
    And both participants see the possible-school-leadership-view indicator at all times
    And the thread is neither censored nor removed by the school leadership (see OQ-ZS-114)
