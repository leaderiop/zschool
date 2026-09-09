@REQ-ZS-358 @JNY-ZS-073 @mvp
Feature: Distinguishing reserved acts and administrative documents

  Scenario: A transfer request by the custodial mother
    Given a minor student whose father is the registered legal tutor
    And whose mother holds custody
    When the mother submits a transfer request
    Then the request is created under her name and moves to "awaiting the legal tutor's signature"
    And the father receives a signature request on his own account
    And leadership only receives the request for validation after the legal tutor signs

  Scenario: An enrollment certificate obtained by the mother with no involvement from the father
    Given Lina, an active Grade 4 student, whose mother holds custody
    And an unsettled financial balance on the enrollment
    When the mother requests the enrollment certificate
    Then the certificate is generated bilingual and numbered
    And no signature or account from the legal tutor is required
    And the arrears alert appears on the school-side record, with no blocking of the document
    And no account statement is given to the mother, who is not the financially responsible parent
