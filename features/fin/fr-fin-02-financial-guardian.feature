@BEH-ZS-172 @REQ-ZS-146 @mvp
Feature: Financial guardian, third-party payer, and FinancialAccount

  Scenario: Every enrollment gets exactly one FinancialAccount
    Given a school with an active enrollment
    Then the enrollment has exactly one FinancialAccount

  Scenario: A financial guardian is designated and later changed, with each change traced
    Given a school with an active enrollment and its legal guardian on file
    When the director designates the guardian as financial guardian
    And the director later designates a different guardian on file as financial guardian
    Then the current financial guardian is the most recently designated one
    And both designations remain in the trace

  Scenario: A third party with no parental relationship is designated financial guardian
    Given a school with an active enrollment
    When the director registers a third-party payer as financial guardian
    Then the third party carries only the financial-guardian quality and no academic access

  Scenario: Financial responsibility is split by percentage across two payers
    Given a school with an active enrollment and two guardians on file
    When the director splits financial responsibility 60 percent and 40 percent between the two guardians
    Then the account's payer split totals 100 percent across both guardians

  Scenario: A percentage split that does not total 100 is refused
    Given a school with an active enrollment and its legal guardian on file
    When the director tries to split financial responsibility with a single 60 percent share
    Then the split is refused
