@BEH-ZS-006 @mvp
Feature: Current-term grades import

  Scenario: A resolvable grade row commits a Mark attached to the student's real Enrollment
    Given a grade row for an enrolled student, a real subject, and a real evaluation period
    When the batch commits
    Then a Mark is created, attached to the student's Enrollment

  Scenario: A grade recorded on a scale other than /20 is normalized before storage
    Given a grade row with a value of 8 out of a scale of 10
    When the batch commits
    Then the stored Mark value is 16

  Scenario: Two students graded in the same class, subject, and period share one synthesized Assessment
    Given two enrolled students graded on the same subject and evaluation period
    When the batch commits
    Then exactly one Assessment exists for that subject and period

  Scenario: A row referencing a student with no matching Enrollment is an error, not silently skipped
    Given a grade row referencing a Massar code with no matching Enrollment
    When the grade rows are analyzed
    Then the row is rejected with a reason naming the missing enrollment

  Scenario: Re-importing the same grade row is idempotent
    Given a grade row already committed once
    When that same row is committed again
    Then no duplicate Mark is created
