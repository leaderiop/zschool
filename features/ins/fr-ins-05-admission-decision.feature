@REQ-ZS-028 @BEH-ZS-025 @v1
Feature: Full admission of a new student

  Scenario: Complete file, successful test, favorable decision
    Given a CANDIDATE application at the front desk for Yasmine Benali, born 12/03/2015, requesting level 5AP for 2027-2028
    And all mandatory documents received and verified
    And an admission test recorded with the result "satisfactory"
    When the director records the decision "accepted" with its reason
    Then the enrollment moves to PRE-ENROLLED state and the 5AP spot is reserved
    And the legal guardian receives the decision notification with the deposit amount and remaining documents
    And the admissions dashboard shows the application as "pre-enrolled"

  Scenario: Decision blocked by a missing mandatory document
    Given an application whose birth certificate is still expected
    When the director attempts to record the decision "accepted"
    Then the system refuses the decision and lists the missing mandatory documents
    And the decision is only possible after the document is recorded, or after a documented exception granted by the director
