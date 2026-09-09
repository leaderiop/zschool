@REQ-ZS-374 @JNY-ZS-089 @mvp
Feature: Contesting by the student

  Scenario: An absence contested by Youssef and corrected
    Given an absence recorded for Youssef at the 8 a.m. session when he was present
    When Youssef contests from his attendance screen and student life corrects the roll call
    Then a correction notice is sent to his guardians on the original channel
    And the absence no longer appears in his history, with the correction tracked on the school side

  Scenario: A grade contested by Salma after report-card publication
    Given a published grade on Salma's report card that does not match her paper
    When Salma contests in the moderated thread and leadership approves the correction
    Then a new report-card version is published and notified to Salma
    And the old version stays viewable marked "superseded"
