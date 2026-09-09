@REQ-ZS-404 @PER-ZS-013 @mvp
Feature: Adult student in control of their own data

  Scenario: Restricting parental access upon coming of age
    Given a student who turns 18 with an active account
    When the student is informed of their rights upon reaching majority
    Then they can restrict their parents' access to school, disciplinary, and health data
    And the financial guardian retains access to financial data as long as they remain liable
    And the restriction is logged and notified to the school
