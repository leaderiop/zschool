@REQ-ZS-027 @BEH-ZS-022 @v1
Feature: Application documents (V1)

  Scenario: Completeness of mandatory documents
    Given a list of mandatory documents configured for level 1AC comprising the birth certificate and two photos
    When the front office scans the birth certificate and marks the photos "received"
    Then the completeness indicator switches to "complete" and the admission decision becomes possible
    And each document is stored under the tenant key of the school that uploaded it (ADR-ZS-054) and, for a court ruling, encrypted and access-restricted
