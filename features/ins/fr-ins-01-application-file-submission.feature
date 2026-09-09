@REQ-ZS-026 @BEH-ZS-021 @v1
Feature: Submitting an application file (V1)

  Scenario: Online submission by a parent
    Given an admission form shared by the school for the 2027-2028 school year
    When a parent enters the child's identity in dual script, the requested level, and their mobile number verified by code
    Then an enrollment in CANDIDATE state is created with a tracking number sent by SMS
    And the file appears in the front office's application queue with origin "online"
