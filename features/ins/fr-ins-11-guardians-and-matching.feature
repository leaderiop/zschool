@REQ-ZS-034 @BEH-ZS-031 @mvp
Feature: Guardians and matching (MVP)

  Scenario: A parent already known at another school
    Given Ahmed, holder of an account identified by +212661234567, guardian of Youssef and Sara at School A
    When School B enters a guardian "Ahmed" with this same number for Adam's enrollment
    Then the system offers linking to Ahmed's existing account and refuses to create a second account
    And after confirmation, Ahmed sees Adam from his single account alongside Youssef and Sara

  Scenario: Two guardians, one mobile number
    Given a father and mother reachable on the same mobile number
    When the front office records both guardians
    Then the father is identified by the mobile number and the mother receives a generated login identifier with the household's mobile number as a shared contact
    And each has their own account and their own qualities
