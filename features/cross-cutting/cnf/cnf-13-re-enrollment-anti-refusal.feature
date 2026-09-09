@REQ-ZS-555 @CNF-ZS-006 @mvp
Feature: Governed refusal of re-enrollment

  Scenario: Not re-enrolling a student in good standing
    Given a student whose 2025-2026 enrollment is COMPLETED with decision "promoted"
    When the principal's office marks the student "not re-enrolled" for 2026-2027
    Then a legal warning about refusing re-enrollment is displayed
    And confirming requires a reason and a supporting document
    And the justified decision is logged and visible in the compliance file

  Scenario: Normal re-enrollment
    Given a student in good standing presented at the re-enrollment campaign
    When the guardian confirms re-enrollment with a deposit
    Then no refusal-related friction appears
    And the N+1 enrollment is created per journey JMP-ZS-002
