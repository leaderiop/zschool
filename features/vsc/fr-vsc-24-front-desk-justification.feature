@REQ-ZS-085 @BEH-ZS-104 @mvp
Feature: Front-desk justification (MVP)

  Scenario: A medical certificate delivered by the student
    Given Omar absent Monday and Tuesday, whose father has not yet claimed his account
    When the supervisor records at the front desk a scanned medical certificate on the father's behalf for these two days
    Then a justification "entered by the school" is created for the two absences with method "paper"
    And it appears in the validation queue, and once validated, both absences are marked justified
    And the father, once he claims his account, sees the justification and its decision
