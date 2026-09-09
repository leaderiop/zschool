@REQ-ZS-021 @BEH-ZS-017 @mvp
Feature: Minimal directory

  Scenario: A hidden school still reachable for a transfer (MVP)
    Given a school that has requested to be hidden from the directory
    When a legal guardian enters this school's exact name as a transfer destination
    Then the school is offered and the transfer request can be initiated
    And the school appears in no browsing or network listing
