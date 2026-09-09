@REQ-ZS-181 @BEH-ZS-201 @mvp
Feature: Transfer request initiated by the legal tutor
  Scenario: Request toward a ZSchool school
    Given a student ACTIVE at the origin school for the current year
    And an authenticated legal tutor on their parent account
    When they select their child, the destination "School B" in the directory, and an effective date at the following school year's start
    Then a request with status "initiated" is created and addressed to both schools
    And the origin school's leadership receives an in-app and SMS notification

  Scenario: Request initiated by the destination school without data leakage
    Given a ZSchool destination school searching for a student enrolled elsewhere by their Massar code
    When it sends a transfer request
    Then only the origin school is notified
    And the destination school sees no data of the student before the legal tutor's consent

  Scenario: Request initiated by the custodial mother, signed by the legal tutor (MVP)
    Given a custodial mother who is not the legal tutor, authenticated on her account
    When she initiates a transfer request for her daughter
    Then the request is created with status "initiated" and the note "legal tutor signature required"
    And the legal tutor receives a notification to sign or decline the request
    And no validation by the origin is possible before that signature
