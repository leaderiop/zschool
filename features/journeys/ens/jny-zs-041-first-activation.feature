@REQ-ZS-320 @JNY-ZS-041 @mvp
Feature: A part-time teacher's first activation

  Scenario: Inviting a new teacher with no existing account (MVP)
    Given a School A onboarded with a "Math — 2AC-3" course
    When the secretary creates Khadija's part-time affiliation and sends the SMS invitation
    Then Khadija receives a bilingual SMS with a time-limited invitation link
    When she creates her account with her mobile number and accepts the affiliation
    Then her affiliation moves to the "active" status
    And the context "School A — teacher" appears in her context switcher
    And the identity-claim event is notified to School A

  Scenario: Inviting a teacher already active at another school (MVP)
    Given Khadija holds an active account with an active affiliation to School B
    When School A creates her affiliation and sends the invitation to the same mobile number
    And Khadija signs in with her existing account and accepts
    Then she holds two simultaneous active affiliations (INV-ZS-069)
    And a single account carries both contexts (INV-ZS-030)
    And no new identity was created
