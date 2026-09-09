@REQ-ZS-037 @BEH-ZS-034 @mvp
Feature: Creating an enrollment (MVP)

  Scenario: Mid-year enrollment with an effective date
    Given a student arriving on January 12, 2027 into a 5AP class with a capacity of 30 already holding 29 students
    When the front office creates the enrollment with an effective date of 12/01/2027 and assigns it to this class
    Then the enrollment is created PRE-ENROLLED, and the class now has 30 students
    And the student's attendance counters start on 12/01/2027

  Scenario: Capacity overrun referred to the director
    Given a class with a capacity of 30, already full
    When the front office attempts to assign an additional student to it
    Then the assignment is blocked pending the director's documented approval, which is logged
