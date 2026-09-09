@REQ-ZS-372 @JNY-ZS-085 @mvp
Feature: Parental-access restriction at the student's majority

  Scenario: Information on rights at majority
    Given Salma, a 2nd-year baccalaureate student, whose date of birth matches 18 Gregorian years completed
    And an ACTIVE enrollment at the school
    When the platform detects majority
    Then Salma receives a bilingual notification informing her of her ownership and her right to restrict parental access
    And the "Your rights" screen recalls the default maintenance of guardians' access and the maintenance of the liable payer's financial access
    And the school is notified of the majority (a logged event)
    And guardians' access stays unchanged by default

  Scenario: Restricting the school and disciplinary blocks, keeping the financial block
    Given adult Salma signed in to her account
    And her father active as a legal guardian and financially responsible, liable for an installment
    When Salma restricts her father's access to the "school" and "disciplinary" blocks
    Then her father no longer sees her published grades, report cards, transcripts, attendance, or disciplinary data
    And her father keeps access to financial and contractual data: payment schedule, receipts, balance, and account statement
    And Salma keeps full access to all her data
    And the restriction is logged (author, exact scope, timestamp) and notified to the school

  Scenario: Reversibility of the restriction
    Given an active restriction of the "school" block for the father
    When Salma restores access from the "My rights" screen
    Then the father's access to the "school" block is restored immediately
    And the restoration is logged and notified to the school

  Scenario: A minor student's guardian cannot restrict the other
    Given a minor student whose father wants to restrict the mother's access
    When the father tries a restriction from his account
    Then the function does not exist for minors
    And only the school may record a minor student's parent restriction, on a court ruling with an attachment and traceability
