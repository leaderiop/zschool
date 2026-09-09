@REQ-ZS-103 @BEH-ZS-115 @mvp
Feature: Period closing and entry locking
  Scenario: Closing with a compliance warning and no blocking (MVP)
    Given a 2AC class in semester 1 of the 2026-2027 school year
    And the "Mathematics" subject has only one class test and no unified exam
    When the director starts the semester-1 closing for this class
    Then closing proceeds and a warning lists the apparent gaps subject by subject
    And the period's grades are locked once closing completes

  Scenario: Closing and locking entries
    Given a class whose assessments for the period are all entered
    And the director confirms the semester-1 closing
    When the closing is recorded
    Then all assessments and grades for the period become read-only for teachers
    And teachers and the school leadership receive the period-closing notification
    And any further edit attempt is refused with a pointer to the unlock procedure

  Scenario: Traced exceptional unlock
    Given a closed period and an entry error reported by a teacher
    When the director reopens the period with a stated reason
    Then the action is logged with author, reason and timestamp
    And the edited grades are locked again at re-closing
