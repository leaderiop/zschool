@REQ-ZS-230 @BEH-ZS-265 @mvp
Feature: Validation report before submission

  Scenario: Reasoned confirmation of warnings
    Given a validation report with only warnings (three students with no Massar code)
    When leadership opens the report then confirms submission with a stated reason
    Then the file is released for download
    And the reason, author, and timestamp are kept in the export log

  Scenario: No download without validation
    Given a generated student-list export
    When a user attempts to download the final file without going through the report screen
    Then the download is refused and the interface redirects to the validation report
