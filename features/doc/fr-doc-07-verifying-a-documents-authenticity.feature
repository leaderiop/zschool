@REQ-ZS-120 @BEH-ZS-137 @v1
Feature: Verifying a document's authenticity

  Scenario: An employer verifies a certificate by QR code
    Given an issued attendance certificate carrying a verification QR code
    When a third party scans the QR code from a phone, with no ZSchool account
    Then the public page shows the status "authentic document"
    And it states the document type, the issuing school, the issue date
    And the student's name stays masked until the verifier enters the document number and the date of birth
    And after this knowledge challenge, the full name in dual script is shown for comparison with the document presented
    And no file data (grades, finance, documents, health) is accessible from this page

  Scenario: Superseded document
    Given a certificate superseded by a corrected version
    When a third party scans the QR code of the superseded version
    Then the status shown is "document superseded"
    And the page names the current version without delivering its content

  Scenario: Unknown or forged code
    Given a verification code that does not exist, or an altered PDF whose fingerprint no longer matches
    When a third party submits this code on the public page
    Then the status shown is "document unknown"
    And the message is identical to that of an invalid code, to prevent enumeration
