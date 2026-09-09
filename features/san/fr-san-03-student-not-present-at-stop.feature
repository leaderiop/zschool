@REQ-ZS-002 @BEH-ZS-283 @BEH-ZS-284 @v2
Feature: Student not present at the stop

  Scenario: An alert after the bus passes
    Given a subscribed student not checked in at their stop
    When the bus monitor closes out the stop
    Then the student is marked "not present at stop"
    And their guardians receive a bilingual priority alert
    And student life staff see the alert in the day's transport view
