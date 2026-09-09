@REQ-ZS-201 @BEH-ZS-232 @v1
Feature: Tracking the 8-hour weekly cap without cross-school leakage (V1)

  Scenario: The total is visible only to the teacher
    Given Hassan, an external public-sector teacher, assigned 6 hours a week at School A
    And 2 hours a week at School B
    And 4 hours self-declared at his originating public school
    When School C's leadership records a 2-hour weekly assignment for Hassan
    Then Hassan sees a total of 14 hours over an 8-hour cap in his own area and receives the non-blocking alert
    And School C sees only its 2 hours and learns neither the existence nor the volume of the affiliations at schools A and B
    And recording stays possible with a logged justification (ZSchool does not block it)

  Scenario: A binary alert to the school on the teacher's consent
    Given Hassan, having checked "share the cap-exceeded alert with my schools"
    When School C records the assignment that crosses the cap
    Then School C receives the alert "8-hour cap exceeded across all affiliations combined", with no volume or list of schools
    And the justification entered by School C is logged

  Scenario: Without consent, no signal to the school
    Given Hassan not having consented to sharing the total
    When School C records an assignment that crosses the cap
    Then only Hassan receives the alert and School C observes no difference from an ordinary assignment
