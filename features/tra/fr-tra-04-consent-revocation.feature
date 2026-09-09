@REQ-ZS-184 @BEH-ZS-204 @mvp
Feature: Revoking a transfer consent
  Scenario: Revocation covering future access
    Given an active consent granted to "School B" with access to detailed grades
    When the legal tutor revokes that consent from their account
    Then the consent moves to status "revoked" with a timestamp
    And "School B" immediately loses access to shared data not yet viewed
    And the legal tutor and "School B" are notified

  Scenario: Official documents already exchanged remain
    Given a leaving certificate and a year-end transcript already transmitted in the procedure
    When the legal tutor revokes the consent
    Then those official documents stay in the destination file
    And the revocation is logged in the transfer file's timeline
