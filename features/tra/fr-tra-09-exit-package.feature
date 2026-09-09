@REQ-ZS-189 @BEH-ZS-209 @mvp @v1
Feature: Exit package for a non-ZSchool school
  Scenario: Generating the bilingual package (MVP)
    Given a closure to TRANSFERRED toward a non-ZSchool school with the default scope
    When the front office generates the exit package
    Then a bilingual AR/FR PDF document is produced with identity, Massar code, history, leaving certificate, and year-end transcripts
    And the document carries its own numbering, the date, and the school's seal
    And no account statement appears in it

  Scenario: Verification QR code and secure link (V1)
    Given the same package generated in V1
    When the front office creates the secure link
    Then the document carries a verification QR code and the link has a limited duration

  Scenario: Expired secure link (V1)
    Given a secure link issued for 30 days toward the exit package
    When the recipient school opens the link after expiry
    Then access is refused with a bilingual expiry message
    And the legal tutor may request a link regeneration

  Scenario: Withdrawal with no destination (MVP)
    Given a closure to WITHDRAWN (departure with no known destination)
    When the legal tutor requests their exit package
    Then the same package is produced, with no destination-school field filled in
