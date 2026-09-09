@REQ-ZS-217 @BEH-ZS-245 @mvp
Feature: Multi-school parent dashboard

  Scenario: A parent tracks three children in two schools from a single account
    Given a parent responsible for Youssef (2AC, School A), Sara (CE2, School A), and Adam (senior kindergarten, School B)
    And Adam absent this morning with a justification pending
    And one of Adam's monthly installments overdue and unpaid at School B
    When the parent opens their dashboard
    Then the three children appear grouped by school, with no re-authentication or second account
    And Adam's card highlights the absence to justify and the overdue installment
    When the parent switches to Youssef's view
    Then only Youssef's data is shown, in School A's context

  Scenario: An adult student has restricted parental access to school data
    Given a parent whose child Salma, having turned 18, has restricted parental access to school data
    And that parent still being the financial guardian and the payer
    When the parent opens their dashboard
    Then Salma's card hides grades, attendance, and disciplinary data with the note "access restricted by the student"
    And Salma's financial due date and balance stay visible
