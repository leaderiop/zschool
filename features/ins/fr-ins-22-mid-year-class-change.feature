@REQ-ZS-044 @BEH-ZS-042 @mvp
Feature: Mid-year class change (MVP)

  Scenario: Rebalancing in October
    Given a student in 2AC-3 with two math grades
    When academic leadership assigns them to 2AC-1 on October 15 with the reason "rebalancing"
    Then a history entry is added (2AC-3, 2AC-1, 15/10, reason, author) and the enrollment stays unchanged
    And their two grades remain attached to their enrollment and count toward their average
    And the parents, homeroom teacher, and teachers of both classes are notified
