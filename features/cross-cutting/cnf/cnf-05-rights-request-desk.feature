@REQ-ZS-552 @CNF-ZS-003 @mvp
Feature: A parent's access request

  Scenario: Response within the configured deadline
    Given a parent holding an active account
    When they file an access request for their child's data
    Then they receive an immediate acknowledgment with the deadline
    And the request appears in the school's rights-request-desk thread
    And the response is sent before the deadline, stating the scope disclosed
    And every step (filing, handling, response) is logged with author and timestamp
