@REQ-ZS-188 @BEH-ZS-208 @mvp
Feature: Massar reference of a transfer (MVP)
  Scenario: Validation possible without a Massar reference
    Given a file "consent recorded" whose family has not yet obtained the provincial decision
    When the origin school's leadership validates the checklist leaving the reference blank
    Then the file moves to status "validated by the origin" with the note "Massar reference pending"
    And the file appears in the list of transfers without a reference

  Scenario: Later entry of the reference and the document
    Given a file activated without a Massar reference
    When the front office enters the reference and attaches the scanned document provided by the family
    Then the reference and document are recorded with author and timestamp
    And the "pending" note disappears without changing the enrollment's state
