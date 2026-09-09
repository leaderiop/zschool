@REQ-ZS-309 @JNY-ZS-036 @mvp @v1
Feature: Targeted communication to a class's parents

  Scenario: an in-app and SMS student-life announcement (MVP)
    Given a student-life instruction meant for the parents of 2AC-3
    And some parents whose preferred language is Arabic and others whose preferred language is French
    When Rachid broadcasts the bilingual announcement from the school-approved template at 5 p.m.
    Then each parent receives the message in-app and by SMS in their preferred language only
    And delivery tracking distinguishes sent and delivered for each recipient, and read for in-app
    And delivery failures are listed with their reason for a targeted follow-up
    And the SMS send cost is charged to the school's bundles

  Scenario: an announcement deferred outside the sending window (MVP)
    Given a non-urgent announcement validated at 10 p.m.
    When routing runs
    Then the send is deferred to the next day at 8 a.m.
    And an attendance notification issued at 10 p.m. for a late departure is not deferred

  Scenario: a student-life announcement with multi-channel routing (V1)
    Given a student-life instruction meant for the parents of 2AC-3
    And 85 percent of the parents involved have given WhatsApp consent and have the app installed
    When Rachid broadcasts the bilingual announcement from the school-approved template
    Then each parent receives the message on their priority channel (push, then WhatsApp utility, then SMS)
    And the cost of WhatsApp and SMS sends is charged to the school's bundles
