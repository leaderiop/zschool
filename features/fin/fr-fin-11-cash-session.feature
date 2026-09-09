# In MVP (no cash session), cash collection is allowed outside a session and
# logged; the first two scenarios below apply as written from V1 on.
@REQ-ZS-139 @BEH-ZS-161 @v1
Feature: Collecting cash within a cash session

  Scenario: Successful collection against an installment
    Given a cash session opened by the cashier with a 500-DH float
    And the student Youssef has an 800-DH installment in "due" status (October's monthly fee)
    When the cashier collects 800 DH in cash against this installment
    Then the payment is recorded, attached to the current session and to the installment
    And a numbered receipt is printed and sent to the financial guardian
    And the installment moves to "paid" and the financial account's balance is updated
    And the PaymentReceived event is logged with the author and the timestamp

  Scenario: Closing a session with a discrepancy
    Given a session whose total recorded cash collections is 4,300 DH
    When the cashier closes the session declaring 4,150 DH counted
    Then the -50-DH discrepancy is computed, shown and recorded with its justification
    And the session is locked and the day's cash journal is exportable
    And the discrepancy appears on the school-leadership dashboard

  Scenario: Collection with no session open (from V1 on)
    Given no cash session open for the collector
    When they attempt to collect cash
    Then the collection is refused with a prompt to open a session
    And no receipt number is consumed
