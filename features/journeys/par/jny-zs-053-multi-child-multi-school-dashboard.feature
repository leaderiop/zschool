@REQ-ZS-338 @JNY-ZS-053 @mvp
Feature: A multi-child, multi-school dashboard

  Scenario: Switching children with no reconnection (MVP)
    Given Ahmed authenticated once on his single account
    And his three children linked across two schools
    When Ahmed views Youssef's grades then selects Sara then Adam
    Then each view shows only data for the selected child and school context
    And no reconnection or account change is requested
    And his chosen language and display mode are kept
