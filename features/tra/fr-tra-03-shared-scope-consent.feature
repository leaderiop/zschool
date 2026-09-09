@REQ-ZS-183 @BEH-ZS-203 @mvp
Feature: Shared scope of an inter-school transfer with consent
  Scenario: Consenting to the default profile with an opt-in block
    Given a legal tutor who must consent to their child's transfer from "School A" to "School B"
    When they keep the default profile and explicitly check "detailed grades"
    And they confirm their consent
    Then a logged consent is recorded for "School B" with the default scope plus detailed grades
    And the destination school is notified that the shared file is available

  Scenario: Health data is never shareable
    Given the shared-scope selection screen
    When the legal tutor browses the available blocks
    Then no health data block is shown or selectable
    And no health data leaves the origin school
