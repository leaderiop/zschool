@REQ-ZS-124 @BEH-ZS-141 @mvp
Feature: Digital student file

  Scenario: Uploading a birth certificate
    Given a student file where the "birth certificate" document is expected
    When the front desk uploads the scanned certificate with its type and date
    Then the document is filed, encrypted at rest, and the file's completeness is updated
    And the upload is logged with author, context and timestamp

  Scenario: Uploading a custody ruling
    Given Naima's relationship, as holder of custody, with her daughter
    When the front desk uploads the custody ruling attached to this relationship
    Then the document is encrypted, filed as "school-leadership confidential", attached to the relationship and to the filing school
    And the "holder of custody" status carries the reference of the supporting document

  @v1
  Scenario: File completeness
    Given a checklist of expected documents configured by the school
    When an expected document is missing at the school start
    Then the file shows the missing document
    And the front desk can send a reminder to the guardian from the file screen
