@REQ-ZS-171 @BEH-ZS-189 @mvp
Feature: WhatsApp tariff switch of October 1, 2026

  Scenario: Billable inbound reply after the switch
    Given the tariff-switch parameter activated on 01/10/2026
    And a parent who replied to a utility notification on 02/10/2026
    When the inbound reply is received
    Then it counts toward the school's WhatsApp costs
    And it appears in delivery tracking, linked to the original notification

  Scenario: A utility template re-categorized by the platform
    Given a utility template whose category is changed to marketing while sending
    When the platform detects the re-categorization
    Then the template's send is suspended, the school leadership is alerted, and the SMS fallback is triggered for the affected recipients
