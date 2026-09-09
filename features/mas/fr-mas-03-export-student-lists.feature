@REQ-ZS-228 @BEH-ZS-263 @mvp
Feature: Exporting student lists in Massar format

  Scenario: A whole level's list in dual script
    Given level 1AC with 92 ACTIVE students across three classes, 3 without a Massar code
    When the front office generates the level's list with the active template
    Then the file has 92 rows with name and first name in Latin and Arabic script, date and place of birth, sex, class, and regime
    And the 3 students without a code appear with an empty cell and are listed in the validation report
    And the headcount counter shown before generation is 92
