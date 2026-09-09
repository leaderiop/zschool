@REQ-ZS-291 @JNY-ZS-012 @mvp @v1
Feature: Collecting a monthly payment in cash

  Scenario: Standard payment with a receipt (MVP)
    Given an ACTIVE enrollment whose October installment of 800 MAD is due
    When the secretary enters a cash payment of 1,000 MAD
    Then the system allocates 800 MAD to the October installment, which moves to the paid state
    And the 200 MAD surplus is allocated per the secretary's choice and stays visible on the balance
    And a sequentially numbered receipt is printed and sent to the parent in their language
    And the payment is historized with author, timestamp, and amount

  Scenario: A family payment for two children with a single receipt (MVP)
    Given two children of the same mother enrolled at the school, each with an October installment of 800 MAD due
    When the mother pays 1,600 MAD in cash in one transaction
    Then the system splits 800 MAD onto each child's financial account
    And a single numbered receipt lists both children and both installments covered

  Scenario: Standard payment within a cash session (V1)
    Given an open cash session with a 200 MAD cash float
    When the secretary collects 800 MAD in cash
    Then the session's cash log records the operation with author, timestamp, and amount

  Scenario: Cash payment outside a cash session refused (V1)
    Given no cash session open for the day
    When the secretary tries a cash payment
    Then the system offers to open the session in one step and records no cash payment before it opens
    And cheque or transfer payments outside a session stay possible per their own cycle

  Scenario: A cash discrepancy tracked at closing (V1)
    Given a cash session with 1,500 MAD in cash payments and a 200 MAD float
    When the secretary closes the session, declaring 1,680 MAD counted
    Then the system computes a discrepancy of -20 MAD
    And requires a reason, tracking the discrepancy with author and timestamp
    And notifies leadership per the configured circuit
