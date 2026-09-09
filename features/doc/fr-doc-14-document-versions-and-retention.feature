@REQ-ZS-127 @BEH-ZS-144 @mvp
Feature: Document versions and retention

  Scenario: Permanent read access after departure
    Given an enrollment certificate delivered to Youssef in 2026-2027, then his enrollment closed to TRANSFERRED
    When his father opens "My documents" a year later
    Then the document stays viewable and downloadable unchanged

  Scenario: Correction via a new version
    Given a certificate delivered with a class error
    When the front desk issues the corrected version
    Then a new version is created and the old one stays viewable marked "superseded"
