@REQ-ZS-112 @BEH-ZS-125 @mvp
Feature: Publication of period report cards
  Scenario: Bulk publication and notification
    Given semester-1 results validated and closing recorded for class 2AC-3
    When the director publishes the class's report cards
    Then each report card is frozen as version 1 with fingerprint, signatory and date
    And the student and their authorized guardians receive the publication notification
    And the report card remains permanently readable, even after the student leaves

  Scenario: No blocking of report cards for unpaid balances
    Given a student whose financial guardian has arrears
    When their class's report cards are published
    Then that student's report card is published and viewable like any other
    And the arrears appear only as an alert on the financial account
