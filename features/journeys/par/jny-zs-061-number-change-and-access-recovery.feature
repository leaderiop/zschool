@REQ-ZS-346 @JNY-ZS-061 @mvp
Feature: Number change and access recovery

  Scenario: A self-service number change (MVP)
    Given Ahmed connected with access to both his old and new numbers
    When he enters the new number and validates both OTP codes received
    Then his login identifier switches to the new number with no account created
    And School A and School B are notified of the change
    And the operation is historized with author and timestamp

  Scenario: A number recycled by the operator (MVP)
    Given Ahmed's old number reassigned to a third party and no sign-in for seven months
    When the third party requests an OTP on this number and enters it
    Then the platform requires a linked child's date of birth before any access
    And three failures lock the account and alert both schools
    And no data about Ahmed's children is shown

  Scenario: A lost phone, recovery at the front desk (MVP)
    Given Ahmed with no access to his old number
    When he goes to School A's front desk with an ID document and leadership validates the new number
    Then access is restored on the new number after an OTP
    And School B is notified of the change
