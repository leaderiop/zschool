@REQ-ZS-362 @JNY-ZS-077 @mvp @v2
Feature: Guardianship-regime changes

  Scenario: The regime unchanged with no promulgated reform
    Given the regime parameter carrying the value "Family Code 70-03"
    When new parent-student relationships are created
    Then the defaults applied are the 2004 Code's: the father as legal tutor by right, custody per article 171
    And no review campaign is triggered

  Scenario: A new regime entering into force
    Given a text reforming tutorship and custody entering into force on a legal date
    When ZSchool activates the matching regime value on that date
    Then relationships created afterward carry the new regime's defaults
    And existing relationships are flagged to schools for review, with no automatic change to their qualities
    And the regime change is logged with its dates and values
