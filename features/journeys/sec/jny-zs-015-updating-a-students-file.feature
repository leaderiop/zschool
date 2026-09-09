@REQ-ZS-294 @JNY-ZS-015 @mvp
Feature: Updating a student's file

  Scenario: Correcting the Arabic spelling of a name (MVP)
    Given a student enrolled at two schools, one of them Fatima's primary school
    When the secretary corrects the Arabic spelling of the student's name with the reason "data-entry error"
    Then the correction is historized with before/after values, reason, author, and timestamp
    And the other school involved receives the identity-correction notification
    And the student's guardians are informed

  Scenario: Document completeness tracked through to a complete file (MVP)
    Given a PRE-ENROLLED enrollment missing the birth certificate
    When the secretary sends the document reminder and then records the photograph of the certificate provided by the parent
    Then the document is archived in the file with date and author
    And the file moves to complete once the completeness list is satisfied
