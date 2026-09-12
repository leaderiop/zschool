@BEH-ZS-006 @BEH-ZS-007 @mvp
Feature: Teacher import

  Scenario: A bulk-imported teacher's affiliation is invited, never active
    Given a new teacher import row for a school
    When the batch commits
    Then a SchoolMembership is created in "invited" status
    And no TeacherAssignment is created

  Scenario: A Massar-code match is proposed, not auto-linked
    Given a teacher with a Massar code already affiliated with another school
    When a second school imports a teacher row with the same Massar code and no confirmation
    Then the row is awaiting confirmation and no new Person is created

  Scenario: A teacher already affiliated elsewhere can hold a second, simultaneous affiliation
    Given a teacher already invited at one school
    When another school imports and confirms the same matched teacher
    Then both schools have their own SchoolMembership for that teacher

  Scenario: Re-importing an already-invited teacher is idempotent
    Given a teacher already invited at a school
    When that school imports the same confirmed teacher row again
    Then no duplicate SchoolMembership is created

  Scenario: A missing required teacher field is rejected with a specific reason
    Given a teacher import row missing a required first name
    When the teacher rows are analyzed
    Then the row is rejected with a reason naming the first name field
