@REQ-ZS-102 @BEH-ZS-114 @mvp
Feature: Offline grade entry (MVP)
  Scenario: Network outage during entry
    Given Khadija entering test grades on her phone
    And the mobile network drops after the tenth grade
    When she continues entering the remaining twenty grades and then closes the app
    Then the thirty grades are kept locally as drafts with a "30 pending" counter
    And upon reconnection, the grades are synchronized without loss or duplication

  Scenario: Conflict at synchronization
    Given a grade entered offline at 8:05 PM for a student
    And the same grade edited on the web by the same teacher at 8:30 PM
    When synchronization runs
    Then the most recent value is kept
    And the teacher receives an overwrite alert listing the value that was replaced, with no silent change
