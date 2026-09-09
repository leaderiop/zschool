@REQ-ZS-118 @BEH-ZS-131 @BEH-ZS-139 @mvp
Feature: Issuing the leaving certificate

  Scenario: A student leaves with an unpaid balance
    Given an ACTIVE enrollment for the student Youssef for the 2026-2027 year
    And an arrears balance of 1,500 MAD on his financial guardian's account
    When the legal guardian requests the leaving certificate
    And the front desk closes the enrollment to TRANSFERRED status
    Then the leaving certificate is generated as a bilingual PDF, with no condition tied to the balance
    And an arrears alert of 1,500 MAD is shown on the student's file
    And an account statement summarizing the arrears is offered as an attachment to the file handed to the financial guardian
    And the request, the delivery, the alert and the statement are logged with author, date and time

  Scenario: Departure with no known destination
    Given an ACTIVE enrollment for a student who leaves the school without a transfer
    When the front desk records the departure as WITHDRAWN with a reason and a date
    Then the leaving certificate and the exit-file PDF are generated the same way
    And no destination is stated on the certificate

  Scenario: Departure at the next school start
    Given a 2026-2027 enrollment moved to COMPLETED with the decision "promoted to the next level"
    And no 2027-2028 enrollment created at the school for this student
    When the legal guardian requests the leaving certificate in July
    Then the certificate and the exit file are generated with the annual transcript and the end-of-year decision
    And the 2026-2027 enrollment stays COMPLETED (no move to TRANSFERRED)

  Scenario: The custodial mother's access to the exit file
    Given Naima, holder of custody, with no legal-guardian or financial-guardian status
    When she opens her daughter's exit file
    Then she can view the leaving certificate, the annual transcript and the decision
    And the account statement is not offered to her
