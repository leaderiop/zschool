@REQ-ZS-048 @BEH-ZS-046 @mvp
Feature: Declared prior history (MVP)

  Scenario: Arrival from a non-ZSchool school with a paper certificate
    Given a student enrolled in 3AC whose previous school is not on the platform
    When the front office records the previous school, the years 2024-2025 (1AC, promoted) and 2025-2026 (2AC, promoted), and attaches the scanned leaving certificate
    Then the prior history appears on the student's identity marked "declared, document attached"
    And it appears in the default transfer profile and in ESISE data, with no "verified" mention
