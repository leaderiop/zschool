@REQ-ZS-126 @BEH-ZS-143 @v1
Feature: Exit file to a non-ZSchool school

  Scenario: Access by secure link before expiry
    Given a student transferred to a school outside ZSchool
    And a secure link generated with a 30-day validity period
    When the recipient opens the link before it expires
    Then the bilingual exit-file PDF displays and downloads with no ZSchool account
    And the access is logged with date, time and result

  Scenario: Expired or revoked link
    Given a secure link that expired 5 days ago
    When the recipient opens the link
    Then the page shows an expiry message with no content from the file
    And the issuing school can generate a new link from the exit file
    And the old link stays unusable
