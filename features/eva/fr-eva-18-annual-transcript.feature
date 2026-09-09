@REQ-ZS-115 @BEH-ZS-128 @mvp
Feature: Annual transcript (MVP, wave 2)
  Scenario: Annual transcript after year-end closing
    Given Youssef's 2026-2027 enrollment moved to COMPLETED with the decision "promoted to the next level"
    When his father downloads the annual transcript from his account
    Then the bilingual PDF shows both semesters' averages, the annual average and the end-of-year decision
    And it is produced with no condition tied to the financial balance

  Scenario: Cumulative transcript (V1)
    Given Salma, an adult student, enrolled for three years at the school
    When she requests the cumulative transcript
    Then the document covers the three years with an advanced electronic seal and a verification QR code
