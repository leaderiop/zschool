@REQ-ZS-163 @BEH-ZS-181 @mvp
Feature: Targeted announcement (MVP)

  Scenario: Bilingual announcement to a level
    Given School A's leadership drafting an announcement in French and Arabic targeted at level 2AC
    When they confirm sending
    Then the summary shows the effective recipient guardians and students, and the estimated SMS cost
    And each recipient receives the announcement in-app in their communication language, with SMS per the routing matrix
    And the publication is logged with author and timestamp

  Scenario: Announcement scheduled outside the sending window
    Given a non-critical announcement confirmed at 10:30 PM
    When the system processes the send
    Then the in-app announcement is published immediately and the SMS is deferred to 8:00 AM the next day
