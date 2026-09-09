@REQ-ZS-010 @BEH-ZS-006 @mvp
Feature: Bulk import with error report

  Scenario: Importing a student file containing duplicates and errors
    Given a file of 320 students, 4 of whom are already on the platform by Massar code
    And 3 invalid rows: an unreadable date of birth, a non-existent class, a guardian with no phone number
    When the front office uploads the file and requests analysis
    Then the report distinguishes 313 creatable rows and 4 proposed strong matches, none enforced
    And 3 rows in error with a reason for each
    And no record is written before explicit commit
    When the front office corrects and excludes the 3 error rows, then commits the import
    Then 313 profiles are created, 4 matches are proposed for validation
    And a downloadable report is archived and the operation is logged

  Scenario: Replay without creating duplicates
    Given an import already committed for a given file
    When the same file is submitted again
    Then the already-imported rows are recognized and offered for matching, never duplicated

  Scenario: Mid-year catch-up for a pilot (MVP)
    Given a school activated on 01/02/2027 with 800 students enrolled since September 2026
    And a finance file carrying, for each student, the September-to-January installments already paid and two post-dated cheques on hand
    When the director commits the student, guardian, finance, and first-semester grade imports
    Then each student receives an ACTIVE enrollment activated via import with an effective date of 07/09/2026
    And their payment schedule shows the five installments paid and the five remaining ones due
    And the cheques on hand appear in cheque tracking with their due dates
    And first-semester grades marked "published" are visible to families, the others remain in draft

  Scenario: Guardian already known to the platform
    Given an existing parent account carrying mobile number +212661234567 at School A
    When School B imports a guardian with this same number
    Then the system offers matching to the existing account and creates no second account
    And two rows of the same file carrying this number are merged into a single guardian before commit
