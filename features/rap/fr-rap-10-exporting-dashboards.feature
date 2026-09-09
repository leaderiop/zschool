@REQ-ZS-220 @BEH-ZS-250 @mvp
Feature: Exporting dashboards

  Scenario: Exporting the filtered unpaid-balance status
    Given a principal viewing the 2026-2027 unpaid balances for the October period
    When they request the Excel export then the PDF export of the current view
    Then each produced file exactly reflects the filtered scope (year, period, breakdown by class and by guardian)
    And the PDF file carries the school's bilingual header, the production date and time, and the author's name
    And no student outside the author's permission scope appears in the file
