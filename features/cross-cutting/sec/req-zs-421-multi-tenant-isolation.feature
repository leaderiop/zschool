@REQ-ZS-421 @SEC-ZS-012 @mvp
Feature: Multi-tenant isolation

  Scenario: Direct access to a record from another school
    Given a registrar authenticated at School A
    When they request the direct address of a student record at School B
    Then the server denies access without confirming the record's existence
    And the attempt is logged with its author and context

  Scenario: Consolidated view of a school group
    Given a group administrator attached to Schools A and B
    When they view their organization's consolidated dashboard
    Then they see only the intended consolidated views and never a school's data outside their organization
