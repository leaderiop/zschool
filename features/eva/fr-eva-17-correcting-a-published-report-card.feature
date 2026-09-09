@REQ-ZS-114 @BEH-ZS-127 @mvp
Feature: Correcting a published report card (MVP)
  Scenario: New version after an entry error
    Given Youssef's semester-1 report card published as version 1
    When the school leadership corrects a grade and republishes with a reason
    Then a version 2 is published with its own fingerprint, signatory and date
    And version 1 remains viewable marked "superseded" and the recipients are notified
  Scenario: No direct edit
    Given a report card published ten days ago
    When a user attempts to directly edit its content
    Then the action is impossible: only the creation of a new version is offered
