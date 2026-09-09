@REQ-ZS-082 @BEH-ZS-094 @v1
Feature: Disciplinary incidents (V1)

  Scenario: Reported by a teacher and investigated by student life
    Given a teacher who witnesses an incident during their 2AC-B course
    When they report the incident with the date, context, proposed severity, and a factual description
    Then the incident is created in the student's record within the school's scope and forwarded to student life for investigation
    And authorized guardians are notified per severity and configuration
    And the incident appears in no transfer profile or leaving file
