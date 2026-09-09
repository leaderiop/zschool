@REQ-ZS-202 @BEH-ZS-234 @mvp
Feature: Minimal-directory consumption by transfers (MVP)

  Scenario: Hidden school reachable by exact identifier
    Given a school that has chosen not to appear in the directory
    When a legal tutor enters that school's exact identifier in the transfer request
    Then the school is offered as a ZSchool destination
    And no partial search allows discovering it
