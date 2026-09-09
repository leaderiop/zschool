@REQ-ZS-281 @JNY-ZS-007 @mvp @v1
Feature: Administering roles and the subscription

  Scenario: Immediate access removal on closing an affiliation (MVP)
    Given a staff member active at Site B with the secretariat role
    When their affiliation is closed for end of contract
    Then their access to Site B's data is removed immediately
    And the data they produced stays at the school, attributed to its author
    And the closing is logged with author and timestamp

  Scenario: Contextual permissions across two group sites (MVP)
    Given a person who teaches at Site A and is a parent of a student at Site B
    When they sign in with their single account
    Then they hold teacher rights at Site A and parent rights at Site B
    And no right from one context spills over to the other
    And a context switcher lets them toggle between them

  Scenario: Subscription overdue then terminated (V1)
    Given a group subscription overdue beyond the grace period
    When the platform sets the subscription to read-only mode and termination is pronounced
    Then data entry is blocked but viewing stays available read-only for 90 days
    And a full data export for every school in the group is delivered
    And operational data is deleted 12 months after termination
    And global identities and access to published documents are maintained
