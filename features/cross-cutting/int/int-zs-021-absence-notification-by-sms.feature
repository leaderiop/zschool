@REQ-ZS-526 @INT-ZS-021 @mvp
Feature: Absence notification by SMS

  Scenario: Sent after attendance is confirmed
    Given confirmed attendance recording a student's absence, with the guardian having a mobile number on file
    And the school's rules calling for immediate SMS notification
    When the notification is sent
    Then the SMS is transmitted to the aggregator within five minutes of confirmation, with the school's alias
    And the delivery log records the send status, delivery, and the cost allocated to the school

  Scenario: Invalid number
    Given a phone number rejected by the aggregator
    When the failure is returned
    Then the delivery log carries the failure reason and the school sees the contact-details issue on the record
