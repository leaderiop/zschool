@REQ-ZS-360 @JNY-ZS-075 @mvp
Feature: A conflict between guardians

  Scenario: Conflicting transfer requests
    Given a minor student whose father and mother are active legal guardians
    When the father submits a transfer request to School X
    And the mother submits a transfer request to School Y
    Then both requests are marked "in conflict - awaiting the school's arbitration"
    And neither is submitted for validation
    And leadership is notified of the flag with the timestamped history of both requests

  Scenario: The school's arbitration
    Given a conflict flagged on a student
    When leadership records its decision to go with the father's request
    Then the decision is logged and notified to both parents
    And the chosen request resumes its normal validation path
    And ZSchool expresses no preference between the parents at any step
