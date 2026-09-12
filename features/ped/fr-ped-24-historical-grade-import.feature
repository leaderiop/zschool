@BEH-ZS-006 @mvp
Feature: Historical grades import

  Scenario: A historical grade row creates an archival year, a completed Enrollment, and a Mark
    Given a historical grade row for a new student in a prior year the school never ran on the platform
    When the batch commits
    Then a born-closed archival AcademicYear is created for that label
    And the student's Enrollment in it is "completed"
    And a Mark is created for the row

  Scenario: Re-importing into the same historical year label reuses the same archival year
    Given a historical grade row already committed into a historical year label
    When another historical grade row for a different student is imported into the same label
    Then only one archival AcademicYear exists for that label

  Scenario: A Massar-code match is proposed, not auto-linked
    Given a student already imported into one historical year
    When a second historical row with the same Massar code is imported unconfirmed
    Then the row is awaiting confirmation and no new Person is created

  Scenario: Importing into a label already used by a real, platform-operated year is refused
    Given a school with a genuine, non-archival academic year already on file
    When a historical batch is imported using that same year label
    Then the import is refused rather than writing into the live year
