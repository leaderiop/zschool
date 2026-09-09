@REQ-ZS-149 @BEH-ZS-176 @mvp
Feature: Self-service financial status

  Scenario: Aggregated multi-school view
    Given Ahmed, financial guardian of Youssef and Sara (School A) and of Adam (School B)
    When he opens the "Payments" tab of his account
    Then he sees, per child and per school, the payment schedule, the next installment and the balance, with an aggregated total
    And he downloads each payment's receipt

  Scenario: An adult student with an indebted financial guardian
    Given Salma, an adult, who has restricted parental access to school data
    When her father, the financial guardian, opens her financial status
    Then Salma's payment schedule and receipts stay visible to him as long as he owes money
