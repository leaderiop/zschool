@REQ-ZS-426 @SEC-ZS-019 @v1
Feature: A school leaving the network

  Scenario: Termination and full export
    Given a school whose subscription is terminated
    When the platform closes the subscription
    Then a full export of data and documents is provided to the school in an open format
    And the school's access switches to read-only for 90 days
    And operational data is deleted 12 months after termination
    And individuals retain their global identity and access to their published documents
