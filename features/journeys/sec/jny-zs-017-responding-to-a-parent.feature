@REQ-ZS-296 @JNY-ZS-017 @mvp @v1
Feature: Responding to a parent

  Scenario: An administrative summons with read tracking (V1)
    Given a parent to summon for an administrative meeting
    When the secretary creates the summons from a bilingual template with a date and subject
    Then the summons is sent to the authorized guardians on their preferred channels
    And the read status is visible on the summons
    And an automatic reminder is sent if the summons stays unread by D-2

  Scenario: An informed phone response (MVP)
    Given a parent calling to learn their child's balance and absences
    When the secretary opens the student's front-desk record
    Then the week's absences, the last summons, the balance, and available documents are shown with no further search
    And any sending of a statement or document from the record is logged
