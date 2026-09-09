@REQ-ZS-119 @BEH-ZS-134 @v1
Feature: Sequential document numbering

  Scenario: Two certificates of the same type on the same day
    Given an "enrollment certificate" counter at 41 for the 2026-2027 year
    When the front desk issues two enrollment certificates the same day
    Then the documents carry consecutive numbers 42 and 43
    And the delivery log records both numbers with author, date and time

  Scenario: Abandoned preview
    Given a counter at 43 and a certificate preview shown but never confirmed
    When the front desk abandons the issuance and starts a new generation
    Then no number was consumed by the preview
    And the next document carries number 44

  Scenario: A confirmed document later voided
    Given a certificate confirmed under number 44 with a class error
    When the front desk voids it with a reason
    Then number 44 stays assigned to the document with a "voided" status in the log
    And the corrected certificate carries number 45
