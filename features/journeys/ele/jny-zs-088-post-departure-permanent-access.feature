@REQ-ZS-373 @JNY-ZS-088 @mvp @v1
Feature: Permanent access to published documents after departure

  Scenario: Viewing after obtaining the baccalaureate
    Given graduated Salma, her enrollment COMPLETED with the decision "graduated"
    When she signs in to her account after leaving the school
    Then she gets read-only access to her published report cards, transcripts, year-end decisions, and official documents
    And no unpublished internal data (drafts, deliberations, remarks) is exposed to her
    And every post-departure access is logged

  Scenario: A departure to a school outside ZSchool (a secure link and QR in V1)
    Given a closing for a departure to a school outside ZSchool
    When the exit dossier is issued
    Then a bilingual PDF matching the default transfer profile is generated (identity, Massar code, years, levels, decisions, the leaving certificate, the annual year-end transcript)
    And in V1 the dossier is accessible via a personal, time-limited, revocable secure link with a verification QR code
    And disciplinary data, health data, and the account statement do not appear in the dossier

  Scenario: No document blocking for unpaid fees
    Given an unsettled financial balance at departure
    When the former student or the financially responsible parent requests the leaving certificate or transcripts
    Then the documents are generated with no blocking
    And the arrears appear only as an alert on the record and in the account statement given to the financially responsible parent
