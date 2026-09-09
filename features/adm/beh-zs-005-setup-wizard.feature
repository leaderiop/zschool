@REQ-ZS-009 @BEH-ZS-005 @mvp
Feature: Full onboarding of a new school

  Scenario: Putting a 300-student primary school into production
    Given a tenant created by ZSchool with the Moroccan national structure template
    And an invited and activated director-administrator
    When the director completes the wizard: school year 2026-2027, two semesters, default national grading scales, initial fee schedule
    And imports the student and guardian file (each student with a legal guardian and a financial guardian) with no blocking error, and assigns students to classes
    Then the imported enrollments are activated via import with a "data catch-up" trace
    And the production-readiness checklist shows all steps complete
    And an enrollment can be created at the front desk and a roll call can be taken as early as the next day
    And the usage statement counts active students at the next monthly checkpoint

  Scenario: Resuming after an interruption
    Given a wizard interrupted after the "evaluation periods" step
    When the director logs back in
    Then the wizard resumes at the next step without losing the saved choices
