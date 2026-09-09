@REQ-ZS-084 @BEH-ZS-101 @mvp
Feature: Logging student-life entries (MVP)

  Scenario: A roll-call correction logged with no overwrite
    Given a roll call confirmed at 8:06am by the teacher with Sara marked absent
    When student life corrects Sara's status to "present" with the reason "entry error"
    Then the original entry remains viewable, and a correction trace is added with author, original value, reason, and timestamp
    And no trace can be edited or deleted by a school user
