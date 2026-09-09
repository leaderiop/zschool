@REQ-ZS-298 @JNY-ZS-019 @mvp
Feature: Voiding a payment

  Scenario: A receipt issued to the wrong student (MVP)
    Given receipt No. 2027-000418 for 800 MAD wrongly allocated to Student A
    When the secretary requests a voiding with the reason "wrong student" and leadership validates
    Then a reversal of -800 MAD is posted to Student A's account with a numbered voiding receipt referencing No. 2027-000418
    And receipt No. 2027-000418 stays viewable, marked "voided," with no gap in the sequence
    And a new payment of 800 MAD is recorded for Student B with a new receipt
