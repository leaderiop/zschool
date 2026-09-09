@REQ-ZS-370 @JNY-ZS-083 @mvp @v1
Feature: Report-card publication and notifying the student and guardians

  Scenario: Immediate notification and viewing (QR in V1)
    Given Youssef's first-semester report card published and locked by leadership
    When publication happens
    Then Youssef and his legal guardians and the holder of custody receive a notification within a short delay (in-app and SMS in MVP)
    And the report card viewed carries its version, fingerprint, signatory, date, and, in V1, a verification QR code
    And the report card opens in under 3 seconds

  Scenario: A correction after publication
    Given the first-semester report card already published
    When leadership publishes a corrected version
    Then a new version is created and notified
    And the old version stays viewable marked "superseded"
    And each version keeps its distinct fingerprint and, in V1, its distinct QR code
