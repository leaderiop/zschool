@REQ-ZS-194 @BEH-ZS-221 @mvp
Feature: Single affiliation register (MVP)

  Scenario: An affiliation that has been active cannot be deleted
    Given an affiliation "active" then "ended" with reason "end of contract" and a date
    When leadership attempts to delete the affiliation from the register
    Then the deletion is refused and the affiliation stays viewable with status "ended"

  Scenario: Filtering the register at the start of the year
    Given 42 affiliations, 5 "invited", 35 "active", and 2 "suspended" for the 2026-2027 year
    When the front office filters the register by status "invited"
    Then only the 5 pending invitations are shown with their expiry date and the "resend" action
