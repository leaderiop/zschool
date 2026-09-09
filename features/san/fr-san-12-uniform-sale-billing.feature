@REQ-ZS-005 @BEH-ZS-292 @v2
Feature: Billed uniform sale

  Scenario: A front-desk purchase collected in cash
    Given a catalog with the item "Blazer, size M"
    When the front office records a sale of two items collected in cash
    Then a conforming invoice is issued, continuously numbered, with the mandatory mentions
    And the receipt is handed over and sent to the parent
    And the sale is tied to the day's cash session
