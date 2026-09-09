@REQ-ZS-369 @JNY-ZS-081 @mvp
Feature: Activating student access by a legal guardian

  Scenario: Activating an eligible student with no phone of their own
    Given Youssef enrolled ACTIVE in Grade 8 at a school whose student access level is at the Grade 7 default
    And Youssef with no active account and no personal mobile number
    When Ahmed, a legal guardian, activates student access from Youssef's record and validates the OTP received on his own number
    Then an account is created with a generated login identifier linked to Youssef's existing student profile, with no additional identity created
    And Youssef can sign in from the family phone with this identifier and a session distinct from Ahmed's
    And the activation is historized with the author (legal guardian), date, and school context

  Scenario: A student below the school-set access level
    Given a Grade 6 student at a school configured at the Grade 7 default
    When the legal guardian tries to activate student access
    Then activation is refused with a bilingual message stating the school-set access level
    And no student session is created

  Scenario: The school changing the access level
    Given a director signed in to their school's settings
    When they raise the student access level from Grade 7 to Grade 8 for the current year
    Then the change is recorded, dated, and logged
    And guardians of students below the eligible levels no longer see the activation action
