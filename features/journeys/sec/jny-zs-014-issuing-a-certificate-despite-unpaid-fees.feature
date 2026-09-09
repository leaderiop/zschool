@REQ-ZS-293 @JNY-ZS-014 @mvp @v1
Feature: Issuing a certificate despite unpaid fees

  Scenario: Enrollment certificate issued with arrears shown (MVP)
    Given an ACTIVE enrollment with two unpaid installments totaling 1,600 MAD
    When the parent requests an enrollment certificate at the front desk
    Then the system shows the arrears alert and offers to give the account statement to the financially responsible parent
    And issuing the certificate is neither blocked nor delayed by the arrears
    And the bilingual document is numbered and dated
    And the request and the issuance are historized with author and timestamp

  Scenario: Enrollment certificate requested by the custodial mother (MVP)
    Given a student whose legal tutor is the father and whose mother holds custody
    When the mother requests an enrollment certificate at the front desk
    Then the document is issued with no account or tutor signature needed
    And no account statement is given to the mother, who is not the financially responsible parent

  Scenario: A leaving certificate initiated by the custodial mother (MVP)
    Given an enrollment being closed as TRANSFERRED whose legal tutor is the father
    When the mother who holds custody requests the leaving certificate
    Then the request is created under her name and awaits the legal tutor's signature
    And the certificate is issued after the father signs, signed by the school
    And no screen function makes issuance conditional on paying arrears

  Scenario: Authenticity verification by QR code (V1)
    Given a printed attestation carrying a verification QR code
    When a third party scans the QR code
    Then the public page confirms the document's authenticity without revealing other data from the file
