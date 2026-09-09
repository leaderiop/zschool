@REQ-ZS-175 @BEH-ZS-196 @mvp
Feature: Logging communication writes (MVP)

  Scenario: A logged publication
    Given an announcement published by the school leadership
    When the announcement's history is viewed
    Then the publication's author, context and timestamp are visible and cannot be edited

  Scenario: A thread viewed by the school leadership
    Given an open parent-teacher thread
    When a member of the school leadership views it
    Then participants see the possible-view indicator; logging of the view itself is guaranteed in V1 (INV-ZS-019)
