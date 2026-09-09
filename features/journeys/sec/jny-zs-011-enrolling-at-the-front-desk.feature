@REQ-ZS-290 @JNY-ZS-011 @mvp
Feature: Enrolling a new student at the front desk

  Scenario: Complete enrollment in a single pass (MVP)
    Given an active school for the 2026-2027 year with a published fee schedule
    And a parent at the front desk carrying their son's birth certificate and vaccination record
    When the secretary creates the enrollment: identity in both scripts, father and mother as legal guardians, father as financially responsible, level 2AP, a class with places, a ten-month payment schedule, acceptances recorded, deposit collected
    Then the enrollment moves to the ACTIVE state
    And a Law 59.21 parent contract is generated from the fee schedule, electronically accepted by the tutor, archived in the file, and a copy given to the parents
    And the enrollment certificate, a numbered receipt, and a bilingual student record are produced immediately
    And each guardian receives an invitation code by SMS on their own number

  Scenario: A guardian already known on the platform (MVP)
    Given a father with a ZSchool account for a child enrolled at another school
    When the secretary enters his mobile number for the enrollment of his second child
    Then the system offers linking to the existing account and creates no new guardian
    And the father sees both his children from a single account after enrollment

  Scenario: Strong match by Massar code (MVP)
    Given a student profile existing on the platform carrying Massar code "X123456789"
    When the secretary enters this code during a new enrollment
    Then the system offers linking to the existing identity instead of creating a duplicate
    And no linking happens without the secretary's confirmation

  Scenario: Incomplete guardians rejected (MVP)
    Given an enrollment entry with no active legal guardian
    When the secretary tries to move the enrollment to the ACTIVE state
    Then the system refuses the transition and shows the missing item (legal guardian, financially responsible parent)
    And the enrollment stays at the PRE-ENROLLED state with the file and documents already entered kept
