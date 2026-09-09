@REQ-ZS-187 @BEH-ZS-207 @mvp
Feature: Bounded access for the destination school
  Scenario: Viewing within scope
    Given a consented scope without attendance or discipline
    When the destination leadership opens the "incoming student" file
    Then they see identity, Massar code, yearly history, and official documents
    And no attendance, discipline, unshared grades, finance, or health section is accessible

  Scenario: Requesting further data
    Given a destination need for period report cards not shared
    When the destination sends a request to the legal tutor
    Then only a new explicit consent from the legal tutor opens that data
    And the origin has no forced "share everything" button
