@REQ-ZS-279 @JNY-ZS-005 @mvp @v1
Feature: Period closings and report cards

  Scenario: Compliance warning before closing (MVP)
    Given a class where one subject counts only one assessment for the semester
    When the site director reviews the pre-closing compliance table
    Then the subject is flagged as non-compliant with the framework (minimum of two assessments per subject per semester)
    And an alert is sent to the teacher concerned
    And closing remains possible, with the warning historized alongside the closing

  Scenario: Blocking compliance check at closing (V1)
    Given a class where one subject remains non-compliant with the framework at the closing date
    When the site director starts closing the period
    Then closing is blocked as long as the subject remains non-compliant
    And only a logged, reasoned exception from leadership allows closing

  Scenario: Locking grades at closing (MVP)
    Given a period closed by the site director
    When a teacher tries to edit a grade from that period
    Then the edit is refused
    And the closing event is logged with author and timestamp
    And any corrections go through the report card's new-version procedure

  Scenario: Bulk publication and immutability (MVP)
    Given the generated and validated report cards for a school the size of the group
    When the general director publishes the period's report cards
    Then every published report card is fixed with a version, fingerprint, signatory, and date
    And families receive an in-app and SMS publication notification in their language
    And any later correction creates a new version while the old one stays viewable marked "superseded"

  Scenario: QR verification of a printed report card (V1)
    Given a report card published in V1 carrying a verification QR code
    When a third party scans the code
    Then the public page confirms the document's authenticity and current version
