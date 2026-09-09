@REQ-ZS-121 @BEH-ZS-138 @v1
Feature: Self-service documents for guardians

  Scenario: The custodial mother downloads an authorized enrollment certificate
    Given a school that authorizes self-service enrollment certificates
    And Naima, holder of custody of her daughter, with an active account
    When Naima opens her daughter's "Documents" area and requests an enrollment certificate
    Then the bilingual document is generated, numbered, carrying the advanced seal and the verification QR code
    And it is immediately downloadable from her account
    And the father, the legal guardian, receives the delivery notification

  Scenario: Document not authorized for self-service
    Given a school that does not release the leaving certificate for self-service
    When the parent views the "Documents" area
    Then the leaving certificate does not appear for download
    And an option to request it from the front desk is shown, logged in the register

  Scenario: Arrears with no blocking in self-service
    Given an enrollment certificate requested in self-service for a student with arrears
    When the parent generates the document
    Then generation succeeds with no blocking
    And the arrears alert appears on the file interface and on the account statement available to the parent
