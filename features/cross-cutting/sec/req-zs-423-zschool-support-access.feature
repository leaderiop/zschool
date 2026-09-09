@REQ-ZS-423 @SEC-ZS-009 @mvp
Feature: ZSchool support access to a school

  Scenario: Support intervention on a ticket
    Given a support ticket opened by School A's principal's office
    When a ZSchool support agent obtains temporary access to Tenant A
    Then access is bounded to the ticket's scope, purpose, and duration
    And every view and write by the agent is logged with their identity
    And the school's principal's office is notified when access is granted and when it closes
    And access is revoked automatically when the ticket closes

  Scenario: Access attempt outside a procedure
    Given a support agent with no active ticket on School B
    When they attempt to open a student record at School B
    Then access is denied
    And the attempt is logged and visible in the audit log
