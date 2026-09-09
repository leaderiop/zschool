@REQ-ZS-531 @INT-ZS-032 @v1
Feature: Publishing a stamped attestation of enrollment

  Scenario: Generation and advanced stamp
    Given a school whose stamp and legal elements are configured
    When the registrar's office generates a bilingual attestation of enrollment
    Then the document carries the school's advanced electronic stamp, a fingerprint, and a timestamp
    And the evidence package is archived and a verification QR code is printed on the document

  Scenario: QR verification
    Given an attestation presented with its QR code
    When a third party scans the QR
    Then the minimal public verification page confirms the document's existence, integrity (fingerprint), and date without disclosing any other student data
    And the verification identifier reveals neither the document's number nor another document's
