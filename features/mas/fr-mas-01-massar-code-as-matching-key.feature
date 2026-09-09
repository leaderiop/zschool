@REQ-ZS-226 @BEH-ZS-261 @mvp
Feature: Massar code as the key for exports and imports

  Scenario: A student with no Massar code flagged in an export
    Given a class of 30 students, 2 of them without a Massar code (the code is optional)
    When leadership generates the list export for that class
    Then the 2 students appear with an empty cell and are listed as a warning in the validation report
    And the export stays possible after a reasoned confirmation

  Scenario: Old CNE code kept with no key role
    Given a baccalaureate holder before 2015 whose profile carries an eight-digit CNE
    When a user attempts to use the CNE as a matching key in an import
    Then the CNE is ignored as a key and only the name, first name, and date-of-birth rule applies

  Scenario: Anti-enumeration episode logged
    Given a code sweep detected from the module's import screen
    When the anti-enumeration protection triggers
    Then the episode is logged in the module's log with the originating screen
