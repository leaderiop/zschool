@REQ-ZS-200 @BEH-ZS-231 @v1
Feature: Tracking AREF authorization deadlines

  Scenario: Alert at the opening of the request window
    Given an external public-sector teacher whose final authorization expires at the end of the school year
    When April 1 arrives
    Then the school receives a reminder: the renewal request is to be filed between April 1 and May 15
    And the teacher receives the same reminder in their area

  Scenario: Start of the school year without a final authorization
    Given an external public-sector teacher holding only a preliminary authorization in September
    When leadership views the authorization status
    Then the affiliation appears "preliminary, final expected end of September" with the validity date
    And no punitive action is triggered: tracking is a tool, the decision stays with the school and AREF
