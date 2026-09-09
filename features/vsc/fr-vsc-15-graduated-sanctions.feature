@REQ-ZS-083 @BEH-ZS-095 @v1
Feature: A graduated sanction and its notification

  Scenario: Notifying a sanction to authorized guardians
    Given a "medium"-severity incident recorded for a 2AC student
    And a written-warning decision made by student life
    When the sanction is recorded in the student's file
    Then authorized legal guardians are notified with the nature of the sanction
    And the notification states the school's internal channels of appeal
    And recording and sending the sanction are logged with author, context, and timestamp
    And no data about this incident is visible to any other family or school

  Scenario: Suppressing a disciplinary notification to a parent restricted by the adult student
    Given an adult student who has restricted their parent's disciplinary access
    When a sanction is recorded in this student's file
    Then no disciplinary notification is sent to this parent
    And the restriction is restated in the record and logged
