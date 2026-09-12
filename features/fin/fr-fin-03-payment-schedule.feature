@BEH-ZS-153 @REQ-ZS-135 @mvp
Feature: Payment schedule generation on enrollment activation

  Scenario: Activating an enrollment generates its payment schedule from the applicable fee schedule
    Given a school with a fee schedule for a level with a monthly tuition line and a one-time registration line
    When a student is enrolled in that level from the start of the school year
    Then the payment schedule holds 10 monthly tuition installments and 1 registration installment
    And every installment starts with status "due"

  Scenario: A student enrolling mid-year only owes installments from their start month onward
    Given a school with a fee schedule for a level with a monthly tuition line and a one-time registration line
    When a student is enrolled in that level partway through the school year
    Then the payment schedule's earliest tuition installment is due in the student's own start month

  Scenario: An enrollment with no fee schedule defined yet still succeeds, with no payment schedule
    Given a school with a level and no fee schedule yet
    When a student is enrolled in that level
    Then the enrollment succeeds and the payment schedule is empty

  Scenario: A director manually adjusts an installment, and the change is traced
    Given a school with a fee schedule for a level with a monthly tuition line and a one-time registration line
    And a student enrolled in that level from the start of the school year
    When the director adjusts one tuition installment's amount with a reason
    Then the installment carries the new amount
    And the adjustment is traced with the previous amount and the reason
