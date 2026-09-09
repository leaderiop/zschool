@REQ-ZS-231 @BEH-ZS-266 @mvp @v1
Feature: Exposing compliance status and the closing statement

  Scenario: Compliance status relayed in the portal
    Given class 1AC-A's history-geography subject declared "non-compliant" by the assessments module (only one test in semester 1)
    When leadership opens the Massar and ESISE portal
    Then the status banner and the compliance matrix show the non-compliant subject with the teacher concerned
    And no tally is recomputed by this module: the status shown is the one produced by the assessments module

  Scenario: Closing statement and a logged waiver
    Given a subject declared non-compliant at closure for lack of a unified test, and a waiver recorded by leadership in the assessments module (second semester of an exam year)
    When leadership generates that class's grade export
    Then the attached closing statement mentions the waiver, its author, and its reason
    And submission is possible; without the waiver, it would have been blocked until compliance was reached
