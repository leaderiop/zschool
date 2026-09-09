@REQ-ZS-347 @JNY-ZS-062 @mvp
Feature: Contesting an absence or a grade

  Scenario: A wrongly recorded absence corrected after a contest (MVP)
    Given an absence notification received for Youssef when he was in class
    When Ahmed contests from the absence screen and student life corrects the roll call
    Then a correction notice is sent to Ahmed on the same channel
    And the absence no longer appears in Youssef's history, with the correction tracked on the school side

  Scenario: A grade contested after report-card publication (MVP)
    Given a wrong grade appearing on Youssef's published report card
    When leadership approves the correction requested by the teacher
    Then a new report-card version is published and notified
    And the old version stays viewable marked "superseded"
