@REQ-ZS-295 @JNY-ZS-016 @mvp
Feature: Phone reminder for an unpaid fee

  Scenario: A call with the statement sent immediately (MVP)
    Given an 800 MAD installment overdue for 12 days and an automatic SMS reminder already sent
    When the secretary calls the father from the record and logs "payment promise on the 20th of the month"
    Then the call is tracked with outcome, author, and timestamp
    And the account statement is sent to the parent on the chosen channel and the send is logged
    And a reminder dated the 20th of the month appears in the promise's tracking

  Scenario: No document-blocking function (MVP)
    Given a parent with several unpaid installments and a certificate requested
    When the secretary works through the reminder record
    Then no screen in the journey offers to withhold an official document or suspend the student
    And the arrears alert stays the only expression of unpaid fees on the file
