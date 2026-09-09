@REQ-ZS-345 @JNY-ZS-060 @v1
Feature: A self-service enrollment certificate

  Scenario: Generation and verification by a third party (V1)
    Given the enrollment certificate authorized self-service by School A for Sara
    When Ahmed requests the document from his app
    Then the bilingual document is generated with numbering, an advanced electronic seal, a timestamp, and a QR code
    And Ahmed receives the availability notification and downloads the PDF
    And a third party scanning the QR code gets confirmation of the document's authenticity

  Scenario: Issuance despite arrears (V1)
    Given arrears shown on Sara's record
    When Ahmed requests the enrollment certificate
    Then generation is not blocked
    And the arrears alert and the account statement are shown alongside the document
