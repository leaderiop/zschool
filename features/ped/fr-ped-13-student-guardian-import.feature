@REQ-ZS-010 @REQ-ZS-029 @REQ-ZS-030 @REQ-ZS-034 @REQ-ZS-049 @BEH-ZS-006 @BEH-ZS-026 @BEH-ZS-027 @BEH-ZS-031 @BEH-ZS-047 @mvp
Feature: Student and guardian import

  Scenario: A Massar-code match is proposed, not auto-linked
    Given a student with a Massar code already enrolled at another school
    When a second school imports a student row with the same Massar code and no confirmation
    Then the row is awaiting confirmation and no new Person is created

  Scenario: A weak match by name and date of birth is an alert only
    Given a student named "Amina Tazi" born on "2015-03-01" with no Massar code, enrolled at another school
    When another school imports a student row with the same name and date of birth, unconfirmed
    Then the row commits as a new, separate Person rather than merging

  Scenario: Guardians shared by siblings are committed once
    Given an import batch with two student rows sharing one guardian's mobile number
    When the batch commits
    Then exactly one guardian Person is created for that mobile number and both students are linked to it

  Scenario: A student with both guardian types and a past effective date is enrolled active
    Given a student row with an effective date in the past, a resolved class, a legal guardian, and a financial guardian
    When the batch commits
    Then the student's enrollment status is "active"

  Scenario: A student missing a required guardian type is pre-enrolled, not blocked
    Given a student row with only a legal guardian and no financial guardian
    When the batch commits
    Then the student's enrollment status is "pre_enrolled"

  Scenario: At most one active enrollment per student per year, platform-wide
    Given a student already actively enrolled for this academic year label at another school
    When this school commits an active-eligible enrollment for the same underlying person and year
    Then that row errors instead of creating a second active enrollment

  Scenario: An invalid guardian phone number is rejected with a specific reason
    Given a guardian import row with an invalid phone number
    When the guardian rows are analyzed
    Then the row is rejected with a reason naming the phone number field

  Scenario: A missing required student field is rejected with a specific reason
    Given a student import row missing a required first name
    When the student rows are analyzed
    Then the row is rejected with a reason naming the first name field
