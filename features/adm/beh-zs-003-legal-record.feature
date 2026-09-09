@REQ-ZS-007 @BEH-ZS-003 @mvp
Feature: School legal record

  Scenario: Completeness checked before issuing an official document (MVP)
    Given a school record whose ICE and stamp are filled in but whose authorization number is missing
    When the front office attempts to issue a certificate of enrollment
    Then the system flags the missing mandatory field on the record and on the document header
    And once entered, the change to the authorization number is logged with author, timestamp, and before/after value
