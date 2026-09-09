@REQ-ZS-359 @JNY-ZS-074 @mvp
Feature: Restricting a parent's access on a court ruling

  Scenario: Recording a partial restriction
    Given an active student whose father and mother are active legal guardians
    And a court ruling restricting the father's access to school and disciplinary data only
    When leadership records the ruling with the ruling attached and an effective date of the same day
    Then the father's relationship is adjusted from the effective date: grades, absences, and report cards no longer show in his portal
    And his other rights not covered by the ruling, including financial access if he is financially responsible, remain
    And the recording appears in the audit log with the author, timestamp, and attachment reference
    And the father and mother are notified of the restriction, its scope, and its reference
    And the other school where the student is enrolled is notified and must record the ruling in turn to apply it

  Scenario: Refusing to record with no attachment
    Given leadership wanting to restrict a parent's access
    When it validates the restriction with no attachment
    Then the system refuses the recording and shows that a supporting document is mandatory
    And no parent's rights are changed
    And the refused attempt is logged in the audit log

  Scenario: Lifting a restriction on a new ruling
    Given an access restriction recorded on the father's relationship
    When leadership records a new court ruling lifting the restriction
    Then the father's default rights are restored at the new ruling's effective date
    And the full history of restrictions and lifts stays viewable with their supporting documents

  Scenario: No restriction outside a court ruling
    Given a conflict between the two parents with no ruling submitted
    When a staff member or a parent tries to remove the other parent's information rights
    Then no such action exists in the interface for this purpose
    And the conflict is flagged to the school per journey JNY-ZS-075
