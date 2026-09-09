@REQ-ZS-040 @BEH-ZS-037 @mvp
Feature: Immediate enrollment documents (MVP)

  Scenario: Issuance at the front desk in one pass
    Given an enrollment entered at the front desk with the deposit collected
    When the front office confirms the wizard's last step
    Then the bilingual pre-enrollment certificate, the receipt numbered in a continuous sequence, and the student record are generated as PDFs in under 3 seconds
    And they are sent to the legal guardian on their mobile channel and remain downloadable from the file
