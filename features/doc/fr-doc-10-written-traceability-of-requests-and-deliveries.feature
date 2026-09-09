@REQ-ZS-123 @BEH-ZS-140 @v1
Feature: Written traceability of requests and deliveries

  Scenario: Front-desk request with a disputed arrears balance
    Given a parent requesting an enrollment certificate at the front desk
    And a disputed arrears balance of 800 MAD on the student's file
    When the front desk processes the request
    Then the request and the delivery are logged with author, date and time
    And the issued document carries its counter number
    And the interface offers no refusal reason based on the unpaid balance

  Scenario: Pending request
    Given a leaving-certificate request filed through the portal
    When the enrollment closing has not yet been recorded
    Then the request appears in the log with a "pending" status
    And the front desk can process it as soon as closing happens, with traceability kept end to end
