@REQ-ZS-234 @BEH-ZS-273 @mvp
Feature: No automation of Massar data entry

  Scenario: Unambiguous wording and actions
    Given a principal who has generated a validated grade export
    When they view the actions available on the file
    Then the only action is "download the file to import into Massar"
    And no "sync", "send to Massar", or "connect to Massar" action exists in the interface

  Scenario: No ministerial credential stored
    Given the school's integration settings
    When leadership browses the module's settings
    Then no field allows entering a Massar account login or password
