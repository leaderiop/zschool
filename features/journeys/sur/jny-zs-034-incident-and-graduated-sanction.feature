@REQ-ZS-308 @JNY-ZS-034 @v1
Feature: Incident and graduated sanction under disciplinary confidentiality

  Scenario: recording an incident and notifying guardians (V1)
    Given an incident reported by a teacher concerning a 1st-year baccalaureate student
    And the school's sanction scale is configured from a written warning to a disciplinary-council appearance
    When Rachid records the incident with date, place, severity, and a factual description
    Then the incident is linked to the student's enrollment and invisible outside the school
    And the legal guardians and the holder of custody, per their rights, are notified
    And Rachid's viewing of the incident is logged with author, context, and timestamp
    When a written warning is issued as the first sanction
    Then the sanction is recorded with type, duration, and decision, and notified to authorized recipients

  Scenario: disciplinary council and permanent expulsion (V1)
    Given a file of repeated incidents and exhausted graduated sanctions for a student
    And the parents summoned with a tracked summons and a read receipt
    When the disciplinary council pronounces a permanent expulsion and the decision is recorded
    Then the enrollment moves from ACTIVE status to EXPELLED status with a reason and date
    And no disciplinary mention appears on the leaving certificate or any official document
    And official documents stay issued even in the presence of arrears
