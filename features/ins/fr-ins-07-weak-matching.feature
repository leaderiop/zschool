@REQ-ZS-030 @BEH-ZS-027 @mvp
Feature: Weak matching

  Scenario: Probable duplicate detected without automatic linking
    Given an existing student profile named Yassine El Amrani, born 05/09/2014, whose guardian's number is 0661234567
    When an admission is entered with the same first name, last name, date of birth, and guardian phone number, with no Massar code
    Then a probable-duplicate alert is shown and passed to the authorized role
    And the system links nothing automatically
    And the staff member chooses "link" or "create a new identity," with the choice logged
