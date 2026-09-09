@REQ-ZS-067 @BEH-ZS-071 @mvp
Feature: A session not held

  Scenario: A teacher's three-day absence
    Given Khadija assigned to six expected sessions from Monday to Wednesday
    When student life declares her absence from Monday to Wednesday
    Then the six sessions move to "not held" and drop out of student life's expected roll calls
    And the week's roll-call rate is computed without these six sessions

  Scenario: A one-off substitution
    Given a math session expected on Tuesday 8am-9am for 2AC-3
    When student life declares a substitution by Hassan for this slot
    Then the session remains expected with Hassan as the teacher, and Hassan can take its roll call
    And the hour is counted toward Hassan's weekly total
