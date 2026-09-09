@REQ-ZS-501 @UX-ZS-013 @mvp
Feature: Bilingual interface with full RTL

  Scenario: Switching to Arabic
    Given a parent using the interface in French
    When they choose Arabic in their settings
    Then the entire interface is rendered in Arabic with no perceptible reload
    And the layout is fully mirrored: navigation, alignment, tables, directional icons
    And their choice is remembered for future sessions on every device, without changing the language of other accounts used on the same phone

  Scenario: Latin content in an Arabic interface
    Given a parent using the interface in Arabic
    When they view the record of a student whose name exists only in Latin script
    Then the name is displayed with no character reversal or truncation
    And phone numbers and amounts remain displayed in readable 0-9 digits
